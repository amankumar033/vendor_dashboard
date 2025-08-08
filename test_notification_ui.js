const BASE_URL = 'http://localhost:3005/api';

async function testNotificationUI() {
  console.log('Testing notification UI functionality...\n');
  
  // Test 1: Check if notifications are being fetched
  console.log('1. Testing notification fetch...');
  try {
    const response = await fetch(`${BASE_URL}/notifications?vendor_id=VND1`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Notifications fetched successfully!');
      console.log('Total notifications:', data.notifications.length);
      
      if (data.notifications.length > 0) {
        console.log('Sample notification:', {
          id: data.notifications[0].id,
          title: data.notifications[0].title,
          type: data.notifications[0].type,
          is_read: data.notifications[0].is_read
        });
      }
    } else {
      console.log('❌ Error fetching notifications:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Test the remove functionality directly
  console.log('\n2. Testing remove functionality...');
  try {
    // First, get a notification to remove
    const getResponse = await fetch(`${BASE_URL}/notifications?vendor_id=VND1`);
    const getData = await getResponse.json();
    
    if (getData.success && getData.notifications.length > 0) {
      const testNotification = getData.notifications[0];
      console.log('Testing remove on notification:', testNotification.id);
      
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
        console.log('✅ Remove functionality works!');
      } else {
        console.log('❌ Remove failed:', removeData.error);
      }
    } else {
      console.log('No notifications available to test');
    }
  } catch (error) {
    console.log('❌ Error testing remove:', error.message);
  }

  // Test 3: Check the dashboard page
  console.log('\n3. Testing dashboard page accessibility...');
  try {
    const dashboardResponse = await fetch('http://localhost:3005/dashboard');
    console.log('Dashboard response status:', dashboardResponse.status);
    
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard page is accessible');
    } else {
      console.log('❌ Dashboard page not accessible');
    }
  } catch (error) {
    console.log('❌ Error accessing dashboard:', error.message);
  }
}

testNotificationUI(); 