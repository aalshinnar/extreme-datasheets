const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email, verificationLink) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Extreme Networks Datasheets Portal</h2>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationLink}" style="background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><code>${verificationLink}</code></p>
        <p>This link will expire in 24 hours.</p>
        <hr />
        <p style="color: #999; font-size: 12px;">
          If you didn't register for this account, please ignore this email.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your Email - Extreme Networks Datasheets',
        html: htmlContent,
      });
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${firstName || 'User'}!</h2>
        <p>Your email has been verified successfully. You now have access to:</p>
        <ul>
          <li>Browse all Extreme Networks product datasheets</li>
          <li>Download datasheets in PDF format</li>
          <li>Search for specific products and documentation</li>
        </ul>
        <p>
          <a href="${process.env.APP_URL}/login" style="background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Portal
          </a>
        </p>
        <hr />
        <p style="color: #999; font-size: 12px;">
          Extreme Networks Datasheets Portal
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to Extreme Networks Datasheets',
        html: htmlContent,
      });
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, resetLink) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link:</p>
        <p><code>${resetLink}</code></p>
        <p>This link will expire in 1 hour.</p>
        <hr />
        <p style="color: #999; font-size: 12px;">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset - Extreme Networks Datasheets',
        html: htmlContent,
      });
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
