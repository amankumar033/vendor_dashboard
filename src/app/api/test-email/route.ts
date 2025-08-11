import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json();

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

    console.log('🔧 Testing SMTP Configuration:');
    console.log('Host:', smtpConfig.host);
    console.log('Port:', smtpConfig.port);
    console.log('User:', smtpConfig.auth.user);
    console.log('Password:', smtpConfig.auth.pass ? '***SET***' : '***NOT SET***');

    const transporter = nodemailer.createTransport(smtpConfig);

    // Verify SMTP connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    const mailOptions = {
      from: 'r0192399@gmail.com',
      to: to || 'test@example.com',
      subject: subject || 'Test Email from Vendor Dashboard',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your vendor dashboard.</p>
        <p><strong>Message:</strong> ${message || 'No message provided'}</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent to test the email functionality of your vendor dashboard.
        </p>
      `
    };

    console.log('📧 Sending test email to:', mailOptions.to);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      to: mailOptions.to
    });

  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Email test endpoint',
    usage: {
      method: 'POST',
      body: {
        to: 'recipient@example.com (optional)',
        subject: 'Email subject (optional)',
        message: 'Email message (optional)'
      }
    },
    example: {
      to: 'test@example.com',
      subject: 'Test Email',
      message: 'This is a test message'
    }
  });
}
