// Test Contest API
// Run this in browser console or Node.js to test the contest API

async function testContestAPI() {
  try {
    console.log('Testing /api/contest/status...');
    
    const response = await fetch('/api/contest/status');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Contest API Success:');
      console.log('Contest data:', data);
      
      // Check required fields
      const requiredFields = ['id', 'name', 'status', 'start_at', 'end_at', 'freeze_public_display'];
      const missingFields = requiredFields.filter(field => !(field in data));
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present');
      } else {
        console.log('❌ Missing fields:', missingFields);
      }
      
      // Check dates
      if (data.start_at && data.end_at) {
        const start = new Date(data.start_at);
        const end = new Date(data.end_at);
        const now = new Date();
        
        console.log('📅 Date Analysis:');
        console.log('- Start:', start.toISOString());
        console.log('- End:', end.toISOString());
        console.log('- Now:', now.toISOString());
        console.log('- Has started:', now >= start);
        console.log('- Has ended:', now >= end);
        console.log('- Time remaining:', Math.max(0, end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24), 'days');
      }
      
    } else {
      const errorData = await response.text();
      console.log('❌ Contest API Error:');
      console.log('Status:', response.status, response.statusText);
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error);
  }
}

// Run the test
testContestAPI();

