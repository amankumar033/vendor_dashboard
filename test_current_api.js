const BASE_URL = 'http://localhost:3005/api';

async function testCurrentAPI() {
  console.log('Testing current API state...\n');
  
  // Test fetching categories with counts
  console.log('1. Fetching categories with service counts...');
  try {
    const countsResponse = await fetch(`${BASE_URL}/service-categories/with-counts?vendor_id=VND1`);
    const countsData = await countsResponse.json();
    
    if (countsData.success) {
      console.log('✅ Categories with counts fetched successfully!');
      console.log('Total categories:', countsData.categories.length);
      
      // Show each category with its service count
      countsData.categories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.service_category_id}): ${cat.service_count} services`);
      });
      
      // Show total services across all categories
      const totalServices = countsData.categories.reduce((total, cat) => total + cat.service_count, 0);
      console.log(`\nTotal services across all categories: ${totalServices}`);
      
    } else {
      console.log('❌ Error fetching categories with counts:', countsData.error);
      if (countsData.details) {
        console.log('Error details:', countsData.details);
      }
    }
  } catch (error) {
    console.log('❌ Error fetching categories with counts:', error.message);
  }

  // Test fetching services directly
  console.log('\n2. Fetching services directly...');
  try {
    const servicesResponse = await fetch(`${BASE_URL}/services?vendor_id=VND1`);
    const servicesData = await servicesResponse.json();
    
    if (servicesData.success) {
      console.log('✅ Services fetched successfully!');
      console.log('Total services:', servicesData.services.length);
      
      // Count services by category
      const servicesByCategory = {};
      servicesData.services.forEach(service => {
        const categoryId = service.service_category_id || 'No Category';
        servicesByCategory[categoryId] = (servicesByCategory[categoryId] || 0) + 1;
      });
      
      console.log('\nServices by category:');
      Object.entries(servicesByCategory).forEach(([categoryId, count]) => {
        console.log(`  - ${categoryId}: ${count} services`);
      });
      
    } else {
      console.log('❌ Error fetching services:', servicesData.error);
    }
  } catch (error) {
    console.log('❌ Error fetching services:', error.message);
  }

  // Test fetching categories without counts
  console.log('\n3. Fetching categories without counts...');
  try {
    const categoriesResponse = await fetch(`${BASE_URL}/service-categories?vendor_id=VND1`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      console.log('✅ Categories fetched successfully!');
      console.log('Total categories:', categoriesData.categories.length);
      
      categoriesData.categories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.service_category_id})`);
      });
      
    } else {
      console.log('❌ Error fetching categories:', categoriesData.error);
    }
  } catch (error) {
    console.log('❌ Error fetching categories:', error.message);
  }
}

testCurrentAPI(); 