import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import nodemailer from 'nodemailer';

// PUT - Update a service order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service_order_id = await params.id;
    const {
      vendor_id,
      service_status,
      payment_status,
      additional_notes
    } = await request.json();

    // Validate required fields
    if (!vendor_id || !service_status || !payment_status) {
      return NextResponse.json(
        { error: 'Vendor ID, service status, and payment status are required' },
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

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return NextResponse.json(
        { error: 'Invalid payment status. Must be one of: pending, paid, failed, refunded' },
        { status: 400 }
      );
    }

    // First check if the service order belongs to the vendor and get customer details
    const checkQuery = `
      SELECT so.*, u.email as customer_email, u.full_name as customer_name
      FROM service_orders so
      LEFT JOIN users u ON so.user_id = u.user_id
      WHERE so.service_order_id = ? AND so.vendor_id = ?
    `;
    
    const existingOrders = await executeQuery(checkQuery, [service_order_id, vendor_id]) as any[];
    
    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Service order not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    const order = existingOrders[0];
    const previousStatus = order.service_status;

    const updateQuery = `
      UPDATE service_orders 
      SET service_status = ?, payment_status = ?, additional_notes = ?
      WHERE service_order_id = ? AND vendor_id = ?
    `;

    await executeQuery(updateQuery, [
      service_status, payment_status, additional_notes || '', service_order_id, vendor_id
    ]);

    // Send email notification if status changed
    if (previousStatus !== service_status) {
      try {
        const recipientEmail = order.customer_email || 'customer@example.com';
        const customerName = order.customer_name || 'Customer';
        
        const emailSubject = `Service Order Status Updated - ${service_status.toUpperCase()}`;
        const emailBody = `
          <h2>Service Order Status Update</h2>
          <p>Dear ${customerName},</p>
          <p>Your service order has been updated.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${service_order_id}</p>
            <p><strong>Service:</strong> ${order.service_name}</p>
            <p><strong>Previous Status:</strong> ${previousStatus.toUpperCase()}</p>
            <p><strong>New Status:</strong> ${service_status.toUpperCase()}</p>
            <p><strong>Updated Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          ${service_status === 'scheduled' ? `
            <p>Your service has been scheduled. Please be ready at the specified time.</p>
          ` : service_status === 'cancelled' ? `
            <p>Your service has been cancelled. If you have any questions, please contact us.</p>
          ` : service_status === 'rejected' ? `
            <p>Your service request has been rejected. Please contact us for more information.</p>
          ` : service_status === 'refunded' ? `
            <p>Your payment has been refunded. Please allow 3-5 business days for the refund to appear in your account.</p>
          ` : `
            <p>Your service order status has been updated. Please check your dashboard for more details.</p>
          `}

          <p>Thank you for choosing our services!</p>
        `;

        console.log('📧 Sending status update email to:', recipientEmail);
        await sendEmail(recipientEmail, emailSubject, emailBody);
        console.log('✅ Status update email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Service order updated successfully'
    });

  } catch (error) {
    console.error('Error updating service order:', error);
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

// DELETE - Delete a service order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service_order_id = await params.id;
    const { vendor_id } = await request.json();

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // First check if the service order belongs to the vendor
    const checkQuery = `
      SELECT service_order_id FROM service_orders 
      WHERE service_order_id = ? AND vendor_id = ?
    `;
    
    const existingOrders = await executeQuery(checkQuery, [service_order_id, vendor_id]) as any[];
    
    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Service order not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    const deleteQuery = 'DELETE FROM service_orders WHERE service_order_id = ? AND vendor_id = ?';
    await executeQuery(deleteQuery, [service_order_id, vendor_id]);

    return NextResponse.json({
      success: true,
      message: 'Service order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 