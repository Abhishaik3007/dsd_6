import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured, createFirebaseUserAccount } from '../lib/firebase';
import { isDateExpired } from '../utils/subscriptionUtils';
import { getStoredContractTiers, saveStoredContractTiers, DEFAULT_CONTRACT_TIERS, INDIVIDUAL_PLANS } from '../utils/tierConfig';

const InstituteContext = createContext();

const STORAGE_KEY_INSTITUTES = 'signalschool_institutes_data';
const STORAGE_KEY_ACTIVE_INST = 'signalschool_active_institute_id';
const STORAGE_KEY_CURRENT_ROLE = 'signalschool_current_role';
const STORAGE_KEY_INDIVIDUAL_PLANS = 'signalschool_individual_plans';

const DUMMY_INSTITUTE_IDS = ['inst_apex', 'inst_horizon', 'inst_crestwood'];
const INITIAL_INSTITUTES = [];

export const InstituteProvider = ({ children }) => {
  const [contractTiers, setContractTiers] = useState(() => getStoredContractTiers());
  const [individualPlans, setIndividualPlans] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INDIVIDUAL_PLANS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
    return INDIVIDUAL_PLANS;
  });
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

  // Real-time synchronization for contract_tiers collection in Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const tiersColRef = collection(db, 'contract_tiers');

    const unsubscribe = onSnapshot(tiersColRef, async (snapshot) => {
      if (!snapshot.empty) {
        const remoteTiers = [];
        snapshot.forEach(docSnap => {
          remoteTiers.push({ id: docSnap.id, ...docSnap.data() });
        });
        setContractTiers(remoteTiers);
        saveStoredContractTiers(remoteTiers);
      } else {
        // Firestore is empty — seed with defaults
        try {
          const batch = writeBatch(db);
          DEFAULT_CONTRACT_TIERS.forEach(tier => {
            const tierRef = doc(tiersColRef, tier.id);
            batch.set(tierRef, { ...tier, serverCreatedAt: serverTimestamp(), serverUpdatedAt: serverTimestamp() });
          });
          await batch.commit();
          console.info('contract_tiers collection seeded with defaults.');
        } catch (seedErr) {
          console.warn('Failed to seed contract_tiers:', seedErr);
        }
      }
    }, (err) => {
      console.warn('Failed to listen to contract_tiers from Firestore:', err);
    });

    return () => unsubscribe();
  }, []);

  // Real-time synchronization for individual_tiers collection in Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const indivColRef = collection(db, 'individual_tiers');

    const unsubscribe = onSnapshot(indivColRef, async (snapshot) => {
      if (!snapshot.empty) {
        const remotePlans = [];
        snapshot.forEach(docSnap => {
          remotePlans.push({ id: docSnap.id, ...docSnap.data() });
        });
        setIndividualPlans(remotePlans);
        try {
          localStorage.setItem('signalschool_individual_plans', JSON.stringify(remotePlans));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('signalschool_individual_plans_updated', { detail: remotePlans }));
          }
        } catch (_) {}
      } else {
        // Firestore is empty — seed with defaults
        try {
          const batch = writeBatch(db);
          INDIVIDUAL_PLANS.forEach(plan => {
            const planRef = doc(indivColRef, plan.id);
            batch.set(planRef, {
              ...plan,
              serverCreatedAt: serverTimestamp(),
              serverUpdatedAt: serverTimestamp()
            });
          });
          await batch.commit();
          console.info('individual_tiers collection seeded with defaults.');
        } catch (seedErr) {
          console.warn('Failed to seed individual_tiers in Firestore:', seedErr);
        }
      }
    }, (err) => {
      console.warn('Failed to listen to individual_tiers from Firestore:', err);
    });

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
  const createInstitute = async ({
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
    const instId = 'inst_' + Date.now().toString(36);

    // 1. Provision the Institute Admin in Firebase Auth directly
    let adminUid = null;
    if (isFirebaseConfigured) {
      try {
        const authResult = await createFirebaseUserAccount({
          email: cleanAdminEmail,
          password: cleanAdminPassword,
          displayName: cleanAdminName
        });
        if (authResult?.uid) {
          adminUid = authResult.uid;
        }
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          console.info(`Notice: Admin account for ${cleanAdminEmail} already exists in Firebase Auth.`);
        } else {
          console.warn('Notice: Could not provision Firebase Auth account for institute admin:', authErr);
        }
      }
    }

    const assignedAdminId = adminUid || 'user_admin_' + instId;

    // 2. Provision Admin profile in Firestore: users/${assignedAdminId}
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'users', assignedAdminId), {
          id: assignedAdminId,
          uid: assignedAdminId,
          name: cleanAdminName,
          email: cleanAdminEmail,
          role: 'institute-admin',
          roleLabel: 'Institute Admin',
          instituteId: instId,
          instituteName: cleanName,
          redirectTab: 'admin',
          status: 'Active',
          avatarLetter: cleanName.charAt(0).toUpperCase() || 'A',
          badgeColor: 'bg-[#203247] text-[#f6f3eb] border-[#203247]',
          isRegistered: true,
          createdAt: new Date().toISOString(),
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp()
        }, { merge: true });
      } catch (userErr) {
        console.warn('Notice: Could not write admin user profile to Firestore:', userErr);
      }
    }

    const matchedTier = contractTiers.find(t => t.id === planName || t.name === planName);
    const resolvedSeats = (maxSeats !== undefined && maxSeats !== null && String(maxSeats).trim() !== '')
      ? Number(maxSeats)
      : (matchedTier?.defaultSeats || 100);

    const newInst = {
      id: instId,
      name: cleanName,
      slug: cleanSlug,
      planName: planName || 'Campus Enterprise Pack',
      maxSeats: resolvedSeats,
      seatsUsed: 0,
      domain: cleanDomain,
      status: 'active',
      contractEnd: contractEnd || '2027-12-31',
      adminName: cleanAdminName,
      adminEmail: cleanAdminEmail,
      adminPassword: cleanAdminPassword,
      adminUid: assignedAdminId,
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

    // Save directly to Firestore institutes collection
    if (isFirebaseConfigured) {
      setDoc(doc(db, 'institutes', newInst.id), {
        ...newInst,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp()
      }).catch(err => console.warn('Failed to save institute to Firestore:', err));
    }

    return newInst;
  };

  // Tier Management Actions
  const createContractTier = (tierData) => {
    const cleanName = (tierData.name || '').trim() || 'Custom Tier';
    const newTier = {
      id: cleanName,
      name: cleanName,
      badge: (tierData.badge || 'Custom Tier').trim(),
      defaultSeats: Number(tierData.defaultSeats) || 100,
      priceEstimate: (tierData.priceEstimate || '₹9,90,000 / yr').trim(),
      billingCycle: (tierData.billingCycle || 'Annual License').trim(),
      description: (tierData.description || '').trim(),
      features: Array.isArray(tierData.features)
        ? tierData.features
        : (tierData.features || '').split('\n').map(f => f.trim()).filter(Boolean),
      iconName: tierData.iconName || 'Layers',
      isCustom: true
    };

    setContractTiers(prev => {
      const updated = [...prev, newTier];
      saveStoredContractTiers(updated);
      return updated;
    });

    // Persist to Firestore contract_tiers collection
    if (isFirebaseConfigured) {
      setDoc(doc(db, 'contract_tiers', newTier.id), {
        ...newTier,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp()
      }).catch(err => console.warn('Failed to save tier to Firestore:', err));
    }

    return newTier;
  };

  const updateContractTier = (tierId, updates) => {
    setContractTiers(prev => {
      const updated = prev.map(t => {
        if (t.id === tierId) {
          const parsedFeatures = updates.features !== undefined
            ? (Array.isArray(updates.features)
                ? updates.features
                : updates.features.split('\n').map(f => f.trim()).filter(Boolean))
            : t.features;

          return {
            ...t,
            ...updates,
            defaultSeats: updates.defaultSeats !== undefined ? Number(updates.defaultSeats) : t.defaultSeats,
            features: parsedFeatures
          };
        }
        return t;
      });
      saveStoredContractTiers(updated);
      return updated;
    });

    // Persist update to Firestore
    if (isFirebaseConfigured) {
      const parsedFeatures = updates.features !== undefined
        ? (Array.isArray(updates.features)
            ? updates.features
            : updates.features.split('\n').map(f => f.trim()).filter(Boolean))
        : undefined;
      setDoc(doc(db, 'contract_tiers', tierId), {
        ...updates,
        ...(parsedFeatures !== undefined && { features: parsedFeatures }),
        serverUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Failed to update tier in Firestore:', err));
    }
  };

  const deleteContractTier = (tierId) => {
    setContractTiers(prev => {
      const updated = prev.filter(t => t.id !== tierId);
      saveStoredContractTiers(updated);
      return updated;
    });

    // Remove from Firestore
    if (isFirebaseConfigured) {
      deleteDoc(doc(db, 'contract_tiers', tierId))
        .catch(err => console.warn('Failed to delete tier from Firestore:', err));
    }
  };

  // Update an individual plan's details and sync to Firestore
  const updateIndividualPlan = (planId, updates) => {
    setIndividualPlans(prev => {
      const updated = prev.map(p => {
        if (p.id === planId) {
          const parsedFeatures = updates.features !== undefined
            ? (Array.isArray(updates.features)
                ? updates.features
                : updates.features.split('\n').map(f => f.trim()).filter(Boolean))
            : p.features;
          return { ...p, ...updates, features: parsedFeatures };
        }
        return p;
      });
      try {
        localStorage.setItem(STORAGE_KEY_INDIVIDUAL_PLANS, JSON.stringify(updated));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('signalschool_individual_plans_updated', { detail: updated }));
        }
      } catch (e) {}
      return updated;
    });

    if (isFirebaseConfigured) {
      const parsedFeatures = updates.features !== undefined
        ? (Array.isArray(updates.features)
            ? updates.features
            : updates.features.split('\n').map(f => f.trim()).filter(Boolean))
        : undefined;
      setDoc(doc(db, 'individual_tiers', planId), {
        ...updates,
        ...(parsedFeatures !== undefined && { features: parsedFeatures }),
        serverUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(err => console.warn('Failed to update individual plan in Firestore:', err));
    }
  };


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
  const addMember = async (instituteId, { name, email, role = 'Student', password = 'campus123' }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || 'campus123').trim();

    if (!cleanName) {
      throw new Error('Please enter the user’s full name.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid institutional email address.');
    }
    if (cleanPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long for Firebase Authentication.');
    }

    const targetInst = institutes.find(inst => inst.id === instituteId);
    if (!targetInst) {
      throw new Error('Target institution not found.');
    }

    // Check if email is already enrolled on this campus roster
    const alreadyEnrolled = (targetInst.members || []).some(
      m => m.email && m.email.toLowerCase() === cleanEmail
    );
    if (alreadyEnrolled) {
      throw new Error(`An account for "${cleanEmail}" is already active on this campus roster.`);
    }

    // 1. Provision user directly in Firebase Authentication (using isolated secondary auth instance)
    let firebaseUid = null;
    if (isFirebaseConfigured) {
      try {
        const authResult = await createFirebaseUserAccount({
          email: cleanEmail,
          password: cleanPassword,
          displayName: cleanName
        });
        if (authResult?.uid) {
          firebaseUid = authResult.uid;
        }
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          console.info(`Notice: Account for ${cleanEmail} already registered in Firebase Auth. Enrolling on ${targetInst.name} roster.`);
        } else {
          console.error('Firebase Auth provisioning error:', authError);
          throw authError;
        }
      }
    }

    const assignedId = firebaseUid || 'm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const isFaculty = role.toLowerCase().includes('faculty');

    const newMember = {
      id: assignedId,
      uid: assignedId,
      name: cleanName,
      email: cleanEmail,
      role: role,
      password: cleanPassword,
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    // 2. Provision independent User document in Firestore: users/${assignedId}
    if (isFirebaseConfigured) {
      try {
        const userDocRef = doc(db, 'users', assignedId);
        await setDoc(userDocRef, {
          id: assignedId,
          uid: assignedId,
          name: cleanName,
          email: cleanEmail,
          role: isFaculty ? 'faculty' : 'student',
          roleLabel: role || (isFaculty ? 'Faculty Lead' : 'Student'),
          instituteId: targetInst.id,
          instituteName: targetInst.name,
          redirectTab: 'hub',
          status: 'Active',
          avatarLetter: cleanName.charAt(0).toUpperCase() || 'U',
          badgeColor: isFaculty
            ? 'bg-[#f5dec5] text-[#d97d54] border-[#d97d54]/30'
            : 'bg-[#d9e8df] text-[#347f7a] border-[#347f7a]/30',
          isRegistered: true,
          createdAt: new Date().toISOString(),
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp()
        }, { merge: true });
      } catch (userErr) {
        console.warn('Notice: Could not write users collection profile:', userErr);
      }
    }

    // 3. Update institute roster in local state and Firestore
    let updatedInstitute = null;
    setInstitutes(prev => {
      const updated = prev.map(inst => {
        if (inst.id === instituteId) {
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
      }, { merge: true }).catch(err => console.warn('Failed to sync member to Firestore institutes:', err));
    }

    return newMember;
  };

  // Institute Admin Action: Remove / Revoke Member
  const removeMember = async (instituteId, memberId) => {
    let updatedInstitute = null;

    setInstitutes(prev => {
      const updated = prev.map(inst => {
        if (inst.id === instituteId) {
          const filtered = (inst.members || []).filter(m => m.id !== memberId && m.uid !== memberId);
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

      // Also mark as revoked in users collection
      if (memberId) {
        setDoc(doc(db, 'users', memberId), {
          status: 'Revoked',
          serverUpdatedAt: serverTimestamp()
        }, { merge: true }).catch(() => {});
      }
    }
  };

  // Institute Admin Action: Regenerate Invite Token
  const regenerateInviteToken = (instituteId) => {
    const newToken = `${currentInstitute?.slug || 'lab'}-${Math.random().toString(36).substring(2, 8)}`;
    updateInstitute(instituteId, { inviteToken: newToken });
    return newToken;
  };

  // Student action: Join via token
  const joinViaToken = async (token, studentName, studentEmail, password = 'campus123') => {
    const cleanToken = (token || '').trim();
    const targetInst = institutes.find(inst => inst.inviteToken === cleanToken);
    if (!targetInst) {
      return { success: false, error: 'Invalid or expired institutional invite token.' };
    }

    if (isDateExpired(targetInst.contractEnd) || targetInst.status === 'expired') {
      return {
        success: false,
        error: `Campus Subscription Expired: Access for ${targetInst.name} ended on ${targetInst.contractEnd || 'the contract date'}. New student enrollments are currently closed.`
      };
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

    try {
      const newMember = await addMember(targetInst.id, {
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
    } catch (err) {
      return { success: false, error: err.message || 'Failed to claim seat.' };
    }
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
        contractTiers,
        createContractTier,
        updateContractTier,
        deleteContractTier,
        individualPlans,
        updateIndividualPlan,
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
