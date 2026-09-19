import { EmailProvider } from './EmailProvider';
import { ResendProvider } from './ResendProvider';
import { EmailJSProvider } from './EmailJSProvider';

export { EmailProvider, ResendProvider, EmailJSProvider };

/**
 * Registry of available email provider adapters.
 * In the future, to add a new provider (e.g. AWS SES, SendGrid, Postmark),
 * simply create its adapter file and register it here.
 */
const providerRegistry = new Map();

// Register default built-in providers
providerRegistry.set('resend', new ResendProvider());
providerRegistry.set('emailjs', new EmailJSProvider());

/**
 * Register a custom or newly added email provider adapter.
 * @param {string} name
 * @param {EmailProvider} providerInstance
 */
export const registerEmailProvider = (name, providerInstance) => {
  if (!(providerInstance instanceof EmailProvider)) {
    throw new Error('Provider must extend EmailProvider');
  }
  providerRegistry.set(name.toLowerCase(), providerInstance);
};

/**
 * Get the active email provider.
 * Priority:
 * 1. Explicitly requested name via argument or VITE_EMAIL_PROVIDER in .env
 * 2. ResendProvider (if configured)
 * 3. EmailJSProvider (if configured)
 * 4. ResendProvider (default)
 * @param {string} [preferredName]
 * @returns {EmailProvider}
 */
export const getEmailProvider = (preferredName = null) => {
  const chosenName = (
    preferredName ||
    import.meta.env.VITE_EMAIL_PROVIDER ||
    ''
  ).toLowerCase().trim();

  if (chosenName && providerRegistry.has(chosenName)) {
    return providerRegistry.get(chosenName);
  }

  // Auto-detection based on configured keys
  const resend = providerRegistry.get('resend');
  if (resend?.isConfigured()) {
    return resend;
  }

  const emailjs = providerRegistry.get('emailjs');
  if (emailjs?.isConfigured()) {
    return emailjs;
  }

  // Default to Resend provider
  return resend || new ResendProvider();
};
