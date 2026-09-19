/**
 * Abstract Base Class for Email Providers.
 * Any email delivery adapter (Resend, SendGrid, Postmark, AWS SES, EmailJS, SMTP)
 * must implement this contract.
 */
export class EmailProvider {
  /**
   * Send an email.
   * @param {Object} options
   * @param {string|string[]} options.to - Recipient email address(es)
   * @param {string} options.subject - Email subject line
   * @param {string} options.html - HTML email body
   * @param {string} [options.text] - Optional plain text alternative
   * @param {string} [options.from] - Optional override for sender address
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendEmail({ to, subject, html, text = '', from = '' }) {
    throw new Error('sendEmail must be implemented by subclass');
  }

  /**
   * Unique identifier of this provider (e.g. 'resend', 'emailjs', 'sendgrid')
   */
  get id() {
    return 'generic';
  }
}
