import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

const InstituteContext = createContext();

const STORAGE_KEY_INSTITUTES = 'signalschool_institutes_data';
const STORAGE_KEY_ACTIVE_INST = 'signalschool_active_institute_id';
const STORAGE_KEY_CURRENT_ROLE = 'signalschool_current_role';

const DUMMY_INSTITUTE_IDS = ['inst_apex', 'inst_horizon', 'inst_crestwood'];
const INITIAL_INSTITUTES = [];

export const InstituteProvider = ({ children }) => {
  const [institutes, setInstitutes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INSTITUTES) || localStorage.getItem('continuum_institutes_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Exclude dummy test institutes
        const cleaned = (Array.isArray(parsed) ? parsed : []).filter(
          inst => !DUMMY_INSTITUTE_IDS.includes(inst?.id)
        );
        return cleaned;
      }
    } catch (e) {
      console.error('Failed to parse stored institutes', e);
    }
    return INITIAL_INSTITUTES;
  });

  const [activeInstituteId, setActiveInstituteId] = useState(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY_ACTIVE_INST) || localStorage.getItem('continuum_active_institute_id');
      if (storedId && !DUMMY_INSTITUTE_IDS.includes(storedId)) return storedId;
    } catch (e) {}
    return null;
  });

  // Current preview role: 'super-admin' | 'institute-admin' | 'member'
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEY_CURRENT_ROLE) || localStorage.getItem('continuum_current_role');
      if (storedRole) return storedRole;
    } catch (e) {}
    return 'super-admin';
  });

  // Real-time synchronization with Firestore institutes collection
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const institutesColRef = collection(db, 'institutes');
    const unsubscribe = onSnapshot(institutesColRef, (snapshot) => {
      if (!snapshot.empty) {
        const remoteList = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data && !DUMMY_INSTITUTE_IDS.includes(docSnap.id)) {
            remoteList.push({ id: docSnap.id, ...data });
          }
        });
        if (remoteList.length > 0) {
          setInstitutes(remoteList);
          try {
            localStorage.setItem(STORAGE_KEY_INSTITUTES, JSON.stringify(remoteList));
          } catch (e) {}
        }
      }
    }, (error) => {
      console.warn('Firestore institutes onSnapshot error:', error);
    });

    // Also push local institutes up to Firestore if Firestore document collection is empty
    const syncLocalToFirestore = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_INSTITUTES);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            for (const inst of parsed) {
              if (inst?.id && !DUMMY_INSTITUTE_IDS.includes(inst.id)) {
                await setDoc(doc(db, 'institutes', inst.id), {
                  ...inst,
                  serverUpdatedAt: serverTimestamp()
                }, { merge: true });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error syncing local institutes to Firestore:', err);
      }
    };
    syncLocalToFirestore();

    return () => unsubscribe();
  }, []);

  // Sync state to local storage backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INSTITUTES, JSON.stringify(institutes));
    } catch (e) {}
  }, [institutes]);

  useEffect(() => {
    try {
      if (activeInstituteId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_INST, activeInstituteId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_INST);
      }
    } catch (e) {}
  }, [activeInstituteId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_ROLE, currentRole);
    } catch (e) {}
  }, [currentRole]);

  // Current active institute data
  const currentInstitute = institutes.find(inst => inst.id === activeInstituteId) || institutes[0] || null;

  // Super Admin Action: Create new Institute & its designated Admin Account
  const createInstitute = ({
    name,
    slug,
    planName,
    maxSeats,
    domain,
    contractEnd,
    adminName,
    adminEmail,
    adminPassword
  }) => {
    const cleanName = (name || '').trim();
    if (!cleanName) return null;

    const cleanSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '') || 'campus';
    const cleanDomain = domain ? domain.trim().toLowerCase() : `${cleanSlug}.edu`;
    const cleanAdminEmail = (adminEmail || `admin@${cleanDomain}`).trim().toLowerCase();
    const cleanAdminPassword = (adminPassword || 'admin123').trim();
    const cleanAdminName = (adminName || `${cleanName} Admin`).trim();

    const newInst = {
      id: 'inst_' + Date.now().toString(36),
      name: cleanName,
      slug: cleanSlug,
      planName: planName || 'Campus Enterprise Pack',
      maxSeats: Number(maxSeats) || 100,
      seatsUsed: 0,
      domain: cleanDomain,
      status: 'active',
      contractEnd: contractEnd || '2027-12-31',
      adminName: cleanAdminName,
      adminEmail: cleanAdminEmail,
      adminPassword: cleanAdminPassword,
      inviteToken: `${cleanSlug}-${Math.random().toString(36).substring(2, 7)}`,
      members: []
    };

    setInstitutes(prev => {
      const updated = [newInst, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_INSTITUTES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setActiveInstituteId(newInst.id);

    // Save directly to Firestore
    if (isFirebaseConfigured) {
      setDoc(doc(db, 'institutes', newInst.id), {
        ...newInst,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp()
      }).catch(err => console.warn('Failed to save institute to Firestore:', err));
    }

    return newInst;
  };

  // Super Admin Action: Update Quota or details
  const updateInstitute = (id, updates) => {
    setInstitutes(prev => {
      const updated = prev.map(inst => {
        if (inst.id === id) {
          return { ...inst, ...updates };
        }
        return inst;
      });
      try {
        localStorage.setItem(STORAGE_KEY_INSTITUTES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isFirebaseConfigured) {
      setDoc(doc(db, 'institutes', id), {
        ...updates,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Failed to update institute in Firestore:', err));
    }
  };

  // Super Admin Action: Delete Institute
  const deleteInstitute = (id) => {
    setInstitutes(prev => {
      const remaining = prev.filter(inst => inst.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_INSTITUTES, JSON.stringify(remaining));
      } catch (e) {}
      return remaining;
    });

    if (isFirebaseConfigured) {
      deleteDoc(doc(db, 'institutes', id)).catch(err => console.warn('Failed to delete institute in Firestore:', err));
    }

    if (activeInstituteId === id) {
      const remaining = institutes.filter(inst => inst.id !== id);
      if (remaining.length > 0) {
        setActiveInstituteId(remaining[0].id);
      }
    }
  };

  // Institute Admin Action: Add Student / Faculty
  const addMember = (instituteId, { name, email, role = 'Student', password = 'campus123' }) => {
    let newMember = null;
    let updatedInstitute = null;

    setInstitutes(prev => {
      const updated = prev.map(inst => {
        if (inst.id === instituteId) {
          newMember = {
            id: 'm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: role,
            password: (password || 'campus123').trim(),
            joinedAt: new Date().toISOString().split('T')[0],
            status: 'Active'
          };

          updatedInstitute = {
            ...inst,
            seatsUsed: (inst.seatsUsed || 0) + 1,
            members: [newMember, ...(inst.members || [])]
          };
          return updatedInstitute;
        }
        return inst;
      });

      try {
        localStorage.setItem(STORAGE_KEY_INSTITUTES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isFirebaseConfigured && updatedInstitute) {
      setDoc(doc(db, 'institutes', instituteId), {
        seatsUsed: updatedInstitute.seatsUsed,
        members: updatedInstitute.members,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Failed to sync member to Firestore:', err));
    }

    return newMember;
  };

  // Institute Admin Action: Remove / Revoke Member
  const removeMember = (instituteId, memberId) => {
    let updatedInstitute = null;

    setInstitutes(prev => {
      const updated = prev.map(inst => {
        if (inst.id === instituteId) {
          const filtered = (inst.members || []).filter(m => m.id !== memberId);
          updatedInstitute = {
            ...inst,
            seatsUsed: Math.max(0, (inst.seatsUsed || 1) - 1),
            members: filtered
          };
          return updatedInstitute;
        }
        return inst;
      });

      try {
        localStorage.setItem(STORAGE_KEY_INSTITUTES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isFirebaseConfigured && updatedInstitute) {
      setDoc(doc(db, 'institutes', instituteId), {
        seatsUsed: updatedInstitute.seatsUsed,
        members: updatedInstitute.members,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Failed to sync member removal to Firestore:', err));
    }
  };

  // Institute Admin Action: Regenerate Invite Token
  const regenerateInviteToken = (instituteId) => {
    const newToken = `${currentInstitute?.slug || 'lab'}-${Math.random().toString(36).substring(2, 8)}`;
    updateInstitute(instituteId, { inviteToken: newToken });
    return newToken;
  };

  // Student action: Join via token
  const joinViaToken = (token, studentName, studentEmail, password = 'campus123') => {
    const cleanToken = (token || '').trim();
    const targetInst = institutes.find(inst => inst.inviteToken === cleanToken);
    if (!targetInst) {
      return { success: false, error: 'Invalid or expired institutional invite token.' };
    }

    if (targetInst.seatsUsed >= targetInst.maxSeats) {
      return {
        success: false,
        error: `Seat license quota (${targetInst.maxSeats}) has been fully reached for ${targetInst.name}. Contact your campus administrator to expand seats.`
      };
    }

    // Check if already registered on this campus
    const existing = (targetInst.members || []).find(
      m => m.email.toLowerCase() === studentEmail.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, error: 'An account with this email is already enrolled on this campus roster.' };
    }

    const newMember = addMember(targetInst.id, {
      name: studentName,
      email: studentEmail,
      role: 'Student',
      password: password || 'campus123'
    });

    if (newMember) {
      setActiveInstituteId(targetInst.id);
      setCurrentRole('member');
      return { success: true, institute: targetInst, member: newMember };
    }
    return { success: false, error: 'Failed to claim seat.' };
  };

  // Reset data
  const resetToDefaultData = () => {
    setInstitutes([]);
    setActiveInstituteId(null);
    localStorage.removeItem(STORAGE_KEY_INSTITUTES);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_INST);
    if (isFirebaseConfigured) {
      for (const inst of institutes) {
        deleteDoc(doc(db, 'institutes', inst.id)).catch(console.warn);
      }
    }
  };

  return (
    <InstituteContext.Provider
      value={{
        institutes,
        activeInstituteId,
        setActiveInstituteId,
        currentInstitute,
        currentRole,
        setCurrentRole,
        createInstitute,
        updateInstitute,
        deleteInstitute,
        addMember,
        removeMember,
        regenerateInviteToken,
        joinViaToken,
        resetToDefaultData
      }}
    >
      {children}
    </InstituteContext.Provider>
  );
};

export const useInstitute = () => {
  const context = useContext(InstituteContext);
  if (!context) {
    throw new Error('useInstitute must be used within an InstituteProvider');
  }
  return context;
};
