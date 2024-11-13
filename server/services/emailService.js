const transporter = require('../../config/smtp');

class EmailService {
  async sendEmail(to, subject, content) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: to,
        subject: subject,
        html: content
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email envoyé:', info.messageId);
      return info;
    } catch (error) {
      console.error('Erreur d\'envoi d\'email:', error);
      throw error;
    }
  }

  async sendNotification(to, message) {
    return this.sendEmail(
      to,
      'Notification DockerFlow',
      `<div style="font-family: Arial, sans-serif;">
        <h2>Notification DockerFlow</h2>
        <p>${message}</p>
      </div>`
    );
  }
}

module.exports = new EmailService();
