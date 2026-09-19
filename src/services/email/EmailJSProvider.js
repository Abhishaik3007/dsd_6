import { EmailProvider } from './EmailProvider';

/**
 * EmailJS Provider Adapter.
 * Dispatches emails directly via EmailJS REST API (https://www.emailjs.com).
 */
export class EmailJSProvider extends EmailProvider {
  constructor({ serviceId = null, templateId = null, publicKey = null } = {}) {
    super();
    this.serviceId = serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.templateId = templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.publicKey = publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
  }

  get id() {
    return 'emailjs';
  }

  isConfigured() {
    return Boolean(this.serviceId && this.templateId && this.publicKey);
  }

  async sendEmail({ to, subject, html, text = '', templateParams = {} }) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'EmailJS is not fully configured. Missing serviceId, templateId, or publicKey.'
      };
    }

    const recipient = Array.isArray(to) ? to[0] : to;

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: this.serviceId,
          template_id: this.templateId,
          user_id: this.publicKey,
          template_params: {
            to_email: recipient,
            subject,
            html_message: html,
            message: text || html,
            ...templateParams
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          success: false,
          error: `EmailJS error (${response.status}): ${errText}`
        };
      }

      return {
        success: true,
        provider: 'emailjs'
      };
    } catch (err) {
      console.error('EmailJS error:', err);
      return {
        success: false,
        error: err.message || 'Network error connecting to EmailJS'
      };
    }
  }
}
