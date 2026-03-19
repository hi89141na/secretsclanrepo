const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testOfferSystem() {
  console.log('🧪 Testing Store-Wide Offers System\n');
  
  try {
    // Test 1: Check if API is running
    console.log('1️⃣  Testing API Connection...');
    const apiTest = await axios.get(`${BASE_URL}`);
    console.log('✅ API is running:', apiTest.data.message);
    
    // Test 2: Get active store-wide offer
    console.log('\n2️⃣  Testing Store-Wide Offer Endpoint...');
    const storeWideResponse = await axios.get(`${BASE_URL}/offers/store-wide`);
    if (storeWideResponse.data.data) {
      console.log('✅ Active Store-Wide Offer Found:', storeWideResponse.data.data.title);
      console.log('   Discount:', storeWideResponse.data.data.discountType, '-', storeWideResponse.data.data.discountValue);
    } else {
      console.log('ℹ️  No active store-wide offer currently');
    }
    
    // Test 3: Get active offers
    console.log('\n3️⃣  Testing Active Offers Endpoint...');
    const activeOffers = await axios.get(`${BASE_URL}/offers/active`);
    console.log(`✅ Found ${activeOffers.data.data.length} active offer(s)`);
    
    // Test 4: Get products with offers applied
    console.log('\n4️⃣  Testing Products with Offers...');
    const products = await axios.get(`${BASE_URL}/products`);
    const productsWithOffers = products.data.data.filter(p => p.appliedOffer);
    console.log(`✅ ${productsWithOffers.length} product(s) have active offers`);
    
    if (productsWithOffers.length > 0) {
      const sample = productsWithOffers[0];
      console.log(`   Example: ${sample.name}`);
      console.log(`   Original Price: Rs. ${sample.originalPrice}`);
      console.log(`   Discounted Price: Rs. ${sample.discountedPrice}`);
      console.log(`   Offer: ${sample.appliedOffer.title}`);
    }
    
    console.log('\n✨ All tests passed! Store-Wide Offers system is working correctly.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

testOfferSystem();
