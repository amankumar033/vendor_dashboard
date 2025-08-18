import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - Fetch a specific notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notificationId = parseInt(id);

    if (!notificationId || isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    const query = `
      SELECT id, type, title, message, description, for_admin, for_dealer, for_user, for_vendor,
             product_id, order_id, user_id, vendor_id, dealer_id, is_read, is_delivered,
             whatsapp_delivered, email_delivered, sms_delivered, metadata, created_at, updated_at
      FROM notifications 
      WHERE id = ?
    `;

    const notifications = await executeQuery(query, [notificationId]) as any[];

    if (notifications.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: notifications[0]
    });

  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific notification (mark as read, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notificationId = parseInt(id);
    const { action } = await request.json();

    if (!notificationId || isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Get current India/Delhi time
    const indiaTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    const currentTimestamp = indiaTime.replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6');

    let updateQuery: string;
    let message: string;

    if (action === 'mark_read') {
      updateQuery = `
        UPDATE notifications 
        SET is_read = 1, updated_at = ?
        WHERE id = ?
      `;
      message = 'Notification marked as read';
    } else if (action === 'mark_unread') {
      updateQuery = `
        UPDATE notifications 
        SET is_read = 0, updated_at = ?
        WHERE id = ?
      `;
      message = 'Notification marked as unread';
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await executeQuery(updateQuery, [currentTimestamp, notificationId]);

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

// DELETE - Delete a specific notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notificationId = parseInt(id);

    if (!notificationId || isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    // First check if the notification exists
    const checkQuery = `
      SELECT id FROM notifications 
      WHERE id = ?
    `;
    
    const existingNotifications = await executeQuery(checkQuery, [notificationId]) as any[];
    
    if (existingNotifications.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Delete the notification
    const deleteQuery = `
      DELETE FROM notifications 
      WHERE id = ?
    `;
    
    await executeQuery(deleteQuery, [notificationId]);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
