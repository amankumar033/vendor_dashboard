async function testEmail() {
  try {
    console.log('🧪 Testing email functionality...');
    
    const response = await fetch('http://localhost:3002/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email from Vendor Dashboard',
        message: 'This is a test email to verify the email functionality is working properly.'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email test successful!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Sent to:', result.to);
    } else {
      console.log('❌ Email test failed!');
      console.log('❌ Error:', result.error);
      console.log('❌ Details:', result.details);
    }
    
  } catch (error) {
    console.error('❌ Error testing email:', error);
  }
}

testEmail();


