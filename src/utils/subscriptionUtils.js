/**
 * Subscription & Expiration utilities
 */

/**
 * Check whether a date string (YYYY-MM-DD or ISO string) has expired.
 * Compares against the end of that day (23:59:59.999) if YYYY-MM-DD format.
 */
export const isDateExpired = (dateString) => {
  if (!dateString) return false;
  try {
    const expiry = new Date(dateString);
    if (isNaN(expiry.getTime())) return false;
    // If format is YYYY-MM-DD (10 characters), grant access until the end of that day (23:59:59.999)
    if (typeof dateString === 'string' && dateString.trim().length === 10) {
      expiry.setHours(23, 59, 59, 999);
    }
    return expiry.getTime() < Date.now();
  } catch {
    return false;
  }
};

/**
 * Check if a user's subscription access is expired.
 * 
 * Rules:
 * - Super Admins ('super-admin') never expire (always allowed).
 * - Institute Admins ('institute-admin') can ALWAYS log in even if the institute contract is expired,
 *   so they can manage/renew their campus license.
 * - Enrolled users under an institution (students, faculty):
 *   If the institution's contract is expired or status is 'expired', their login/access is blocked.
 * - General/individual users (no institution):
 *   If their subscriptionExpiresAt/contractEnd/expiresAt is in the past or status is 'expired', their login/access is blocked.
 *
 * @returns {{ isExpired: boolean, type?: string, message?: string, expiresAt?: string, instituteName?: string, adminEmail?: string, isInstituteAdmin?: boolean }}
 */
export const checkSubscriptionAccess = (userProfile, institutes = []) => {
  if (!userProfile) return { isExpired: false };

  const role = (userProfile.role || '').toLowerCase();

  // Super Admin is never blocked
  if (role === 'super-admin') {
    return { isExpired: false };
  }

  // Institute Admin is ALWAYS allowed to log in (so they can renew / view billing / manage seats)
  if (role === 'institute-admin') {
    return { isExpired: false, isInstituteAdmin: true };
  }

  // Check if member status is Revoked (direct profile flag)
  if (userProfile.status === 'Revoked') {
    const inst = (institutes || []).find(i => i.id === userProfile.instituteId);
    return {
      isExpired: true,
      isRevoked: true,
      type: 'revoked',
      instituteName: inst?.name || userProfile.instituteName || '',
      adminEmail: inst?.adminEmail || '',
      message: `Your seat license has been revoked by campus administration. Please contact your campus administrator (${inst?.adminEmail || 'admin'}) to restore your access.`
    };
  }

  // Check Institutional accounts (Students, Faculty, Members attached to an institute)
  if (userProfile.instituteId) {
    const inst = (institutes || []).find(i => i.id === userProfile.instituteId);
    if (inst) {
      // Check if this user is marked as Revoked in the institute members roster
      const cleanEmail = (userProfile.email || '').toLowerCase().trim();
      const memberInInst = (inst.members || []).find(
        m => (m.email && m.email.toLowerCase().trim() === cleanEmail) ||
             (m.id && (m.id === userProfile.id || m.id === userProfile.uid))
      );
      if (memberInInst && memberInInst.status === 'Revoked') {
        return {
          isExpired: true,
          isRevoked: true,
          type: 'revoked',
          instituteName: inst.name,
          adminEmail: inst.adminEmail || '',
          message: `Your seat license for ${inst.name} has been revoked by campus administration. Please contact your campus administrator (${inst.adminEmail || 'admin'}) to restore your access.`
        };
      }

      const isExpired = isDateExpired(inst.contractEnd) || inst.status === 'expired';
      if (isExpired) {
        return {
          isExpired: true,
          type: 'institute',
          instituteName: inst.name,
          adminEmail: inst.adminEmail || '',
          expiresAt: inst.contractEnd,
          message: `Access for ${inst.name} concluded on ${inst.contractEnd || 'the contract expiry date'}. Please contact your campus administrator (${inst.adminEmail || 'admin'}) to renew institutional licensing.`
        };
      }
    }
  }

  // Check Individual / General accounts
  const individualExpiry = userProfile.subscriptionExpiresAt || userProfile.contractEnd || userProfile.expiresAt;
  const isIndividualStatusExpired = userProfile.subscriptionStatus === 'expired' || userProfile.status === 'expired';
  if (individualExpiry || isIndividualStatusExpired) {
    const isExpired = isDateExpired(individualExpiry) || isIndividualStatusExpired;
    if (isExpired) {
      return {
        isExpired: true,
        type: 'individual',
        expiresAt: individualExpiry,
        message: `Your individual subscription plan concluded on ${individualExpiry || 'the renewal date'}. Please renew your plan to restore access to simulation labs and workspaces.`
      };
    }
  }

  return { isExpired: false };
};
