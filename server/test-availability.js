const axios = require('axios');

async function testAvailability() {
  try {
    console.log('🧪 Testing availability endpoint...');
    
    const businessId = 'demo-business-123';
    const serviceId = 'service-1'; // Haircut service
    const today = new Date();
    const date = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log('Testing with:', { businessId, serviceId, date });
    
    const response = await axios.get(`http://localhost:5000/api/availability/staff/${businessId}/${serviceId}/${date}`);
    
    console.log('✅ Response received');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      const { slots, totalAvailable, totalBooked, available } = response.data.data;
      console.log(`\n📊 Summary:`);
      console.log(`- Available: ${available}`);
      console.log(`- Total slots: ${slots?.length || 0}`);
      console.log(`- Available slots: ${totalAvailable || 0}`);
      console.log(`- Booked slots: ${totalBooked || 0}`);
      
      if (slots && slots.length > 0) {
        console.log(`\n🕐 Sample slots:`);
        slots.slice(0, 5).forEach((slot, index) => {
          console.log(`${index + 1}. ${slot.startTime} - ${slot.endTime} (${slot.isAvailable ? 'Available' : 'Booked'}) - ${slot.staffName || 'Any Staff'}`);
        });
      } else {
        console.log('\n❌ No slots found');
      }
    } else {
      console.log('❌ No data in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing availability:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAvailability(); 