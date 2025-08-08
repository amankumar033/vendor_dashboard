import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch notifications for a specific vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get('vendor_id');
    const limit = searchParams.get('limit') || '10';

    if (!vendor_id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT id, type, title, message, for_admin, for_dealer, for_user, for_vendor,
             product_id, order_id, user_id, vendor_id, dealer_id, is_read, is_delivered,
             whatsapp_delivered, email_delivered, sms_delivered, metadata, created_at, updated_at
      FROM notifications 
      WHERE for_vendor = 1 AND vendor_id = ?
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)}
    `;

    const notifications = await executeQuery(query, [vendor_id]) as any[];

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Mark notification as read or remove from vendor view
export async function PUT(request: NextRequest) {
  try {
    const { notification_id, action } = await request.json();

    if (!notification_id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    let updateQuery: string;
    let message: string;

    if (action === 'remove') {
      // Set for_vendor to 0 to remove from vendor view
      updateQuery = `
        UPDATE notifications 
        SET for_vendor = 0, updated_at = NOW()
        WHERE id = ?
      `;
      message = 'Notification removed from view';
    } else {
      // Default action: mark as read
      updateQuery = `
        UPDATE notifications 
        SET is_read = 1, updated_at = NOW()
        WHERE id = ?
      `;
      message = 'Notification marked as read';
    }

    await executeQuery(updateQuery, [notification_id]);

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 