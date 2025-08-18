import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

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
    
    console.log('🔔 Service Request Action - Received data:', { notification_id, action, vendor_id });

    if (!notification_id || !action || !vendor_id) {
      console.log('❌ Service Request Action - Missing required fields:', { notification_id, action, vendor_id });
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
    
    console.log('🔔 Service Request Action - Found notifications:', notifications.length);
    
    if (notifications.length === 0) {
      console.log('❌ Service Request Action - No notification found for:', { notification_id, vendor_id });
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }

    const notification = notifications[0];
    const metadata = typeof notification.metadata === 'string' 
      ? JSON.parse(notification.metadata || '{}') 
      : notification.metadata || {};

    let updateQuery: string;
    let newNotificationType: string;
    let newTitle: string;
    let newMessage: string;
    let emailSubject: string;
    let emailBody: string;

    if (action === 'accept') {
      // Update notification type to service_order_accepted
      updateQuery = `
        UPDATE notifications 
        SET type = 'service_order_accepted', 
            title = ?, 
            message = ?,
            updated_at = NOW()
        WHERE id = ?
      `;
      
      newNotificationType = 'service_order_accepted';
      newTitle = 'Service Request Accepted';
      newMessage = `You have accepted the service request "${metadata.service_name}" from ${metadata.user_name || 'customer'}. The service is now confirmed and scheduled.`;
      
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
            updated_at = NOW()
        WHERE id = ?
      `;
      
      newNotificationType = 'service_order_rejected';
      newTitle = 'Service Request Rejected';
      newMessage = `You have rejected the service request "${metadata.service_name}" from ${metadata.user_name || 'customer'}. The customer has been notified.`;
      
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
    await executeQuery(updateQuery, [newTitle, newMessage, notification_id]);

    // Update service order status in service_orders table
    const serviceOrderStatus = action === 'accept' ? 'confirmed' : 'rejected';
    const updateServiceOrderQuery = `
      UPDATE service_orders 
      SET service_status = ?, 
          updated_at = NOW()
      WHERE service_order_id = ?
    `;
    
    try {
      await executeQuery(updateServiceOrderQuery, [serviceOrderStatus, metadata.service_order_id]);
      console.log(`✅ Service order status updated to ${serviceOrderStatus}`);
    } catch (orderError) {
      console.error('❌ Error updating service order status:', orderError);
      // Don't fail the request if order update fails
    }

    // Send email notification using the proper email service
    try {
      const { sendServiceOrderAcceptedEmail, sendServiceOrderRejectedEmail } = await import('@/lib/emailService');
      
      // Get customer email with multiple fallbacks
      const customerEmail = metadata.customer_email || metadata.user_email || metadata.email;
      
      if (!customerEmail) {
        console.log('⚠️ No customer email found in metadata:', metadata);
        throw new Error('No customer email available');
      }
      
      if (action === 'accept') {
        await sendServiceOrderAcceptedEmail(customerEmail, {
          customerName: metadata.customer_name || metadata.user_name,
          serviceName: metadata.service_name,
          serviceCategory: metadata.service_category,
          serviceType: metadata.service_type,
          basePrice: metadata.final_price || metadata.base_price,
          durationMinutes: metadata.service_duration || metadata.duration_minutes || 'N/A',
          serviceDate: metadata.service_date,
          serviceTime: metadata.service_time,
          serviceAddress: metadata.service_address
        });
      } else {
        await sendServiceOrderRejectedEmail(customerEmail, {
          customerName: metadata.customer_name || metadata.user_name,
          serviceName: metadata.service_name,
          serviceCategory: metadata.service_category,
          serviceType: metadata.service_type,
          serviceDate: metadata.service_date,
          serviceTime: metadata.service_time
        });
      }
      console.log(`✅ Email sent successfully for ${action} action`);
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Service request ${action}ed successfully`,
      notificationType: newNotificationType
    });

  } catch (error) {
    console.error('Error handling service request action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


