import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import nodemailer from 'nodemailer';

// GET - Fetch service requests for a specific vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get('vendor_id');

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT id, type, title, message, for_vendor, vendor_id, is_read, 
             metadata, created_at, updated_at
      FROM notifications 
      WHERE for_vendor = 1 
        AND vendor_id = ? 
        AND type = 'service_order_created'
      ORDER BY created_at DESC
    `;

    const serviceRequests = await executeQuery(query, [vendor_id]) as any[];

    return NextResponse.json({
      success: true,
      serviceRequests
    });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Handle service request action (accept/reject)
export async function POST(request: NextRequest) {
  try {
    const { notification_id, action, vendor_id } = await request.json();

    if (!notification_id || !action || !vendor_id) {
      return NextResponse.json(
        { error: 'Notification ID, action, and vendor ID are required' },
        { status: 400 }
      );
    }

    // Get the notification details
    const getNotificationQuery = `
      SELECT id, type, title, message, metadata, vendor_id
      FROM notifications 
      WHERE id = ? AND vendor_id = ? AND type = 'service_order_created'
    `;

    const notifications = await executeQuery(getNotificationQuery, [notification_id, vendor_id]) as any[];
    
    if (notifications.length === 0) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }

    const notification = notifications[0];
    const metadata = typeof notification.metadata === 'string' 
      ? JSON.parse(notification.metadata || '{}') 
      : notification.metadata || {};

    console.log('🔍 Metadata Debug:');
    console.log('Raw metadata:', notification.metadata);
    console.log('Parsed metadata:', metadata);
    console.log('User email:', metadata.user_email);
    console.log('Service name:', metadata.service_name);

    let updateQuery: string;
    let newNotificationType: string;
    let newTitle: string;
    let newMessage: string;
    let newDescription: string;
    let emailSubject: string;
    let emailBody: string;
    let serviceOrderStatus: string;

    if (action === 'accept') {
      // Update notification type to service_order_accepted
      updateQuery = `
        UPDATE notifications 
        SET type = 'service_order_accepted', 
            title = ?, 
            message = ?,
            description = ?,
            updated_at = NOW()
        WHERE id = ?
      `;
      
      newNotificationType = 'service_order_accepted';
      newTitle = 'Service Request Accepted';
      newMessage = `Service request "${metadata.service_name}" has been accepted.`;
      newDescription = `Your service request for "${metadata.service_name}" has been accepted by the vendor. The service will be scheduled as requested on ${metadata.service_date} at ${metadata.service_time}. The vendor will contact you shortly to confirm the final details and schedule. Please ensure you are available at the specified time and location.`;
      serviceOrderStatus = 'scheduled';
      
      emailSubject = 'Service Request Accepted';
      emailBody = `
        <h2>Service Request Accepted</h2>
        <p>Dear ${metadata.user_name || 'Customer'},</p>
        <p>Your service request has been accepted by the vendor.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Service Details:</h3>
          <p><strong>Service:</strong> ${metadata.service_name}</p>
          <p><strong>Category:</strong> ${metadata.service_category}</p>
          <p><strong>Type:</strong> ${metadata.service_type}</p>
          <p><strong>Base Price:</strong> $${metadata.base_price}</p>
          <p><strong>Duration:</strong> ${metadata.duration_minutes} minutes</p>
          <p><strong>Requested Date:</strong> ${metadata.service_date}</p>
          <p><strong>Requested Time:</strong> ${metadata.service_time}</p>
          <p><strong>Service Address:</strong> ${metadata.service_address}</p>
        </div>
        <p>The vendor will contact you shortly to confirm the final details and schedule.</p>
        <p>Thank you for choosing our services!</p>
      `;

    } else if (action === 'reject') {
      // Update notification type to service_order_rejected
      updateQuery = `
        UPDATE notifications 
        SET type = 'service_order_rejected', 
            title = ?, 
            message = ?,
            description = ?,
            updated_at = NOW()
        WHERE id = ?
      `;
      
      newNotificationType = 'service_order_rejected';
      newTitle = 'Service Request Rejected';
      newMessage = `Service request "${metadata.service_name}" has been rejected.`;
      newDescription = `We regret to inform you that your service request for "${metadata.service_name}" has been rejected by the vendor. This could be due to unavailability, scheduling conflicts, or other operational reasons. Please try another service or vendor that better matches your requirements. We apologize for any inconvenience caused.`;
      serviceOrderStatus = 'rejected';
      
      emailSubject = 'Service Request Rejected';
      emailBody = `
        <h2>Service Request Rejected</h2>
        <p>Dear ${metadata.user_name || 'Customer'},</p>
        <p>We regret to inform you that your service request has been rejected by the vendor.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Service Details:</h3>
          <p><strong>Service:</strong> ${metadata.service_name}</p>
          <p><strong>Category:</strong> ${metadata.service_category}</p>
          <p><strong>Type:</strong> ${metadata.service_type}</p>
          <p><strong>Requested Date:</strong> ${metadata.service_date}</p>
          <p><strong>Requested Time:</strong> ${metadata.service_time}</p>
        </div>
        <p>Please try another service or vendor that better matches your requirements.</p>
        <p>We apologize for any inconvenience caused.</p>
      `;

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Update the notification
    await executeQuery(updateQuery, [newTitle, newMessage, newDescription, notification_id]);

    // Update service order status in service_orders table
    if (metadata.service_order_id) {
      const updateServiceOrderQuery = `
        UPDATE service_orders 
        SET service_status = ?
        WHERE service_order_id = ?
      `;
      
      try {
        await executeQuery(updateServiceOrderQuery, [serviceOrderStatus, metadata.service_order_id]);
        console.log(`✅ Service order status updated to ${serviceOrderStatus}`);
      } catch (orderError) {
        console.error('❌ Error updating service order status:', orderError);
        // Don't fail the request if order update fails
      }
    } else {
      console.log('⚠️ No service_order_id found in metadata, skipping service order update');
    }

    // Send email notification
    try {
      const recipientEmail = metadata.customer_email || metadata.user_email || 'test@example.com';
      console.log('📧 Sending email to:', recipientEmail);
      await sendEmail(recipientEmail, emailSubject, emailBody);
      console.log(`✅ Email sent successfully for ${action} action`);
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    // Also send email for payment status changes if applicable
    if (metadata.payment_status && metadata.payment_status !== 'pending') {
      try {
        const paymentEmailSubject = `Payment Status Update - ${metadata.payment_status.toUpperCase()}`;
        const paymentEmailBody = `
          <h2>Payment Status Update</h2>
          <p>Dear ${metadata.user_name || 'Customer'},</p>
          <p>Your payment status has been updated.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Payment Details:</h3>
            <p><strong>Service:</strong> ${metadata.service_name}</p>
            <p><strong>Order ID:</strong> ${metadata.service_order_id}</p>
            <p><strong>Payment Status:</strong> ${metadata.payment_status.toUpperCase()}</p>
            <p><strong>Amount:</strong> ₹${metadata.final_price}</p>
            <p><strong>Payment Method:</strong> ${metadata.payment_method || 'Not specified'}</p>
            <p><strong>Updated Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          ${metadata.payment_status === 'paid' ? `
            <p>Your payment has been successfully processed. Thank you for your payment!</p>
            <p>Your service will be scheduled as requested.</p>
          ` : metadata.payment_status === 'failed' ? `
            <p>Your payment has failed. Please try again or contact our support team for assistance.</p>
            <p>You can retry the payment from your dashboard.</p>
          ` : metadata.payment_status === 'refunded' ? `
            <p>Your payment has been refunded. Please allow 3-5 business days for the refund to appear in your account.</p>
            <p>If you have any questions about the refund, please contact our support team.</p>
          ` : `
            <p>Your payment status has been updated. Please check your dashboard for more details.</p>
          `}

          <p>Thank you for choosing our services!</p>
          <p>Best regards,<br>Your Service Team</p>
        `;

        await sendEmail(recipientEmail, paymentEmailSubject, paymentEmailBody);
        console.log('✅ Payment status email sent successfully');
      } catch (paymentEmailError) {
        console.error('❌ Error sending payment status email:', paymentEmailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Service request ${action}ed successfully`,
      notificationType: newNotificationType,
      serviceOrderStatus: serviceOrderStatus
    });

  } catch (error) {
    console.error('Error handling service request action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Email sending function
async function sendEmail(to: string, subject: string, htmlBody: string) {
  // Debug: Log environment variables
  console.log('🔍 Email Configuration Debug:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : '***NOT SET***');
  console.log('SMTP_FROM:', process.env.SMTP_FROM);
  
  // Temporary hardcoded credentials for testing
  const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'r0192399@gmail.com',
      pass: 'brmpnxyzenefyndb'
    }
  };
  
  console.log('🔧 Using hardcoded SMTP config for testing');
  
  const transporter = nodemailer.createTransport(smtpConfig);

  const mailOptions = {
    from: 'r0192399@gmail.com',
    to: to,
    subject: subject,
    html: htmlBody,
  };

  console.log('📧 Attempting to send email to:', to);
  await transporter.sendMail(mailOptions);
}
