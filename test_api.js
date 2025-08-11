import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing service requests API...');
    
    const response = await fetch('http://localhost:3005/api/service-requests?vendor_id=VND1');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI(); 