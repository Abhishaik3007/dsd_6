import React, { createContext, useContext, useState, useEffect } from 'react';

const InstituteContext = createContext();

const STORAGE_KEY_INSTITUTES = 'continuum_institutes_data';
const STORAGE_KEY_ACTIVE_INST = 'continuum_active_institute_id';
const STORAGE_KEY_CURRENT_ROLE = 'continuum_current_role';

const INITIAL_INSTITUTES = [
  {
    id: 'inst_apex',
    name: 'Apex Institute of Technology',
    slug: 'apex-tech',
    planName: 'Campus Enterprise Pack',
    maxSeats: 300,
    seatsUsed: 142,
    domain: 'apextech.edu.in',
    status: 'active',
    contractEnd: '2027-06-30',
    inviteToken: 'apex-fall-2026',
    members: [
      { id: 'm1', name: 'Dr. Rajesh Sharma', email: 'r.sharma@apextech.edu.in', role: 'Faculty', joinedAt: '2026-08-10', status: 'Active' },
      { id: 'm2', name: 'Prof. Ananya Gupta', email: 'ananya.g@apextech.edu.in', role: 'Faculty', joinedAt: '2026-08-12', status: 'Active' },
      { id: 'm3', name: 'Rohan Verma', email: 'rohan.v@apextech.edu.in', role: 'Student', joinedAt: '2026-08-15', status: 'Active' },
      { id: 'm4', name: 'Sneha Patel', email: 'sneha.p@apextech.edu.in', role: 'Student', joinedAt: '2026-08-16', status: 'Active' },
      { id: 'm5', name: 'Amitabh Sen', email: 'a.sen@apextech.edu.in', role: 'Student', joinedAt: '2026-08-17', status: 'Active' },
      { id: 'm6', name: 'Pooja Iyer', email: 'p.iyer@apextech.edu.in', role: 'Student', joinedAt: '2026-08-18', status: 'Active' },
      { id: 'm7', name: 'Vikram Mehta', email: 'v.mehta@apextech.edu.in', role: 'Student', joinedAt: '2026-08-20', status: 'Active' },
    ]
  },
  {
    id: 'inst_horizon',
    name: 'Horizon Global Academy',
    slug: 'horizon-academy',
    planName: 'University Network Pack',
    maxSeats: 500,
    seatsUsed: 318,
    domain: 'horizon.edu',
    status: 'active',
    contractEnd: '2027-12-31',
    inviteToken: 'horizon-2026-term',
    members: [
      { id: 'h1', name: 'Prof. Marcus Vance', email: 'm.vance@horizon.edu', role: 'Faculty', joinedAt: '2026-07-01', status: 'Active' },
      { id: 'h2', name: 'Elena Rostova', email: 'e.rostova@horizon.edu', role: 'Student', joinedAt: '2026-07-05', status: 'Active' },
      { id: 'h3', name: 'Kavita Chawla', email: 'k.chawla@horizon.edu', role: 'Student', joinedAt: '2026-07-09', status: 'Active' }
    ]
  },
  {
    id: 'inst_crestwood',
    name: 'Crestwood Polytechnic',
    slug: 'crestwood-poly',
    planName: 'Department Lab Pack',
    maxSeats: 100,
    seatsUsed: 84,
    domain: 'crestwood.ac.uk',
    status: 'active',
    contractEnd: '2027-03-15',
    inviteToken: 'crestwood-lab-pass',
    members: [
      { id: 'c1', name: 'Dr. Arthur Pendelton', email: 'a.pendelton@crestwood.ac.uk', role: 'Faculty', joinedAt: '2026-09-01', status: 'Active' },
      { id: 'c2', name: 'Liam Davies', email: 'l.davies@crestwood.ac.uk', role: 'Student', joinedAt: '2026-09-02', status: 'Active' }
    ]
  }
];

export const InstituteProvider = ({ children }) => {
  const [institutes, setInstitutes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INSTITUTES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored institutes', e);
    }
    return INITIAL_INSTITUTES;
  });

  const [activeInstituteId, setActiveInstituteId] = useState(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY_ACTIVE_INST);
      if (storedId) return storedId;
    } catch (e) {}
    return 'inst_apex';
  });

  // Current preview role: 'super-admin' | 'institute-admin' | 'member'
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEY_CURRENT_ROLE);
      if (storedRole) return storedRole;
    } catch (e) {}
    return 'super-admin';
  });

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INSTITUTES, JSON.stringify(institutes));
    } catch (e) {}
  }, [institutes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_INST, activeInstituteId);
    } catch (e) {}
  }, [activeInstituteId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_ROLE, currentRole);
    } catch (e) {}
  }, [currentRole]);

  // Current active institute data
  const currentInstitute = institutes.find(inst => inst.id === activeInstituteId) || institutes[0];

  // Super Admin Action: Create new Institute
  const createInstitute = ({ name, slug, planName, maxSeats, domain, contractEnd }) => {
    const cleanSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '');
    const newInst = {
      id: 'inst_' + Date.now().toString(36),
      name: name.trim(),
      slug: cleanSlug,
      planName: planName || 'Standard Campus Pack',
      maxSeats: Number(maxSeats) || 100,
      seatsUsed: 1, // Institute admin automatically takes 1 seat
      domain: domain ? domain.trim().toLowerCase() : `${cleanSlug}.edu`,
      status: 'active',
      contractEnd: contractEnd || '2027-12-31',
      inviteToken: `${cleanSlug}-${Math.random().toString(36).substring(2, 7)}`,
      members: [
        {
          id: 'm_' + Date.now().toString(36),
          name: `${name} Admin`,
          email: `admin@${domain || cleanSlug + '.edu'}`,
          role: 'Institute Admin',
          joinedAt: new Date().toISOString().split('T')[0],
          status: 'Active'
        }
      ]
    };

    setInstitutes(prev => [newInst, ...prev]);
    return newInst;
  };

  // Super Admin Action: Update Quota or details
  const updateInstitute = (id, updates) => {
    setInstitutes(prev => prev.map(inst => {
      if (inst.id === id) {
        return { ...inst, ...updates };
      }
      return inst;
    }));
  };

  // Super Admin Action: Delete Institute
  const deleteInstitute = (id) => {
    setInstitutes(prev => prev.filter(inst => inst.id !== id));
    if (activeInstituteId === id) {
      const remaining = institutes.filter(inst => inst.id !== id);
      if (remaining.length > 0) {
        setActiveInstituteId(remaining[0].id);
      }
    }
  };

  // Institute Admin Action: Add Student / Faculty
  const addMember = (instituteId, { name, email, role = 'Student' }) => {
    let added = false;
    setInstitutes(prev => prev.map(inst => {
      if (inst.id === instituteId) {
        const newMember = {
          id: 'm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role,
          joinedAt: new Date().toISOString().split('T')[0],
          status: 'Active'
        };

        added = true;
        return {
          ...inst,
          seatsUsed: (inst.seatsUsed || 0) + 1,
          members: [newMember, ...(inst.members || [])]
        };
      }
      return inst;
    }));
    return added;
  };

  // Institute Admin Action: Remove / Revoke Member
  const removeMember = (instituteId, memberId) => {
    setInstitutes(prev => prev.map(inst => {
      if (inst.id === instituteId) {
        const filtered = (inst.members || []).filter(m => m.id !== memberId);
        return {
          ...inst,
          seatsUsed: Math.max(0, (inst.seatsUsed || 1) - 1),
          members: filtered
        };
      }
      return inst;
    }));
  };

  // Institute Admin Action: Regenerate Invite Token
  const regenerateInviteToken = (instituteId) => {
    const newToken = `${currentInstitute?.slug || 'lab'}-${Math.random().toString(36).substring(2, 8)}`;
    updateInstitute(instituteId, { inviteToken: newToken });
    return newToken;
  };

  // Student action: Join via token
  const joinViaToken = (token, studentName, studentEmail) => {
    const targetInst = institutes.find(inst => inst.inviteToken === token);
    if (!targetInst) {
      return { success: false, error: 'Invalid or expired invite link.' };
    }

    const added = addMember(targetInst.id, {
      name: studentName,
      email: studentEmail,
      role: 'Student'
    });

    if (added) {
      setActiveInstituteId(targetInst.id);
      setCurrentRole('member');
      return { success: true, institute: targetInst };
    }
    return { success: false, error: 'Failed to claim seat.' };
  };

  // Reset to initial mock data
  const resetToDefaultData = () => {
    setInstitutes(INITIAL_INSTITUTES);
    setActiveInstituteId('inst_apex');
    localStorage.removeItem(STORAGE_KEY_INSTITUTES);
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
