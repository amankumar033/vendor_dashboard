const nodemailer = require('nodemailer');

// Test email configuration
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'r0192399@gmail.com',
    pass: 'brmpnxyzenefyndb'
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(smtpConfig);

async function testEmail() {
  try {
    console.log('📧 Testing email configuration...');
    
    const mailOptions = {
      from: 'r0192399@gmail.com',
      to: 'test@example.com', // Replace with a real email for testing
      subject: 'Test Email - Service Order Status Update',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p>If you receive this email, the email configuration is working properly.</p>
        <p>Best regards,<br>Your Service Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

// Test the email service
testEmail();
