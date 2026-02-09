// Example usage of DigiPay SDK
import DigiPay from 'digipay-sdk';

async function example() {
  // Initialize the client
  const client = new DigiPay({
    apiKey: process.env.DIGIPAY_API_KEY || 'your_api_key_here',
    environment: 'production', // or 'sandbox'
  });

  try {
    // Create a payment
    const payment = await client.payments.create({
      amount: 5000, // 50.00 XAF
      currency: 'XAF',
      customer: {
        phone: '237699000000',
        email: 'customer@example.com',
      },
      metadata: {
        order_id: 'ORDER_123',
        customer_name: 'John Doe',
      },
    });

    console.log('Payment created:', payment.transactionId);
    console.log('Status:', payment.status);

    // Verify payment status
    const status = await client.payments.verify(payment.transactionId);
    console.log('Current status:', status.status);

    // Get full payment details
    const details = await client.payments.get(payment.transactionId);
    console.log('Payment details:', details);

    // Check account balance
    const balance = await client.settlements.getBalance();
    console.log('Current balance:', balance.balance);
    console.log('Total revenue:', balance.totalRevenue);
    console.log('Commission paid:', balance.totalCommissionPaid);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();
