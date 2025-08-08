const BASE_URL = 'http://localhost:3005/api';

async function testCategoriesFiltering() {
  console.log('Testing service categories filtering functionality...\n');
  
  // Test fetching all categories
  console.log('1. Fetching all categories...');
  try {
    const allCategoriesResponse = await fetch(`${BASE_URL}/service-categories/with-counts?vendor_id=VND1`);
    const allCategoriesData = await allCategoriesResponse.json();
    
    if (allCategoriesData.success) {
      console.log('✅ All categories fetched successfully!');
      console.log(`Total categories: ${allCategoriesData.categories.length}`);
      
      // Show categories with services
      const categoriesWithServices = allCategoriesData.categories.filter(cat => cat.service_count > 0);
      console.log(`Categories with services: ${categoriesWithServices.length}`);
      
      // Show categories without services
      const categoriesWithoutServices = allCategoriesData.categories.filter(cat => cat.service_count === 0);
      console.log(`Categories without services: ${categoriesWithoutServices.length}`);
      
      console.log('\nCategories with services:');
      categoriesWithServices.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.service_count} services)`);
      });
      
      console.log('\nCategories without services:');
      categoriesWithoutServices.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.service_count} services)`);
      });
    } else {
      console.log('❌ Error fetching all categories:', allCategoriesData.error);
    }
  } catch (error) {
    console.log('❌ Error fetching all categories:', error.message);
  }

  // Test creating a category with no services initially
  console.log('\n2. Creating a new category with no services...');
  try {
    const categoryData = {
      name: 'Empty Category Test',
      vendor_id: 'VND1',
      description: 'This category has no services initially'
    };

    const response = await fetch(`${BASE_URL}/service-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Empty category created successfully with ID:', result.category_id);
    } else {
      console.log('❌ Empty category creation failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error creating empty category:', error.message);
  }

  // Wait a moment
  console.log('\n3. Waiting 1 second...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test fetching categories again to see the new empty category
  console.log('\n4. Fetching categories again to verify filtering...');
  try {
    const updatedCategoriesResponse = await fetch(`${BASE_URL}/service-categories/with-counts?vendor_id=VND1`);
    const updatedCategoriesData = await updatedCategoriesResponse.json();
    
    if (updatedCategoriesData.success) {
      console.log('✅ Updated categories fetched successfully!');
      console.log(`Total categories: ${updatedCategoriesData.categories.length}`);
      
      // Simulate "All Categories" filter
      const allCategories = updatedCategoriesData.categories;
      console.log(`\n"All Categories" filter would show: ${allCategories.length} categories`);
      
      // Simulate "My Service Categories" filter (categories with services)
      const myServiceCategories = updatedCategoriesData.categories.filter(cat => cat.service_count > 0);
      console.log(`"My Service Categories" filter would show: ${myServiceCategories.length} categories`);
      
      console.log('\n"All Categories" would include:');
      allCategories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.service_count} services)`);
      });
      
      console.log('\n"My Service Categories" would include:');
      myServiceCategories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.service_count} services)`);
      });
      
      // Test search functionality simulation
      console.log('\n5. Testing search functionality simulation...');
      const searchTerm = 'Premium';
      const searchResults = allCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`Search for "${searchTerm}" would return: ${searchResults.length} categories`);
      searchResults.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.service_count} services)`);
      });
      
      const searchTerm2 = 'Empty';
      const searchResults2 = allCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm2.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm2.toLowerCase())
      );
      console.log(`\nSearch for "${searchTerm2}" would return: ${searchResults2.length} categories`);
      searchResults2.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.service_count} services)`);
      });
      
    } else {
      console.log('❌ Error fetching updated categories:', updatedCategoriesData.error);
    }
  } catch (error) {
    console.log('❌ Error fetching updated categories:', error.message);
  }
}

testCategoriesFiltering(); 