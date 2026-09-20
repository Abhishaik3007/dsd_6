import React from 'react';

/**
 * SignalSchoolLogo - Official Brand Mark
 * 
 * Renders the exact high-resolution brand artwork provided:
 * - Emerald mint to deep cyber navy chevron
 * - Glowing apex aperture node
 * - Inner logic core triangle with crisp negative-space channel
 * - Transparent background or padded white rounded-triangle badge
 */
export const SignalSchoolLogo = ({
  size = 32,
  animated = false,
  badge = false,
  className = '',
  alt = 'signalschool logo',
  // Keep idPrefix for backwards compatibility
  idPrefix = 'ss-logo'
}) => {
  const imgSrc = badge ? '/signalschool-logo-badge.webp' : '/signalschool-logo.webp';
  const fallbackSrc = badge ? '/signalschool-logo-badge.png' : '/signalschool-logo.png';

  return (
    <span
      className={`inline-flex items-center justify-center select-none shrink-0 ${className} ${animated ? 'relative' : ''}`}
      style={{
        width: size,
        height: size,
        verticalAlign: 'middle'
      }}
    >
      {animated && (
        <span
          className="absolute inset-0 rounded-full bg-[#00DF9A]/20 blur-sm pointer-events-none animate-pulse"
          style={{ transform: 'scale(1.2)' }}
        />
      )}
      <img
        src={imgSrc}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-contain relative z-10 block"
        loading="eager"
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = fallbackSrc;
        }}
      />
    </span>
  );
};
