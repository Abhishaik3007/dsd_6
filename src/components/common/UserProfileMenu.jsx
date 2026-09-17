import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useHub } from '../../context/HubContext';
import {
  User,
  LogOut,
  ChevronDown,
  Shield,
  Building2,
  Compass,
  Edit3,
  X,
  Check,
  AlertTriangle,
  AtSign,
  Sparkles,
  ExternalLink,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Layers
} from 'lucide-react';

export const UserProfileMenu = ({ compact = false, showBorder = true }) => {
  const { currentUser, logout, updateUserProfile, changeCurrentUserPassword } = useAuth();
  const { activeTab, setActiveTab } = useHub();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  if (!currentUser) return null;

  const userInitial = (currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase();
  const usernameDisplay = currentUser.username
    ? `@${currentUser.username}`
    : `@${(currentUser.email || '').split('@')[0]}`;

  const openEditModal = () => {
    setEditName(currentUser.name || '');
    setEditUsername(currentUser.username || (currentUser.email || '').split('@')[0] || '');
    setSaveSuccessMsg(false);
    setIsEditProfileModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsSavingProfile(true);
    try {
      const cleanUsername = editUsername.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      await updateUserProfile({
        name: editName.trim(),
        username: cleanUsername
      });
      setSaveSuccessMsg(true);
      setTimeout(() => {
        setIsEditProfileModalOpen(false);
        setSaveSuccessMsg(false);
      }, 700);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    setActiveTab('hub');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!currentPassword) {
      setChangePasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('New passwords do not match. Please check and retype.');
      return;
    }

    if (currentPassword === newPassword) {
      setChangePasswordError('New password must be different from your current password.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeCurrentUserPassword(currentPassword, newPassword);
      setChangePasswordSuccess('Your password has been changed successfully!');
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setChangePasswordSuccess('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1200);
    } catch (err) {
      console.error('Password change error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setChangePasswordError('The current password you entered is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        setChangePasswordError('New password should be at least 6 characters.');
      } else if (err.code === 'auth/too-many-requests') {
        setChangePasswordError('Too many attempts. Please wait a moment and try again.');
      } else {
        setChangePasswordError(err.message || 'Failed to update password.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Badge styling depending on user role
  const getBadgeStyle = (role) => {
    switch (role) {
      case 'super-admin':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'institute-admin':
        return 'bg-[#203247] text-[#f6f3eb] border-[#203247]';
      case 'faculty':
        return 'bg-[#f5dec5] text-[#d97d54] border-[#d97d54]/30';
      default:
        return 'bg-[#d9e8df] text-[#347f7a] border-[#347f7a]/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TRIGGER BUTTON (NAME TAG PILL) */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(prev => !prev)}
        className={`flex items-center gap-2.5 p-1.5 pl-2 rounded-full transition-all cursor-pointer select-none ${
          showBorder ? 'bg-white border border-[#203247]/12 hover:border-[#347f7a]/50 shadow-2xs' : 'hover:bg-white/60'
        } ${isDropdownOpen ? 'ring-2 ring-[#347f7a]/20 border-[#347f7a]' : ''}`}
        aria-label="User Account Menu"
        aria-expanded={isDropdownOpen}
      >
        {/* Avatar Circle */}
        <div className="w-7 h-7 rounded-full bg-[#347f7a] text-[#f6f3eb] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
          {currentUser.avatarLetter || userInitial}
        </div>

        {/* User Info Label */}
        {!compact && (
          <div className="hidden sm:flex flex-col text-left pr-1 leading-tight">
            <span className="text-xs font-semibold text-[#203247] max-w-[130px] truncate">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-[#647895] font-mono-signal truncate max-w-[130px]">
              {currentUser.roleLabel || currentUser.role || 'Member'}
            </span>
          </div>
        )}

        <ChevronDown
          size={13}
          className={`text-[#647895] pr-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#203247]' : ''}`}
        />
      </button>

      {/* DROPDOWN MENU POPOVER */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl shadow-xl py-2 z-50 animate-fade-in backdrop-blur-md overflow-hidden">
          {/* User Profile Card Header */}
          <div className="px-4 py-3 border-b border-[#203247]/10 bg-white/70">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#347f7a] text-[#f6f3eb] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 mt-0.5">
                {currentUser.avatarLetter || userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[#203247] truncate">
                    {currentUser.name}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono-signal font-semibold border ${getBadgeStyle(currentUser.role)}`}>
                    {currentUser.roleLabel || currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-[#647895] truncate font-mono-signal mt-0.5">
                  {currentUser.email}
                </div>
                <div className="text-[10px] text-[#347f7a] font-mono-signal mt-0.5 flex items-center gap-1">
                  <AtSign size={10} />
                  <span>{usernameDisplay.replace('@', '')}</span>
                  {currentUser.instituteName && (
                    <span className="text-[#647895] truncate">• {currentUser.instituteName}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation / Action Options */}
          <div className="p-1.5 space-y-0.5">
            {/* Edit Profile */}
            <button
              type="button"
              onClick={openEditModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#203247] hover:bg-white rounded-xl transition-colors cursor-pointer text-left"
            >
              <Edit3 size={14} className="text-[#647895]" />
              <span>Edit Profile & Handle</span>
            </button>

            {/* Change Password */}
            <button
              type="button"
              onClick={() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
                setChangePasswordError('');
                setChangePasswordSuccess('');
                setIsChangePasswordModalOpen(true);
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#203247] hover:bg-white rounded-xl transition-colors cursor-pointer text-left"
            >
              <Key size={14} className="text-[#647895]" />
              <span>Change Password</span>
            </button>

            {/* Tiers & Seat Quotas (Super Admin) */}
            {currentUser.role === 'super-admin' && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('tiers');
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer text-left ${
                  activeTab === 'tiers'
                    ? 'bg-[#d9e8df]/60 text-[#347f7a] font-semibold'
                    : 'text-[#203247] hover:bg-white'
                }`}
              >
                <Layers size={14} className="text-[#347f7a]" />
                <span>Tiers & Seat Quotas</span>
              </button>
            )}

            {/* Quick Link: Return to Hub / Labs */}
            {activeTab !== 'hub' && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('hub');
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#203247] hover:bg-white rounded-xl transition-colors cursor-pointer text-left"
              >
                <Compass size={14} className="text-[#347f7a]" />
                <span>Return to Signal Hub</span>
              </button>
            )}

            {/* Quick Link: Super Admin Cockpit */}
            {currentUser.role === 'super-admin' && activeTab !== 'super-admin' && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('super-admin');
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#203247] hover:bg-white rounded-xl transition-colors cursor-pointer text-left"
              >
                <Shield size={14} className="text-amber-600" />
                <span>Super Admin Cockpit</span>
              </button>
            )}

            {/* Quick Link: Institute Admin Dashboard (Only for genuine campus admins) */}
            {currentUser.role === 'institute-admin' && activeTab !== 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#203247] hover:bg-white rounded-xl transition-colors cursor-pointer text-left"
              >
                <Building2 size={14} className="text-[#203247]" />
                <span>Campus Admin Portal</span>
              </button>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-[#203247]/8" />

            {/* Sign Out with Confirmation trigger */}
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsLogoutModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50/80 rounded-xl transition-colors cursor-pointer text-left"
            >
              <LogOut size={14} className="text-red-500" />
              <span>Sign Out...</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: LOGOUT CONFIRMATION POPUP */}
      {isLogoutModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#203247]/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} />
            </div>

            <h3 className="font-display text-lg font-normal text-[#203247] mb-1.5">
              Confirm Sign Out
            </h3>
            <p className="text-xs text-[#647895] leading-relaxed mb-6">
              Are you sure you want to log out of <strong className="text-[#203247]">{currentUser.email}</strong>? You will need your credentials to return to your workspace.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-[#647895] hover:text-[#203247] bg-white border border-[#203247]/15 rounded-2xl hover:bg-[#f5f3ed] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all cursor-pointer shadow-sm border-none"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: EDIT PROFILE */}
      {isEditProfileModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#203247]/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsEditProfileModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#203247]/10 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-[#347f7a]" />
                <h3 className="font-display text-lg font-normal text-[#203247]">Edit Profile</h3>
              </div>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-1.5 rounded-full hover:bg-[#f5f3ed] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto">
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check size={14} className="shrink-0 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                  Full Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                />
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                  Username Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[#647895] font-mono-signal text-xs">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all font-mono-signal"
                  />
                </div>
                <p className="text-[10px] text-[#647895] mt-1 font-mono-signal">
                  {currentUser.instituteId
                    ? `Scoped inside ${currentUser.instituteName || 'your university'}.`
                    : 'Unique in the global individual username space.'}
                </p>
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                  Email Address
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.email}
                  className="w-full px-4 py-2.5 bg-[#f5f3ed] border border-[#203247]/10 rounded-2xl text-xs text-[#647895] outline-none cursor-not-allowed font-mono-signal"
                />
              </div>

              <div className="pt-3 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#647895] hover:text-[#203247] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center gap-1.5"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: CHANGE PASSWORD */}
      {isChangePasswordModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#203247]/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsChangePasswordModalOpen(false)}
        >
          <div
            className="bg-[#fbf9f4] border border-[#203247]/15 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#203247]/10 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-[#347f7a]" />
                <h3 className="font-display text-lg font-normal text-[#203247]">Change Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="text-[#647895] hover:text-[#203247] p-1.5 rounded-full hover:bg-[#f5f3ed] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4 overflow-y-auto">
              {changePasswordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-500" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check size={14} className="shrink-0 text-emerald-600" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                  Signed in as
                </label>
                <div className="text-xs font-mono-signal text-[#203247] bg-white border border-[#203247]/10 rounded-2xl px-4 py-2.5">
                  {currentUser.email}
                </div>
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                  Current Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 text-[#647895] hover:text-[#203247] cursor-pointer border-none bg-transparent p-1"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                  New Password (Min 6 chars) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-[#647895] hover:text-[#203247] cursor-pointer border-none bg-transparent p-1"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono-signal text-[11px] uppercase tracking-[0.15em] text-[#647895] mb-1.5 font-medium">
                  Confirm New Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 bg-white border border-[#203247]/15 rounded-2xl text-xs text-[#203247] outline-none focus:border-[#347f7a] focus:ring-2 focus:ring-[#347f7a]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[#647895] hover:text-[#203247] cursor-pointer border-none bg-transparent p-1"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#203247]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isChangingPassword}
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#647895] hover:text-[#203247] cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] disabled:opacity-60 rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm border-none flex items-center gap-1.5"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
