import React from 'react';

/**
 * Ultra-Minimal Elastic 3-Dot Wave / Typing Pulse Loader.
 * Clean, smooth, modern aesthetic inspired by iMessage / Stripe / Slack.
 */
export const SignalButtonLoader = ({
  label = 'Verifying...',
  className = ''
}) => {
  return (
    <span className={`inline-flex items-center justify-center gap-2 select-none ${className}`}>
      {/* 3 Elastic Bouncing Dots */}
      <span className="inline-flex items-center gap-1.5 h-3 px-0.5" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-typing-dot-1" />
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-typing-dot-2" />
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-typing-dot-3" />
      </span>

      {/* Clean, unadorned label */}
      {label && (
        <span className="text-xs font-semibold text-current opacity-95">
          {label}
        </span>
      )}
    </span>
  );
};

export default SignalButtonLoader;
