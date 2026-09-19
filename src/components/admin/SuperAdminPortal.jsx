import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useInstitute } from '../../context/InstituteContext';
import { useHub } from '../../context/HubContext';
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Search,
  Edit2,
  Trash2,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Layers,
  Key,
  Calendar,
  X,
  Loader2,
  AlertCircle,
  UserCheck,
  User,
  GraduationCap,
  Check,
  Zap,
  Gauge,
  HelpCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { SignalDatePicker } from '../common/SignalDatePicker';
import { ContractTierSelect } from '../common/ContractTierSelect';
import { IndividualPlanSelect } from '../common/IndividualPlanSelect';
import { UserProfileMenu } from '../common/UserProfileMenu';
import { TablePagination } from '../common/TablePagination';
import { isDateExpired } from '../../utils/subscriptionUtils';
import { DEFAULT_CONTRACT_TIERS, INDIVIDUAL_PLANS as INDIVIDUAL_PLANS_CONFIG } from '../../utils/tierConfig';
import { SignalButtonLoader } from '../common/SignalButtonLoader';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db, isFirebaseConfigured, createFirebaseUserAccount } from '../../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, deleteField, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { initiateEmailVerification } from '../../services/emailVerificationService';

const INDIVIDUAL_PLANS = [
  'Community Pass',
  'Individual Starter',
  'Individual Pro Plan',
  'Researcher Pro Pass'
];

const DUMMY_INDIVIDUAL_IDS = ['indiv_elena_rostova', 'indiv_marcus_vance', 'indiv_sophia_chen'];
const INITIAL_INDIVIDUALS = [];

const STORAGE_KEY_INDIVIDUALS = 'signalschool_individual_users';

export const SuperAdminPortal = () => {
  const {
    institutes,
    createInstitute,
    updateInstitute,
    deleteInstitute,
    setActiveInstituteId,
    setCurrentRole,
    contractTiers: ctxContractTiers,
    individualPlans: ctxIndividualPlans
  } = useInstitute();
  const contractTiers = ctxContractTiers || DEFAULT_CONTRACT_TIERS;
  const individualPlans = ctxIndividualPlans || INDIVIDUAL_PLANS_CONFIG;
  const { setActiveTab } = useHub();

  // Directory View Mode: 'institutes' | 'individuals'
  const [activeDirectoryTab, setActiveDirectoryTab] = useState('institutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Institute Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState(null);
  const [isSubmittingInstitute, setIsSubmittingInstitute] = useState(false);
  const [createError, setCreateError] = useState('');

  // Individual Accounts State & Modals
  const [individualUsers, setIndividualUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INDIVIDUALS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out dummy test individual accounts and strip any legacy password fields
          const cleaned = parsed
            .filter(
              u => !DUMMY_INDIVIDUAL_IDS.includes(u?.id) && !DUMMY_INDIVIDUAL_IDS.includes(u?.uid)
            )
            .map(u => {
              if (!u) return u;
              const { password, ...safe } = u;
              return safe;
            });
          try {
            localStorage.setItem(STORAGE_KEY_INDIVIDUALS, JSON.stringify(cleaned));
          } catch (_) {}
          return cleaned;
        }
      }
    } catch (_) {}
    return INITIAL_INDIVIDUALS;
  });

  const [isCreateIndividualModalOpen, setIsCreateIndividualModalOpen] = useState(false);
  const [isEditIndividualModalOpen, setIsEditIndividualModalOpen] = useState(false);
  const [editingIndividual, setEditingIndividual] = useState(null);
  const [isSubmittingIndividual, setIsSubmittingIndividual] = useState(false);
  const [createIndividualError, setCreateIndividualError] = useState('');

  // Directory Tables Pagination State
  const [currentPageInstitutes, setCurrentPageInstitutes] = useState(1);
  const [currentPageIndividuals, setCurrentPageIndividuals] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Form State for Creating New Individual Account
  const [individualFormData, setIndividualFormData] = useState({
    name: '',
    username: '',
    email: '',
    planName: 'Individual Pro Plan',
    contractEnd: '2027-12-31',
    password: ''
  });

  // Lock body scrolling when any modal is open
  useEffect(() => {
    if (
      isCreateModalOpen ||
      isEditModalOpen ||
      isCreateIndividualModalOpen ||
      isEditIndividualModalOpen
    ) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    } else {
      setCreateError('');
      setCreateIndividualError('');
    }
  }, [
    isCreateModalOpen,
    isEditModalOpen,
    isCreateIndividualModalOpen,
    isEditIndividualModalOpen
  ]);

  // Real-time listener for individual accounts from Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const usersCol = collection(db, 'users');
    const unsub = onSnapshot(usersCol, (snap) => {
      const usersList = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        // Individual account criterion: not super-admin, and has no instituteId or has role 'individual'
        if (data.role !== 'super-admin' && (!data.instituteId || data.role === 'individual')) {
          if (!DUMMY_INDIVIDUAL_IDS.includes(docSnap.id)) {
            const { password, ...safeData } = data;
            if (password) {
              // Automatically scrub legacy password from users collection
              updateDoc(doc(db, 'users', docSnap.id), {
                password: deleteField(),
                serverUpdatedAt: serverTimestamp()
              }).catch(() => {});
            }
            usersList.push({
              id: docSnap.id,
              uid: docSnap.id,
              ...safeData
            });
          }
        }
      });

      if (usersList.length > 0) {
        setIndividualUsers(usersList);
        try {
          localStorage.setItem(STORAGE_KEY_INDIVIDUALS, JSON.stringify(usersList));
        } catch (_) {}
      }
    }, (err) => console.warn('Firestore users collection listener note:', err));

    return () => unsub();
  }, []);

  // Form State for Creating New Institute
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    planName: 'Campus Enterprise Pack',
    maxSeats: 300,
    domain: '',
    contractEnd: '2027-12-31',
    adminEmail: '',
    adminPassword: ''
  });

  // Calculate totals
  const totalInstitutes = institutes.length;
  const totalMembersEnrolled = institutes.reduce((acc, curr) => acc + (curr.members?.length || 0), 0);
  const activeCampuses = institutes.filter(inst => !isDateExpired(inst.contractEnd) && inst.status !== 'expired' && inst.status !== 'suspended').length;

  const totalIndividuals = individualUsers.length;
  const activeIndividuals = individualUsers.filter(indiv => !isDateExpired(indiv.contractEnd || indiv.subscriptionExpiresAt) && indiv.status !== 'expired').length;
  const totalActiveSubscriptions = activeCampuses + activeIndividuals;

  // Filtered directories based on active search
  const filteredInstitutes = institutes.filter(inst =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inst.adminEmail && inst.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredIndividuals = individualUsers.filter(indiv =>
    (indiv.name && indiv.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (indiv.email && indiv.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (indiv.username && indiv.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (indiv.planName && indiv.planName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Reset pagination on search query or tab change
  useEffect(() => {
    setCurrentPageInstitutes(1);
    setCurrentPageIndividuals(1);
  }, [searchQuery, activeDirectoryTab]);

  // Paginated Slices (10 items per page)
  const paginatedInstitutes = filteredInstitutes.slice(
    (currentPageInstitutes - 1) * ITEMS_PER_PAGE,
    currentPageInstitutes * ITEMS_PER_PAGE
  );

  const paginatedIndividuals = filteredIndividuals.slice(
    (currentPageIndividuals - 1) * ITEMS_PER_PAGE,
    currentPageIndividuals * ITEMS_PER_PAGE
  );

  // Institution Creation Handler
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!formData.name.trim()) return;

    const name = formData.name.trim();
    const slug = (formData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '') || 'campus';
    const domain = formData.domain ? formData.domain.trim().toLowerCase() : `${slug}.edu`;
    const adminEmail = (formData.adminEmail || `admin@${domain}`).trim().toLowerCase();
    const adminPassword = (formData.adminPassword || 'admin123').trim();

    if (adminPassword.length < 6) {
      setCreateError('Admin password must be at least 6 characters long for Firebase Authentication.');
      return;
    }

    const matchedTier = contractTiers.find(t => t.id === formData.planName || t.name === formData.planName);
    const resolvedSeats = matchedTier?.defaultSeats || Number(formData.maxSeats) || 300;

    setIsSubmittingInstitute(true);
    try {
      await createInstitute({
        name,
        slug,
        planName: formData.planName,
        maxSeats: resolvedSeats,
        domain,
        contractEnd: formData.contractEnd,
        adminName: `${name} Admin`,
        adminEmail,
        adminPassword
      });

      setFormData({
        name: '',
        slug: '',
        planName: 'Campus Enterprise Pack',
        maxSeats: 300,
        domain: '',
        contractEnd: '2027-12-31',
        adminEmail: '',
        adminPassword: ''
      });
      setIsCreateModalOpen(false);
      setToastMessage(`Successfully onboarded ${name} with ${resolvedSeats} seats (${formData.planName}).`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Error creating institute:', err);
      setCreateError(err.message || 'Failed to provision institution and administrator.');
    } finally {
      setIsSubmittingInstitute(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingInst) return;

    const matchedTier = contractTiers.find(t => t.id === editingInst.planName || t.name === editingInst.planName);
    const resolvedSeats = matchedTier?.defaultSeats || Number(editingInst.maxSeats) || 100;

    updateInstitute(editingInst.id, {
      name: editingInst.name,
      planName: editingInst.planName,
      maxSeats: resolvedSeats,
      domain: editingInst.domain,
      contractEnd: editingInst.contractEnd,
      adminEmail: editingInst.adminEmail
    });
    setIsEditModalOpen(false);
    setEditingInst(null);
    setToastMessage(`Updated contract and quota terms for ${editingInst.name} (${resolvedSeats} seats).`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Individual Account Creation Handler
  const handleCreateIndividualSubmit = async (e) => {
    e.preventDefault();
    setCreateIndividualError('');

    const name = individualFormData.name.trim();
    const email = individualFormData.email.trim().toLowerCase();
    const username = (individualFormData.username || email.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const planName = individualFormData.planName || 'Individual Pro Plan';
    const contractEnd = individualFormData.contractEnd || '2027-12-31';
    const password = (individualFormData.password || 'password123').trim();

    if (!name) {
      setCreateIndividualError('Please enter a display name for the individual learner.');
      return;
    }
    if (!email || !email.includes('@')) {
      setCreateIndividualError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setCreateIndividualError('Password must be at least 6 characters long for authentication.');
      return;
    }

    setIsSubmittingIndividual(true);
    try {
      let createdUid = null;
      if (isFirebaseConfigured) {
        try {
          const authResult = await createFirebaseUserAccount({
            email,
            password,
            displayName: name
          });
          if (authResult?.uid) {
            createdUid = authResult.uid;
          }
        } catch (authErr) {
          if (authErr.code !== 'auth/email-already-in-use') {
            throw authErr;
          }
        }
      }

      const assignedId = createdUid || 'indiv_' + Date.now().toString(36);
      const isExpired = isDateExpired(contractEnd);

      const newIndividual = {
        id: assignedId,
        uid: assignedId,
        name,
        email,
        username,
        role: 'individual',
        roleLabel: planName.includes('Researcher') ? 'Independent Researcher' : 'Individual Learner',
        planName,
        contractEnd,
        subscriptionExpiresAt: contractEnd,
        status: isExpired ? 'expired' : 'active',
        avatarLetter: name.charAt(0).toUpperCase() || 'I',
        email_verified: false,
        createdAt: new Date().toISOString()
      };

      if (isFirebaseConfigured) {
        await setDoc(doc(db, 'users', assignedId), {
          ...newIndividual,
          serverCreatedAt: serverTimestamp(),
          serverUpdatedAt: serverTimestamp()
        }, { merge: true });
      }

      // Dispatch branded custom verification email
      initiateEmailVerification({
        name,
        email,
        userId: assignedId,
        role: 'individual'
      }).catch(err => console.warn('Verification email dispatch notice:', err));

      setIndividualUsers(prev => {
        const updated = [newIndividual, ...prev.filter(u => u.email !== email)];
        try {
          localStorage.setItem(STORAGE_KEY_INDIVIDUALS, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      setIndividualFormData({
        name: '',
        username: '',
        email: '',
        planName: 'Individual Pro Plan',
        contractEnd: '2027-12-31',
        password: ''
      });
      setIsCreateIndividualModalOpen(false);
    } catch (err) {
      console.error('Error creating individual account:', err);
      setCreateIndividualError(err.message || 'Failed to create individual account.');
    } finally {
      setIsSubmittingIndividual(false);
    }
  };

  // Individual Account Edit Handler
  const handleEditIndividualSubmit = async (e) => {
    e.preventDefault();
    if (!editingIndividual) return;

    const isExpired = isDateExpired(editingIndividual.contractEnd);
    const { password, ...safeIndividual } = editingIndividual;
    const updated = {
      ...safeIndividual,
      subscriptionExpiresAt: editingIndividual.contractEnd,
      status: isExpired ? 'expired' : 'active',
      roleLabel: editingIndividual.planName?.includes('Researcher') ? 'Independent Researcher' : 'Individual Learner'
    };

    if (isFirebaseConfigured && editingIndividual.id) {
      try {
        await setDoc(doc(db, 'users', editingIndividual.id), {
          ...updated,
          serverUpdatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Error saving individual edit to Firestore:', err);
      }
    }

    setIndividualUsers(prev => {
      const next = prev.map(u => u.id === editingIndividual.id ? updated : u);
      try {
        localStorage.setItem(STORAGE_KEY_INDIVIDUALS, JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    setIsEditIndividualModalOpen(false);
    setEditingIndividual(null);
  };

  // Individual Account Delete Handler
  const handleDeleteIndividual = async (indivId, indivName) => {
    if (!confirm(`Are you sure you want to remove ${indivName || 'this individual account'}? This will revoke their platform access.`)) {
      return;
    }

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'users', indivId));
      } catch (err) {
        console.warn('Error deleting user doc in Firestore:', err);
      }
    }

    setIndividualUsers(prev => {
      const next = prev.filter(u => u.id !== indivId && u.uid !== indivId);
      try {
        localStorage.setItem(STORAGE_KEY_INDIVIDUALS, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  return (
    <div className="bg-[#f6f3eb] text-[#203247] min-h-screen selection:bg-[#347f7a] selection:text-[#f6f3eb] font-space-grotesk pb-24">
      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-40 border-b border-[#203247]/10 bg-[#f5f3ed]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">
          {/* Brand */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('hub'); }}
            className="flex items-center text-decoration-none group cursor-pointer"
          >
            <span className="font-space-grotesk text-lg font-bold tracking-tight text-[#203247]">
              signal<span className="text-[#347f7a] font-normal">school</span>
            </span>
          </a>

          {/* Action Buttons & User Profile on Right */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden sm:inline-flex bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Building2 size={13} />
              <span>Onboard Institute</span>
            </button>

            <button
              onClick={() => setIsCreateIndividualModalOpen(true)}
              className="bg-[#347f7a] text-[#f6f3eb] hover:bg-[#28635f] rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Plus size={14} />
              <span>New Individual</span>
            </button>

            <div className="pl-2 border-l border-[#203247]/10">
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-[#f5f3ed] border-b border-[#203247]/10">
        <div className="relative bg-grid-paper">
          <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 pt-12 pb-8 sm:px-8 sm:pt-16 sm:pb-10">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#f09a7d]" />
              institutional contracts & individual account governance
            </p>

            <h1 className="mt-5 max-w-4xl font-display text-4xl sm:text-6xl lg:text-[4.5rem] leading-[0.95] tracking-[-0.05em] text-[#203247]">
              Master Platform <br />
              <em className="italic font-normal text-[#347f7a]">Organization Cockpit.</em>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-[#526b88]">
              Oversee both partner institutions and individual accounts from a centralized control plane. Provision lab quotas, monitor seat claims, and manage subscription lifecycles.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <div className="mx-auto max-w-[1440px] 2xl:max-w-[1560px] px-5 sm:px-8 pt-8">
        {/* KPI METRIC CARDS (Aligned with Base App Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Partner Institutes */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#347f7a]/40">
            <div className="flex items-center justify-between text-[#647895] mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold">
                Partner Institutes
              </span>
              <span className="p-2 rounded-xl bg-[#d9e8df] text-[#347f7a]">
                <Building2 size={16} />
              </span>
            </div>
            <div className="font-display text-4xl font-normal text-[#203247] tracking-tight">
              {totalInstitutes}
            </div>
            <div className="mt-2 text-xs text-[#347f7a] font-medium flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>{activeCampuses} active enterprise licenses</span>
            </div>
          </div>

          {/* Card 2: Campus Learners */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#347f7a]/40">
            <div className="flex items-center justify-between text-[#647895] mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold">
                Campus Seat Licenses
              </span>
              <span className="p-2 rounded-xl bg-[#cbe8e7] text-[#2f7f85]">
                <Users size={16} />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-normal text-[#203247] tracking-tight">
                {totalMembersEnrolled.toLocaleString()}
              </span>
              <span className="text-[#647895] font-mono-signal text-sm">
                / {institutes.reduce((acc, curr) => acc + (Number(curr.maxSeats) || 100), 0).toLocaleString()} seats
              </span>
            </div>
            <div className="mt-2 text-xs text-[#347f7a] font-medium">
              Students & Faculty in university spaces
            </div>
          </div>

          {/* Card 3: Individual Accounts */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#347f7a]/40">
            <div className="flex items-center justify-between text-[#647895] mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold">
                Individual Accounts
              </span>
              <span className="p-2 rounded-xl bg-[#f5dec5] text-[#d97d54]">
                <UserCheck size={16} />
              </span>
            </div>
            <div className="font-display text-4xl font-normal text-[#203247] tracking-tight">
              {totalIndividuals.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-[#d97d54] font-medium flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>{activeIndividuals} active individual plans</span>
            </div>
          </div>

          {/* Card 4: Active Subscriptions & Platform Status */}
          <div className="bg-[#fbf9f4] border border-[#203247]/10 rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:border-[#347f7a]/40">
            <div className="flex items-center justify-between text-[#647895] mb-3">
              <span className="font-mono-signal text-[11px] uppercase tracking-[0.15em] font-semibold">
                Active Subscriptions
              </span>
              <span className="p-2 rounded-xl bg-[#d9e8df] text-[#347f7a]">
                <CreditCard size={16} />
              </span>
            </div>
            <div className="font-display text-4xl font-normal text-[#203247] tracking-tight">
              {totalActiveSubscriptions.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-[#347f7a] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#347f7a] animate-pulse" />
              <span>All simulation sandboxes operational</span>
            </div>
          </div>
        </div>

        {/* DIRECTORY VIEW SEGMENTED SWITCHER & QUICK ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="inline-flex p-1.5 bg-[#f5f3ed] border border-[#203247]/10 rounded-2xl self-start flex-wrap gap-1">
            <button
              type="button"
              onClick={() => { setActiveDirectoryTab('institutes'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border-none ${
                activeDirectoryTab === 'institutes'
                  ? 'bg-white text-[#203247] shadow-xs'
                  : 'bg-transparent text-[#647895] hover:text-[#203247]'
              }`}
            >
              <Building2 size={15} className={activeDirectoryTab === 'institutes' ? 'text-[#347f7a]' : 'text-[#647895]'} />
              <span>Partner Institutions</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-signal ${
                activeDirectoryTab === 'institutes' ? 'bg-[#d9e8df] text-[#347f7a]' : 'bg-[#203247]/5 text-[#647895]'
              }`}>
                {institutes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveDirectoryTab('individuals'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border-none ${
                activeDirectoryTab === 'individuals'
                  ? 'bg-white text-[#203247] shadow-xs'
                  : 'bg-transparent text-[#647895] hover:text-[#203247]'
              }`}
            >
              <UserCheck size={15} className={activeDirectoryTab === 'individuals' ? 'text-[#347f7a]' : 'text-[#647895]'} />
              <span>Individual Accounts</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-signal ${
                activeDirectoryTab === 'individuals' ? 'bg-[#d9e8df] text-[#347f7a]' : 'bg-[#203247]/5 text-[#647895]'
              }`}>
                {individualUsers.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeDirectoryTab === 'institutes' ? (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs border-none flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Onboard Institute</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreateIndividualModalOpen(true)}
                className="bg-[#347f7a] text-[#f6f3eb] hover:bg-[#28635f] rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-xs border-none flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Onboard Individual</span>
              </button>
            )}
          </div>
        </div>

        {/* SEARCH & FILTER TOOLBAR */}
        <div className="bg-[#f5f3ed] border border-[#203247]/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647895]" />
            <input
              type="text"
              placeholder={
                activeDirectoryTab === 'institutes'
                  ? 'Search partner institutes by name, domain, slug...'
                  : 'Search individual accounts by name, email, username, plan...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#203247]/15 bg-white/90 py-2.5 pl-11 pr-4 text-xs outline-none transition-all focus:border-[#347f7a] focus:bg-white text-[#203247]"
            />
          </div>

          <div className="font-mono-signal text-[11px] text-[#647895] tracking-[0.1em] uppercase">
            {activeDirectoryTab === 'institutes' ? (
              <>Showing <strong className="text-[#203247]">{filteredInstitutes.length}</strong> Partner Organizations</>
            ) : (
              <>Showing <strong className="text-[#203247]">{filteredIndividuals.length}</strong> Individual Accounts</>
            )}
          </div>
        </div>

        {/* DIRECTORY TABLES CONTAINER */}
        {activeDirectoryTab === 'institutes' && (
          <>
            {/* INSTITUTES DIRECTORY TABLE */}
            <div className="rounded-3xl border border-[#203247]/10 bg-white/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#203247]/10 bg-[#f5f3ed]/60 text-[11px] font-mono-signal text-[#647895] uppercase tracking-[0.15em]">
                    <th className="py-4 px-6 w-[28%]">Institute Details</th>
                    <th className="py-4 px-6 w-[18%]">Contract Tier</th>
                    <th className="py-4 px-6 w-[20%]">Seat Quota</th>
                    <th className="py-4 px-6 w-[14%]">Renewal Date</th>
                    <th className="py-4 px-6 w-[10%]">Status</th>
                    <th className="py-4 px-6 w-[10%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#203247]/5 text-xs">
                  {filteredInstitutes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-[#647895]">
                          <div className="w-12 h-12 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 flex items-center justify-center text-[#203247] mb-3">
                            <Building2 size={22} className="text-[#347f7a]" />
                          </div>
                          <p className="font-semibold text-sm text-[#203247] mb-1">
                            {searchQuery ? 'No matching institutions found' : 'No partner institutions registered'}
                          </p>
                          <p className="text-xs text-[#647895] mb-4">
                            {searchQuery
                              ? 'Try adjusting your search criteria.'
                              : 'Get started by onboarding your first academic campus or department.'}
                          </p>
                          {!searchQuery && (
                            <button
                              type="button"
                              onClick={() => setIsCreateModalOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#203247] text-[#f6f3eb] rounded-full text-xs font-semibold hover:bg-[#347f7a] transition-colors cursor-pointer border-none"
                            >
                              <Plus size={14} />
                              <span>Onboard First Campus</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedInstitutes.map((inst) => {
                      const isExpired = isDateExpired(inst.contractEnd) || inst.status === 'expired';
                      const used = Number(inst.seatsUsed) || 0;
                      const max = Number(inst.maxSeats) || 100;
                      const pct = Math.min(100, Math.round((used / max) * 100));

                      return (
                        <tr
                          key={inst.id}
                          className="hover:bg-[#fbf9f4] transition-colors group"
                        >
                          <td className="py-4 px-6 align-middle">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 flex items-center justify-center font-bold text-[#347f7a] text-sm shrink-0">
                                {inst.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-[#203247] group-hover:text-[#347f7a] transition-colors truncate">
                                  {inst.name}
                                </div>
                                <div className="text-[11px] text-[#647895] font-mono-signal flex items-center gap-2 mt-0.5 truncate">
                                  <span>@{inst.domain}</span>
                                  <span>•</span>
                                  <span className="truncate">Admin: <strong className="text-[#203247] font-semibold">{inst.adminEmail || `admin@${inst.domain}`}</strong></span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 align-middle">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#f5f3ed] text-[#203247] border border-[#203247]/10 rounded-full truncate max-w-full">
                              <Layers size={12} className="text-[#347f7a] shrink-0" />
                              <span className="truncate">{inst.planName}</span>
                            </span>
                          </td>

                          <td className="py-4 px-6 align-middle">
                            <div className="w-full max-w-[170px]">
                              <div className="flex items-center justify-between text-[11px] font-mono-signal mb-1">
                                <span className="font-semibold text-[#203247]">
                                  {used} / {max}
                                </span>
                                <span className={`text-[10px] font-bold ${
                                  used >= max
                                    ? 'text-red-600'
                                    : pct >= 75
                                    ? 'text-[#d97d54]'
                                    : 'text-[#347f7a]'
                                }`}>
                                  {pct}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-[#203247]/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    used >= max
                                      ? 'bg-red-500'
                                      : pct >= 75
                                      ? 'bg-[#d97d54]'
                                      : 'bg-[#347f7a]'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-[#526b88] font-mono-signal text-[11px] align-middle">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-[#647895]/70 shrink-0" />
                              <span>{inst.contractEnd}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6 align-middle">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-signal uppercase tracking-[0.1em] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-signal uppercase tracking-[0.1em] font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]"></span>
                                Active
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingInst({ ...inst });
                                  setIsEditModalOpen(true);
                                }}
                                title="Edit Quota & Details"
                                className="p-2 rounded-full border border-[#203247]/15 hover:bg-[#f5f3ed] text-[#203247] transition-colors cursor-pointer"
                              >
                                <Sliders size={13} />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove ${inst.name}? This will revoke all student seats.`)) {
                                    deleteInstitute(inst.id);
                                  }
                                }}
                                title="Delete Institute"
                                className="p-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Pagination Outside Table Card */}
          <TablePagination
            currentPage={currentPageInstitutes}
            totalItems={filteredInstitutes.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPageInstitutes}
            itemLabel="partner organizations"
          />
        </>
      )}

        {activeDirectoryTab === 'individuals' && (
          <>
            {/* INDIVIDUAL ACCOUNTS DIRECTORY TABLE */}
            <div className="rounded-3xl border border-[#203247]/10 bg-white/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#203247]/10 bg-[#f5f3ed]/60 text-[11px] font-mono-signal text-[#647895] uppercase tracking-[0.15em]">
                    <th className="py-4 px-6 w-[34%]">Learner Account</th>
                    <th className="py-4 px-6 w-[22%]">Plan Tier</th>
                    <th className="py-4 px-6 w-[18%]">Renewal Expiry</th>
                    <th className="py-4 px-6 w-[13%]">Status</th>
                    <th className="py-4 px-6 w-[13%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#203247]/5 text-xs">
                  {filteredIndividuals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-[#647895]">
                          <div className="w-12 h-12 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 flex items-center justify-center text-[#203247] mb-3">
                            <UserCheck size={22} className="text-[#347f7a]" />
                          </div>
                          <p className="font-semibold text-sm text-[#203247] mb-1">
                            {searchQuery ? 'No matching individual accounts found' : 'No individual accounts registered'}
                          </p>
                          <p className="text-xs text-[#647895] mb-4">
                            {searchQuery
                              ? 'Try adjusting your search query.'
                              : 'Create an individual learner, researcher, or community account.'}
                          </p>
                          {!searchQuery && (
                            <button
                              type="button"
                              onClick={() => setIsCreateIndividualModalOpen(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#347f7a] text-[#f6f3eb] rounded-full text-xs font-semibold hover:bg-[#28635f] transition-colors cursor-pointer border-none"
                            >
                              <Plus size={14} />
                              <span>Onboard Individual Account</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedIndividuals.map((indiv) => {
                      const expiryDate = indiv.contractEnd || indiv.subscriptionExpiresAt || '2027-12-31';
                      const isExpired = isDateExpired(expiryDate) || indiv.status === 'expired';
                      const avatarLetter = (indiv.name || indiv.email || 'I').charAt(0).toUpperCase();

                      return (
                        <tr
                          key={indiv.id || indiv.uid || indiv.email}
                          className="hover:bg-[#fbf9f4] transition-colors group"
                        >
                          <td className="py-4 px-6 align-middle">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-[#f5f3ed] border border-[#203247]/10 flex items-center justify-center font-bold text-[#347f7a] text-sm shrink-0">
                                {avatarLetter}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-[#203247] group-hover:text-[#347f7a] transition-colors truncate">
                                  {indiv.name || 'Individual User'}
                                </div>
                                <div className="text-[11px] text-[#647895] font-mono-signal flex items-center gap-2 mt-0.5 truncate">
                                  <span>@{indiv.username || indiv.email?.split('@')[0]}</span>
                                  <span>•</span>
                                  <span className="truncate">{indiv.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 align-middle">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#f5f3ed] text-[#203247] border border-[#203247]/10 rounded-full truncate max-w-full">
                                <Sparkles size={12} className="text-[#d97d54] shrink-0" />
                                <span className="truncate">{indiv.planName || 'Individual Pro Plan'}</span>
                              </span>
                              <span className="text-[10px] font-mono-signal text-[#647895] pl-1">
                                {individualPlans.find(p => p.id === indiv.planName || p.name === indiv.planName)?.price || '1 Student Sandbox Seat'}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-[#526b88] font-mono-signal text-[11px] align-middle">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-[#647895]/70 shrink-0" />
                              <span>{expiryDate}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6 align-middle">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-signal uppercase tracking-[0.1em] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono-signal uppercase tracking-[0.1em] font-semibold bg-[#d9e8df] text-[#347f7a] border border-[#347f7a]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a]"></span>
                                Active
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingIndividual({
                                    ...indiv,
                                    contractEnd: expiryDate
                                  });
                                  setIsEditIndividualModalOpen(true);
                                }}
                                title="Edit Account Subscription"
                                className="p-2 rounded-full border border-[#203247]/15 hover:bg-[#f5f3ed] text-[#203247] transition-colors cursor-pointer"
                              >
                                <Sliders size={13} />
                              </button>

                              <button
                                onClick={() => handleDeleteIndividual(indiv.id || indiv.uid, indiv.name)}
                                title="Delete Individual Account"
                                className="p-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Pagination Outside Table Card */}
          <TablePagination
            currentPage={currentPageIndividuals}
            totalItems={filteredIndividuals.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPageIndividuals}
            itemLabel="individual accounts"
          />
        </>
      )}
      </div>

      {/* MODAL 1: ONBOARD NEW INSTITUTE */}
      {isCreateModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-[#203247]/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-4xl lg:max-w-[920px] shadow-2xl animate-scale-up overflow-visible relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 sm:px-10 py-6 sm:py-7 border-b border-[#203247]/10 flex items-center justify-between bg-white rounded-t-[2rem]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-normal text-[#203247]">Onboard New Campus</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">Provision high-throughput virtual lab tenants & allocate academic quotas</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors border-none bg-transparent"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-8 sm:p-10 space-y-6 overflow-visible rounded-b-[2rem]">
              {createError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
                  <AlertCircle size={18} className="shrink-0 text-red-500" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                  Institute / University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University or MIT"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setFormData(prev => ({
                      ...prev,
                      name,
                      slug: prev.slug || slug,
                      domain: prev.domain || (slug ? `${slug}.edu` : ''),
                      adminEmail: prev.adminEmail || (slug ? `admin@${slug}.edu` : '')
                    }));
                  }}
                  className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Tenant Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. stanford-lab"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Official Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. stanford.edu"
                    value={formData.domain}
                    onChange={(e) => {
                      const domain = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        domain,
                        adminEmail: prev.adminEmail ? prev.adminEmail : (domain ? `admin@${domain}` : '')
                      }));
                    }}
                    className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20">
                <div>
                  <ContractTierSelect
                    value={formData.planName}
                    onChange={(planName) => {
                      const matched = contractTiers.find(t => t.id === planName || t.name === planName);
                      setFormData(prev => ({
                        ...prev,
                        planName,
                        maxSeats: matched?.defaultSeats || prev.maxSeats || 300
                      }));
                    }}
                    label="Contract Tier"
                  />
                  <div className="text-[10px] text-[#647895] font-mono-signal mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a] shrink-0" />
                    <span>Included Quota: {contractTiers.find(t => t.id === formData.planName || t.name === formData.planName)?.defaultSeats || 300} Student Seats</span>
                  </div>
                </div>
                <SignalDatePicker
                  value={formData.contractEnd}
                  onChange={(newDate) => setFormData({ ...formData, contractEnd: newDate })}
                  label="Subscription Expiry Date"
                />
              </div>

              {/* DESIGNATED CAMPUS ADMINISTRATOR ACCOUNT */}
              <div className="pt-6 border-t border-[#203247]/10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#203247]">Designated Campus Administrator Account</h4>
                    <p className="text-xs text-[#647895] font-mono-signal">This administrator account will be provisioned directly in Firebase Authentication</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Admin Email (Login ID) *
                    </label>
                    <input
                      type="email"
                      placeholder={formData.domain ? `admin@${formData.domain}` : 'admin@university.edu'}
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Initial Password (Min 6 chars)
                    </label>
                    <input
                      type="text"
                      minLength={6}
                      placeholder="e.g. Stanford@2026 (default: admin123)"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#203247]/10 flex items-center justify-end gap-4 relative z-10">
                <button
                  type="button"
                  disabled={isSubmittingInstitute}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-[#647895] hover:text-[#203247] cursor-pointer transition-colors disabled:opacity-50 border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInstitute}
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] disabled:opacity-80 disabled:cursor-not-allowed rounded-2xl px-8 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md border-none hover:-translate-y-0.5 flex items-center gap-2 relative overflow-hidden"
                >
                  {isSubmittingInstitute ? (
                    <SignalButtonLoader label="Provisioning in Firebase..." variant="bars" />
                  ) : (
                    <span>Confirm & Provision</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: EDIT INSTITUTE CONTRACT */}
      {isEditModalOpen && editingInst && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-[#203247]/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-4xl lg:max-w-[920px] shadow-2xl animate-fade-in overflow-visible relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 sm:px-10 py-6 sm:py-7 border-b border-[#203247]/10 flex items-center justify-between bg-white shrink-0 rounded-t-[2rem]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-normal text-[#203247]">Modify Institute Contract</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">Update licensing, quotas, and renewal terms</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors border-none bg-transparent"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 sm:p-10 space-y-6 overflow-visible rounded-b-[2rem]">
              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                  Institute Name
                </label>
                <input
                  type="text"
                  value={editingInst.name}
                  onChange={(e) => setEditingInst({ ...editingInst, name: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20">
                <div>
                  <ContractTierSelect
                    value={editingInst.planName}
                    onChange={(planName) => {
                      const matched = contractTiers.find(t => t.id === planName || t.name === planName);
                      setEditingInst(prev => ({
                        ...prev,
                        planName,
                        maxSeats: matched?.defaultSeats || prev.maxSeats || 100
                      }));
                    }}
                    label="Contract Tier"
                  />
                  <div className="text-[10px] text-[#647895] font-mono-signal mt-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#347f7a] shrink-0" />
                      <span>Included Quota: {contractTiers.find(t => t.id === editingInst.planName || t.name === editingInst.planName)?.defaultSeats || 100} Student Seats</span>
                    </span>
                    <span>Claimed: {editingInst.seatsUsed || 0} seats</span>
                  </div>
                </div>
                <SignalDatePicker
                  value={editingInst.contractEnd}
                  onChange={(newDate) => setEditingInst({ ...editingInst, contractEnd: newDate })}
                  label="Renewal Expiry Date"
                />
              </div>

              {/* CAMPUS ADMINISTRATOR ACCOUNT DETAILS */}
              <div className="pt-6 border-t border-[#203247]/10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#203247]">Campus Administrator Account</h4>
                    <p className="text-xs text-[#647895] font-mono-signal">Update admin credentials for this institution</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Admin Email (Login ID)
                    </label>
                    <input
                      type="email"
                      value={editingInst.adminEmail || ''}
                      onChange={(e) => setEditingInst({ ...editingInst, adminEmail: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Authentication Security
                    </label>
                    <div className="w-full py-2.5 px-3.5 bg-[#f6f3eb] border border-[#203247]/10 rounded-2xl text-xs text-[#647895] flex items-center justify-between gap-2">
                      <span>Credentials securely managed in Firebase Auth</span>
                      {editingInst.adminEmail && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await sendPasswordResetEmail(auth, editingInst.adminEmail);
                              setToastMessage(`Password reset link sent to ${editingInst.adminEmail}`);
                              setTimeout(() => setToastMessage(''), 3500);
                            } catch (err) {
                              setToastMessage(err.message || 'Failed to send reset email');
                              setTimeout(() => setToastMessage(''), 3500);
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#347f7a] bg-white border border-[#347f7a]/30 rounded-lg hover:bg-[#347f7a]/10 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Send Reset Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#203247]/10 flex items-center justify-end gap-4 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-[#647895] hover:text-[#203247] cursor-pointer transition-colors border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#347f7a] text-[#f6f3eb] hover:bg-[#28635f] rounded-2xl px-8 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md border-none hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: ONBOARD NEW INDIVIDUAL ACCOUNT */}
      {isCreateIndividualModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-[#203247]/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsCreateIndividualModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-4xl lg:max-w-[920px] shadow-2xl animate-scale-up overflow-visible relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 sm:px-10 py-6 sm:py-7 border-b border-[#203247]/10 flex items-center justify-between bg-white rounded-t-[2rem]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#f5dec5] text-[#d97d54] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-normal text-[#203247]">Onboard Individual Account</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">Provision high-throughput virtual lab access & manage subscription tier</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateIndividualModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors border-none bg-transparent"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateIndividualSubmit} className="p-8 sm:p-10 space-y-6 overflow-visible rounded-b-[2rem]">
              {createIndividualError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
                  <AlertCircle size={18} className="shrink-0 text-red-500" />
                  <span>{createIndividualError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Full Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alex Morgan"
                    value={individualFormData.name}
                    onChange={(e) => setIndividualFormData({ ...individualFormData, name: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Username Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647895] font-mono-signal text-xs">@</span>
                    <input
                      type="text"
                      placeholder="alex_dsp"
                      value={individualFormData.username}
                      onChange={(e) => setIndividualFormData({ ...individualFormData, username: e.target.value })}
                      className="w-full h-12 pl-8 pr-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all font-mono-signal"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20">
                <IndividualPlanSelect
                  value={individualFormData.planName}
                  onChange={(planName) => setIndividualFormData(prev => ({ ...prev, planName }))}
                  label="Plan Tier"
                  plans={individualPlans}
                />
                <SignalDatePicker
                  value={individualFormData.contractEnd}
                  onChange={(newDate) => setIndividualFormData(prev => ({ ...prev, contractEnd: newDate }))}
                  label="Subscription Expiry Date"
                />
              </div>

              {/* DESIGNATED LEARNER ACCOUNT CREDENTIALS */}
              <div className="pt-6 border-t border-[#203247]/10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#203247]">Designated Learner Account</h4>
                    <p className="text-xs text-[#647895] font-mono-signal">This account will be provisioned directly in Firebase Authentication</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Learner Email (Login ID) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="learner@domain.com"
                      value={individualFormData.email}
                      onChange={(e) => setIndividualFormData({ ...individualFormData, email: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Initial Password (Min 6 chars)
                    </label>
                    <input
                      type="text"
                      minLength={6}
                      placeholder="e.g. Learner@2026 (default: password123)"
                      value={individualFormData.password}
                      onChange={(e) => setIndividualFormData({ ...individualFormData, password: e.target.value })}
                      className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#203247]/10 flex items-center justify-end gap-4 relative z-10">
                <button
                  type="button"
                  disabled={isSubmittingIndividual}
                  onClick={() => setIsCreateIndividualModalOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-[#647895] hover:text-[#203247] cursor-pointer transition-colors disabled:opacity-50 border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIndividual}
                  className="bg-[#347f7a] text-[#f6f3eb] hover:bg-[#28635f] disabled:opacity-80 disabled:cursor-not-allowed rounded-2xl px-8 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md border-none hover:-translate-y-0.5 flex items-center gap-2 relative overflow-hidden"
                >
                  {isSubmittingIndividual ? (
                    <SignalButtonLoader label="Provisioning in Firebase..." variant="bars" />
                  ) : (
                    <span>Confirm & Provision Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: EDIT INDIVIDUAL SUBSCRIPTION */}
      {isEditIndividualModalOpen && editingIndividual && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-[#203247]/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setIsEditIndividualModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-[2rem] w-full max-w-4xl lg:max-w-[920px] shadow-2xl animate-fade-in overflow-visible relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 sm:px-10 py-6 sm:py-7 border-b border-[#203247]/10 flex items-center justify-between bg-white shrink-0 rounded-t-[2rem]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-normal text-[#203247]">Modify Individual Subscription</h3>
                  <p className="text-xs text-[#647895] font-mono-signal mt-0.5">Update learner plan, renewal date, and account credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditIndividualModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-2 rounded-full hover:bg-[#f5f3ed] cursor-pointer transition-colors border-none bg-transparent"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleEditIndividualSubmit} className="p-8 sm:p-10 space-y-6 overflow-visible rounded-b-[2rem]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingIndividual.name || ''}
                    onChange={(e) => setEditingIndividual({ ...editingIndividual, name: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                    Username Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647895] font-mono-signal text-xs">@</span>
                    <input
                      type="text"
                      value={editingIndividual.username || ''}
                      onChange={(e) => setEditingIndividual({ ...editingIndividual, username: e.target.value })}
                      className="w-full h-12 pl-8 pr-4 bg-white border border-[#203247]/15 rounded-2xl text-sm text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 shadow-2xs transition-all font-mono-signal"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-20">
                <IndividualPlanSelect
                  value={editingIndividual.planName || 'Individual Pro Plan'}
                  onChange={(planName) => setEditingIndividual(prev => ({ ...prev, planName }))}
                  label="Plan Tier"
                  plans={individualPlans}
                />
                <SignalDatePicker
                  value={editingIndividual.contractEnd || '2027-12-31'}
                  onChange={(newDate) => setEditingIndividual({ ...editingIndividual, contractEnd: newDate })}
                  label="Renewal Expiry Date"
                />
              </div>

              {/* CAMPUS ADMINISTRATOR / LEARNER ACCOUNT DETAILS */}
              <div className="pt-6 border-t border-[#203247]/10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#d9e8df] text-[#347f7a] flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#203247]">Learner Account Credentials</h4>
                    <p className="text-xs text-[#647895] font-mono-signal">Update login credentials for this individual user</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Learner Email (Login ID)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={editingIndividual.email || ''}
                      className="w-full h-12 px-4 bg-[#f5f3ed] border border-[#203247]/10 rounded-2xl text-sm text-[#647895] outline-none cursor-not-allowed font-mono-signal"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-2 font-medium">
                      Authentication Security
                    </label>
                    <div className="w-full py-2.5 px-3.5 bg-[#f6f3eb] border border-[#203247]/10 rounded-2xl text-xs text-[#647895] flex items-center justify-between gap-2">
                      <span>Managed securely in Firebase Auth</span>
                      {editingIndividual.email && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await sendPasswordResetEmail(auth, editingIndividual.email);
                              setToastMessage(`Password reset link sent to ${editingIndividual.email}`);
                              setTimeout(() => setToastMessage(''), 3500);
                            } catch (err) {
                              setToastMessage(err.message || 'Failed to send reset email');
                              setTimeout(() => setToastMessage(''), 3500);
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#347f7a] bg-white border border-[#347f7a]/30 rounded-lg hover:bg-[#347f7a]/10 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Send Reset Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#203247]/10 flex items-center justify-end gap-4 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsEditIndividualModalOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-[#647895] hover:text-[#203247] cursor-pointer transition-colors border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#347f7a] text-[#f6f3eb] hover:bg-[#28635f] rounded-2xl px-8 py-3 text-sm font-semibold transition-all cursor-pointer shadow-md border-none hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* FLOATING SUCCESS TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-[#203247] text-[#f6f3eb] px-5 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <div className="w-6 h-6 rounded-full bg-[#347f7a] flex items-center justify-center shrink-0">
            <Check size={14} className="text-white" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-2 text-white/60 hover:text-white border-none bg-transparent cursor-pointer p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
