const BASE_URL = 'http://localhost:3005/api';

async function testNotificationRemove() {
  console.log('Testing notification remove functionality...\n');
  
  // First, let's check current notifications
  console.log('1. Checking current notifications...');
  try {
    const response = await fetch(`${BASE_URL}/notifications?vendor_id=VND1`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Current notifications fetched successfully!');
      console.log('Total notifications:', data.notifications.length);
      
      // Show notifications that are visible to vendor (for_vendor = 1)
      const vendorNotifications = data.notifications.filter(n => n.for_vendor === 1);
      console.log('Notifications visible to vendor:', vendorNotifications.length);
      
      if (vendorNotifications.length > 0) {
        const testNotification = vendorNotifications[0];
        console.log('\nTesting with notification:', {
          id: testNotification.id,
          title: testNotification.title,
          for_vendor: testNotification.for_vendor
        });
        
        // Test removing the notification
        console.log('\n2. Testing remove functionality...');
        try {
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
            
            // Check if the notification is no longer visible to vendor
            console.log('\n3. Verifying notification is no longer visible...');
            const verifyResponse = await fetch(`${BASE_URL}/notifications?vendor_id=VND1`);
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              const updatedVendorNotifications = verifyData.notifications.filter(n => n.for_vendor === 1);
              console.log('Updated notifications visible to vendor:', updatedVendorNotifications.length);
              
              const removedNotification = verifyData.notifications.find(n => n.id === testNotification.id);
              if (removedNotification) {
                console.log('✅ Notification still exists in database but for_vendor =', removedNotification.for_vendor);
              } else {
                console.log('❌ Notification not found in database');
              }
            }
          } else {
            console.log('❌ Failed to remove notification:', removeData.error);
          }
        } catch (error) {
          console.log('❌ Error removing notification:', error.message);
        }
      } else {
        console.log('No notifications available to test with');
      }
    } else {
      console.log('❌ Error fetching notifications:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testNotificationRemove(); 