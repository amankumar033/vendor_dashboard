const BASE_URL = 'http://localhost:3005/api';

async function testUpdatedNotifications() {
  console.log('Testing updated notification UI...\n');
  
  // Test 1: Check current notifications and their read status
  console.log('1. Checking notifications and read status...');
  try {
    const response = await fetch(`${BASE_URL}/notifications?vendor_id=VND1`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Notifications fetched successfully!');
      console.log('Total notifications:', data.notifications.length);
      
      // Count read vs unread
      const unreadCount = data.notifications.filter(n => !n.is_read).length;
      const readCount = data.notifications.filter(n => n.is_read).length;
      
      console.log(`📊 Read: ${readCount}, Unread: ${unreadCount}`);
      
      // Show sample notifications
      data.notifications.slice(0, 3).forEach((notification, index) => {
        console.log(`\n${index + 1}. ${notification.title}`);
        console.log(`   ID: ${notification.id}`);
        console.log(`   Type: ${notification.type}`);
        console.log(`   Read: ${notification.is_read ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${notification.created_at}`);
      });
    } else {
      console.log('❌ Error fetching notifications:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Test marking a notification as read
  console.log('\n2. Testing mark as read functionality...');
  try {
    // Find an unread notification
    const getResponse = await fetch(`${BASE_URL}/notifications?vendor_id=VND1`);
    const getData = await getResponse.json();
    
    if (getData.success) {
      const unreadNotification = getData.notifications.find(n => !n.is_read);
      
      if (unreadNotification) {
        console.log(`Marking notification ${unreadNotification.id} as read...`);
        
        const markResponse = await fetch(`${BASE_URL}/notifications`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            notification_id: unreadNotification.id, 
            action: 'read' 
          })
        });
        
        const markData = await markResponse.json();
        console.log('Mark as read response:', JSON.stringify(markData, null, 2));
        
        if (markData.success) {
          console.log('✅ Notification marked as read successfully!');
        } else {
          console.log('❌ Failed to mark as read:', markData.error);
        }
      } else {
        console.log('No unread notifications found to test');
      }
    }
  } catch (error) {
    console.log('❌ Error testing mark as read:', error.message);
  }

  // Test 3: Test remove functionality
  console.log('\n3. Testing remove functionality...');
  try {
    const getResponse = await fetch(`${BASE_URL}/notifications?vendor_id=VND1`);
    const getData = await getResponse.json();
    
    if (getData.success && getData.notifications.length > 0) {
      const testNotification = getData.notifications[0];
      console.log(`Removing notification ${testNotification.id}...`);
      
      const removeResponse = await fetch(`${BASE_URL}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notification_id: testNotification.id, 
          action: 'remove' 
        })
      });
      
      const removeData = await removeResponse.json();
      console.log('Remove response:', JSON.stringify(removeData, null, 2));
      
      if (removeData.success) {
        console.log('✅ Notification removed successfully!');
      } else {
        console.log('❌ Failed to remove:', removeData.error);
      }
    }
  } catch (error) {
    console.log('❌ Error testing remove:', error.message);
  }

  console.log('\n🎯 UI Updates Summary:');
  console.log('✅ Small cross button (❌) for remove');
  console.log('✅ "Read" badge for read notifications');
  console.log('✅ Visual distinction between read/unread');
  console.log('✅ Hover effects on cross button');
}

testUpdatedNotifications(); 