// Test script to setup admin users and verify login
// Run this in browser console or use Postman

async function setupAndTestAdmin() {
  try {
    console.log('🚀 Setting up admin users...');
    
    // Step 1: Setup admin users
    const setupResponse = await fetch('/api/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const setupData = await setupResponse.json();
    console.log('Setup Response:', setupData);
    
    if (!setupResponse.ok) {
      throw new Error(`Setup failed: ${setupData.error}`);
    }
    
    console.log('✅ Admin users created successfully!');
    console.log('📋 Credentials:', setupData.credentials);
    
    // Wait a moment for database operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Test login with super admin
    console.log('\n🔐 Testing login...');
    
    const loginResponse = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@converso.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log('👤 Admin Info:', loginData.admin);
      console.log('🎫 Token received:', loginData.tokens.accessToken ? 'Yes' : 'No');
      
      // Store token for testing
      localStorage.setItem('admin', JSON.stringify(loginData.admin));
      localStorage.setItem('admin_token', loginData.tokens.accessToken);
      
      console.log('\n🎉 Admin system is working! You can now:');
      console.log('1. Go to /admin/login');
      console.log('2. Use credentials: admin@converso.com / admin123');
      console.log('3. Access dashboard at /admin/dashboard');
      
    } else {
      console.error('❌ Login failed:', loginData.error);
      
      // Debug information
      console.log('\n🔍 Debug Info:');
      console.log('- Check if admin users were created properly');
      console.log('- Verify password hashing is working');
      console.log('- Check database connection');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
setupAndTestAdmin();