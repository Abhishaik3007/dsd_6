import { EmailProvider } from './EmailProvider';

/**
 * Resend Email Provider Adapter.
 * Dispatches emails via Resend REST API (https://resend.com).
 * Free tier includes 3,000 emails/month.
 */
export class ResendProvider extends EmailProvider {
  constructor({ apiKey = null, fromAddress = null } = {}) {
    super();
    this.apiKey = apiKey || import.meta.env.VITE_RESEND_API_KEY || '';
    this.fromAddress = fromAddress || import.meta.env.VITE_RESEND_FROM || 'SignalSchool <onboarding@resend.dev>';
  }

  get id() {
    return 'resend';
  }

  /**
   * Check if Resend is configured with an API key
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.startsWith('re_'));
  }

  async sendEmail({ to, subject, html, text = '', from = '' }) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Resend API key is missing or invalid. Please configure VITE_RESEND_API_KEY in .env.local'
      };
    }

    const recipients = Array.isArray(to) ? to : [to];
    const sender = from || this.fromAddress;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: sender,
          to: recipients,
          subject,
          html,
          text: text || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('Resend dispatch error response:', data);
        return {
          success: false,
          error: data?.message || data?.error || `Resend error status ${response.status}`
        };
      }

      return {
        success: true,
        messageId: data.id,
        provider: 'resend'
      };
    } catch (err) {
      console.error('Resend network error:', err);
      return {
        success: false,
        error: err.message || 'Network error connecting to Resend API'
      };
    }
  }
}
