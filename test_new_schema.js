const BASE_URL = 'http://localhost:3005/api';

async function testNewSchema() {
  console.log('Testing new schema with service_category_id...\n');
  
  // Test creating a new service category
  console.log('1. Creating a new service category...');
  try {
    const categoryData = {
      name: 'Test Category New Schema',
      vendor_id: 'VND1',
      description: 'Testing the new schema structure'
    };

    const response = await fetch(`${BASE_URL}/service-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData)
    });

    const result = await response.json();
    console.log('Category creation response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Service category created successfully with ID:', result.service_category_id);
      
      // Test creating a service with the new category
      console.log('\n2. Creating a service with the new category...');
      try {
        const serviceData = {
          vendor_id: 'VND1',
          name: 'Test Service New Schema',
          description: 'Testing service creation with new schema',
          service_category_id: result.service_category_id,
          type: 'Test Type',
          base_price: 99.99,
          duration_minutes: 120,
          is_available: 1,
          service_pincodes: '201301,201302'
        };

        const serviceResponse = await fetch(`${BASE_URL}/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceData)
        });

        const serviceResult = await serviceResponse.json();
        console.log('Service creation response:', JSON.stringify(serviceResult, null, 2));
        
        if (serviceResult.success) {
          console.log('✅ Service created successfully with ID:', serviceResult.service_id);
        } else {
          console.log('❌ Service creation failed:', serviceResult.error);
        }
      } catch (error) {
        console.log('❌ Error creating service:', error.message);
      }

      // Test fetching categories with counts
      console.log('\n3. Fetching categories with service counts...');
      try {
        const countsResponse = await fetch(`${BASE_URL}/service-categories/with-counts?vendor_id=VND1`);
        const countsData = await countsResponse.json();
        
        if (countsData.success) {
          console.log('✅ Categories with counts fetched successfully!');
          console.log('Categories:', JSON.stringify(countsData.categories, null, 2));
          
          // Find our test category
          const testCategory = countsData.categories.find(cat => cat.service_category_id === result.service_category_id);
          if (testCategory) {
            console.log(`\n✅ Test category found with ${testCategory.service_count} services`);
          } else {
            console.log('\n❌ Test category not found in results');
          }
        } else {
          console.log('❌ Error fetching categories with counts:', countsData.error);
        }
      } catch (error) {
        console.log('❌ Error fetching categories with counts:', error.message);
      }

      // Test fetching services
      console.log('\n4. Fetching services...');
      try {
        const servicesResponse = await fetch(`${BASE_URL}/services?vendor_id=VND1`);
        const servicesData = await servicesResponse.json();
        
        if (servicesData.success) {
          console.log('✅ Services fetched successfully!');
          console.log('Services:', JSON.stringify(servicesData.services, null, 2));
          
          // Find our test service
          const testService = servicesData.services.find(service => service.service_category_id === result.service_category_id);
          if (testService) {
            console.log(`\n✅ Test service found with category ID: ${testService.service_category_id}`);
          } else {
            console.log('\n❌ Test service not found in results');
          }
        } else {
          console.log('❌ Error fetching services:', servicesData.error);
        }
      } catch (error) {
        console.log('❌ Error fetching services:', error.message);
      }

    } else {
      console.log('❌ Service category creation failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error creating service category:', error.message);
  }
}

testNewSchema(); 