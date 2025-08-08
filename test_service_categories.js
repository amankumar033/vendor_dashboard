const BASE_URL = 'http://localhost:3005/api';

async function testServiceCategories() {
  console.log('Testing service categories functionality...\n');
  
  // Test creating a new service category
  console.log('1. Creating a new service category...');
  try {
    const categoryData = {
      name: 'Premium Car Services',
      vendor_id: 'VND1',
      description: 'High-end car maintenance and detailing services'
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
      console.log('✅ Service category created successfully with ID:', result.category_id);
    } else {
      console.log('❌ Service category creation failed:', result.error);
      return;
    }
  } catch (error) {
    console.log('❌ Error creating service category:', error.message);
    return;
  }

  // Wait a moment
  console.log('\n2. Waiting 1 second...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test fetching all categories
  console.log('\n3. Fetching all service categories...');
  try {
    const categoriesResponse = await fetch(`${BASE_URL}/service-categories?vendor_id=VND1`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      console.log('✅ Categories fetched successfully!');
      console.log('Categories:', JSON.stringify(categoriesData.categories, null, 2));
    } else {
      console.log('❌ Error fetching categories:', categoriesData.error);
    }
  } catch (error) {
    console.log('❌ Error fetching categories:', error.message);
  }

  // Test fetching categories with service counts
  console.log('\n4. Fetching categories with service counts...');
  try {
    const countsResponse = await fetch(`${BASE_URL}/service-categories/with-counts?vendor_id=VND1`);
    const countsData = await countsResponse.json();
    
    if (countsData.success) {
      console.log('✅ Categories with counts fetched successfully!');
      console.log('Categories with counts:', JSON.stringify(countsData.categories, null, 2));
    } else {
      console.log('❌ Error fetching categories with counts:', countsData.error);
    }
  } catch (error) {
    console.log('❌ Error fetching categories with counts:', error.message);
  }

  // Test creating a service with the new category
  console.log('\n5. Creating a service with the new category...');
  try {
    const serviceData = {
      vendor_id: 'VND1',
      name: 'Premium Car Detailing',
      description: 'Complete interior and exterior detailing with premium products',
      category: 'Premium Car Services',
      type: 'Detailing Service',
      base_price: 199.99,
      duration_minutes: 180,
      is_available: 1,
      service_pincodes: '201301,201302,201303'
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

  // Test fetching categories with updated counts
  console.log('\n6. Fetching categories with updated service counts...');
  try {
    const updatedCountsResponse = await fetch(`${BASE_URL}/service-categories/with-counts?vendor_id=VND1`);
    const updatedCountsData = await updatedCountsResponse.json();
    
    if (updatedCountsData.success) {
      console.log('✅ Updated categories with counts fetched successfully!');
      console.log('Updated categories with counts:', JSON.stringify(updatedCountsData.categories, null, 2));
    } else {
      console.log('❌ Error fetching updated categories with counts:', updatedCountsData.error);
    }
  } catch (error) {
    console.log('❌ Error fetching updated categories with counts:', error.message);
  }
}

testServiceCategories(); 