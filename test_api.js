const BASE_URL = 'http://localhost:3005/api';

async function testAPI() {
  console.log('Testing API endpoints...\n');
  
  // Test dashboard stats
  console.log('1. Testing dashboard stats...');
  try {
    const statsResponse = await fetch(`${BASE_URL}/dashboard-stats?vendor_id=VND1`);
    const statsData = await statsResponse.json();
    console.log('Response:', JSON.stringify(statsData, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n2. Testing recent services...');
  try {
    const servicesResponse = await fetch(`${BASE_URL}/recent-services?vendor_id=VND1&limit=3`);
    const servicesData = await servicesResponse.json();
    console.log('Response:', JSON.stringify(servicesData, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n3. Testing recent service orders...');
  try {
    const ordersResponse = await fetch(`${BASE_URL}/recent-service-orders?vendor_id=VND1&limit=3`);
    const ordersData = await ordersResponse.json();
    console.log('Response:', JSON.stringify(ordersData, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n4. Testing login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'vendor@gmail.com',
        password: 'password123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Response:', JSON.stringify(loginData, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n5. Testing notifications...');
  try {
    const notificationsResponse = await fetch(`${BASE_URL}/notifications?vendor_id=VND1&limit=5`);
    const notificationsData = await notificationsResponse.json();
    console.log('Response:', JSON.stringify(notificationsData, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAPI(); 