// Test file for DigiPay SDK
// This will test against the local backend running on port 5000

const DigiPay = require('../dist/index').default;

// Configuration
const API_KEY = 'test_api_key_12345'; // You'll need a real API key from your backend
const BASE_URL = 'http://localhost:5000/api';

async function testSDK() {
  console.log('🧪 Starting DigiPay SDK Tests...\n');

  // Initialize client
  const client = new DigiPay({
    apiKey: API_KEY,
    baseUrl: BASE_URL,
  });

  console.log('✅ Client initialized successfully');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   API Key: ${API_KEY.substring(0, 10)}...\n`);

  try {
    // Test 1: Create a payment
    console.log('📝 Test 1: Creating a payment...');
    const payment = await client.payments.create({
      amount: 5000,
      currency: 'XAF',
      customer: {
        phone: '237699000000',
        email: 'test@example.com',
      },
      metadata: {
        order_id: 'TEST_ORDER_' + Date.now(),
        test: true,
      },
    });

    console.log('✅ Payment created successfully!');
    console.log(`   Transaction ID: ${payment.transactionId}`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Amount: ${payment.amount} ${payment.currency}\n`);

    // Test 2: Verify the payment
    console.log('🔍 Test 2: Verifying payment status...');
    const status = await client.payments.verify(payment.transactionId);
    
    console.log('✅ Payment verified successfully!');
    console.log(`   Transaction ID: ${status.transactionId}`);
    console.log(`   Status: ${status.status}`);
    console.log(`   Amount: ${status.amount} ${status.currency}\n`);

    // Test 3: Get full payment details
    console.log('📄 Test 3: Getting full payment details...');
    const details = await client.payments.get(payment.transactionId);
    
    console.log('✅ Payment details retrieved successfully!');
    console.log(`   Transaction ID: ${details.transactionId}`);
    console.log(`   Customer Phone: ${details.customer.phone}`);
    console.log(`   Metadata:`, details.metadata);
    console.log('\n');

    console.log('🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
testSDK();
