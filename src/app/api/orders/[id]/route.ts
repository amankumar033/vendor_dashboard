import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import nodemailer from 'nodemailer';

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order_id = id;
    const { service_status, vendor_id } = await request.json();

    if (!service_status || !vendor_id) {
      return NextResponse.json(
        { error: 'Service status and vendor ID are required' },
        { status: 400 }
      );
    }

    // Validate service status
    const validServiceStatuses = ['pending', 'scheduled', 'cancelled', 'rejected', 'refunded'];
    if (!validServiceStatuses.includes(service_status)) {
      return NextResponse.json(
        { error: 'Invalid service status. Must be one of: pending, scheduled, cancelled, rejected, refunded' },
        { status: 400 }
      );
    }

    // First check if the order belongs to the vendor and get customer details
    const checkQuery = `
      SELECT so.*, u.email as customer_email, u.full_name as customer_name
      FROM ServiceOrders so
      LEFT JOIN users u ON so.user_id = u.user_id
      WHERE so.service_order_id = ? AND so.vendor_id = ?
    `;
    
    const existingOrders = await executeQuery(checkQuery, [order_id, vendor_id]) as any[];
    
    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    const order = existingOrders[0];
    const previousStatus = order.service_status;

    const updateQuery = `
      UPDATE ServiceOrders 
      SET service_status = ?
      WHERE service_order_id = ? AND vendor_id = ?
    `;

    await executeQuery(updateQuery, [service_status, order_id, vendor_id]);

    // Send email notification if status changed
    if (previousStatus !== service_status) {
      try {
        // Enhanced email recipient validation
        const recipientEmail = order.customer_email;
        const customerName = order.customer_name || 'Customer';
        
        // Log customer email details for debugging
        console.log('🔍 Customer email details:', {
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          user_id: order.user_id,
          order_id: order_id
        });
        
        if (!recipientEmail || recipientEmail === 'customer@example.com') {
          console.warn('⚠️  No valid customer email found for order:', order_id);
          console.warn('⚠️  Cannot send status update email without customer email');
          console.warn('⚠️  Status update email will be skipped for:', service_status);
          // Continue execution - don't return early, just skip email sending
        } else {
        
        const emailSubject = `Service Order Status Updated - ${service_status.toUpperCase()}`;
        const emailBody = `
          <h2>Service Order Status Update</h2>
          <p>Dear ${customerName},</p>
          <p>Your service order has been updated.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order_id}</p>
            <p><strong>Service:</strong> ${order.service_name}</p>
            <p><strong>Previous Status:</strong> ${previousStatus.toUpperCase()}</p>
            <p><strong>New Status:</strong> ${service_status.toUpperCase()}</p>
            <p><strong>Updated Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Service Date:</strong> ${order.service_date}</p>
            <p><strong>Service Time:</strong> ${order.service_time}</p>
            <p><strong>Service Address:</strong> ${order.service_address}</p>
            ${order.final_price ? `<p><strong>Amount:</strong> ₹${order.final_price}</p>` : ''}
          </div>

          ${service_status === 'scheduled' ? `
            <p>Your service has been scheduled. Please be ready at the specified time and location.</p>
            <p>The vendor will contact you shortly to confirm the final details.</p>
          ` : service_status === 'cancelled' ? `
            <p><strong>Your service has been cancelled.</strong></p>
            <p>We apologize for any inconvenience caused. If you have any questions, please contact us immediately.</p>
            <p>You may be eligible for a full refund depending on our cancellation policy.</p>
            <p>Our customer service team will contact you shortly regarding the refund process.</p>
          ` : service_status === 'rejected' ? `
            <p>Your service request has been rejected. Please contact us for more information.</p>
            <p>You may try booking with a different vendor or service.</p>
          ` : service_status === 'refunded' ? `
            <p>Your payment has been refunded. Please allow 3-5 business days for the refund to appear in your account.</p>
            <p>If you have any questions about the refund, please contact our support team.</p>
          ` : `
            <p>Your service order status has been updated. Please check your dashboard for more details.</p>
          `}

          <p>Thank you for choosing our services!</p>
          <p>Best regards,<br>Your Service Team</p>
        `;

        console.log('📧 Sending status update email to:', recipientEmail);
        console.log('📧 Email subject:', emailSubject);
        console.log('📧 Status change:', `${previousStatus} → ${service_status}`);
        
        await sendEmail(recipientEmail, emailSubject, emailBody);
        console.log('✅ Status update email sent successfully to:', recipientEmail);
        
          // Special logging for cancellation emails
          if (service_status === 'cancelled') {
            console.log('📧 CANCELLATION EMAIL SENT SUCCESSFULLY to:', recipientEmail);
            console.log('📧 Order ID:', order_id);
            console.log('📧 Customer:', customerName);
          }
        }
        
      } catch (emailError) {
        console.error('❌ Error sending status update email:', emailError);
        console.error('❌ Email error details:', {
          recipientEmail: order.customer_email,
          service_status,
          previousStatus,
          order_id
        });
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Email sending function
async function sendEmail(to: string, subject: string, htmlBody: string) {
  const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'r0192399@gmail.com',
      pass: 'brmpnxyzenefyndb'
    }
  };
  
  const transporter = nodemailer.createTransport(smtpConfig);

  const mailOptions = {
    from: 'r0192399@gmail.com',
    to: to,
    subject: subject,
    html: htmlBody,
  };

  await transporter.sendMail(mailOptions);
} 