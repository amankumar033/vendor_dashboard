import fetch from 'node-fetch';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test the service requests API
    const response = await fetch('http://localhost:3005/api/service-requests?vendor_id=VND1');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.serviceRequests.length > 0) {
      console.log('\n✅ Service requests found!');
      console.log('Number of requests:', data.serviceRequests.length);
      
      data.serviceRequests.forEach((request, index) => {
        console.log(`\nRequest ${index + 1}:`);
        console.log('- ID:', request.id);
        console.log('- Type:', request.type);
        console.log('- Message:', request.message);
        console.log('- Should show actions:', request.type === 'service_order_created');
      });
    } else {
      console.log('\n❌ No service requests found or API error');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuth();
