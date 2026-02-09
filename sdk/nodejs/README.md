# DigiPay Node.js SDK

Official Node.js SDK for DigiPay - Accept mobile money payments with ease.

## Installation

```bash
npm install digipay-sdk
```

## Quick Start

```javascript
const DigiPay = require("digipay-sdk");

// Initialize the client
const client = new DigiPay({
  apiKey: "YOUR_API_KEY",
  environment: "production", // or 'sandbox'
});

// Create a payment
async function createPayment() {
  try {
    const payment = await client.payments.create({
      amount: 5000,
      currency: "XAF",
      customer: {
        phone: "237699000000",
        email: "customer@example.com",
      },
      metadata: {
        order_id: "ORDER_123",
      },
    });

    console.log("Payment created:", payment.transactionId);
  } catch (error) {
    console.error("Payment failed:", error.message);
  }
}

// Verify a payment
async function verifyPayment(transactionId) {
  try {
    const status = await client.payments.verify(transactionId);
    console.log("Payment status:", status.status);
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}
```

## API Reference

### `new DigiPay(config)`

Create a new DigiPay client instance.

**Parameters:**

- `config.apiKey` (string, required): Your DigiPay API key
- `config.environment` (string, optional): 'production' or 'sandbox' (default: 'production')
- `config.baseUrl` (string, optional): Custom API base URL

### `client.payments.create(request)`

Initiate a new payment.

**Parameters:**

- `request.amount` (number, required): Amount in minor units (e.g., 5000 = 50.00 XAF)
- `request.currency` (string, optional): Currency code (default: 'XAF')
- `request.customer.phone` (string, required): Customer phone number
- `request.customer.email` (string, optional): Customer email
- `request.metadata` (object, optional): Custom metadata
- `request.webhookUrl` (string, optional): Webhook URL for payment updates

**Returns:** Promise<PaymentResponse>

### `client.payments.verify(transactionId)`

Verify the status of a payment.

**Parameters:**

- `transactionId` (string, required): The transaction ID to verify

**Returns:** Promise<TransactionStatus>

### `client.payments.get(transactionId)`

Get full payment details.

**Parameters:**

- `transactionId` (string, required): The transaction ID

**Returns:** Promise<PaymentResponse>

### `client.settlements.getBalance()`

Get your current merchant account balance.

**Returns:** Promise<BalanceResponse>

**Example:**

```javascript
async function checkBalance() {
  try {
    const balance = await client.settlements.getBalance();
    console.log("Available balance:", balance.balance);
    console.log("Total revenue:", balance.totalRevenue);
  } catch (error) {
    console.error("Failed to fetch balance:", error.message);
  }
}
```

## TypeScript Support

This SDK is written in TypeScript and includes type definitions.

```typescript
import DigiPay, { PaymentRequest, PaymentResponse } from "digipay-sdk";

const client = new DigiPay({
  apiKey: process.env.DIGIPAY_API_KEY!,
  environment: "production",
});
```

## Error Handling

All methods throw errors that should be caught:

```javascript
try {
  const payment = await client.payments.create({ ... });
} catch (error) {
  console.error('Error:', error.message);
}
```

## Support

- Documentation: https://docs.digipay.com
- Email: support@digipay.com
- GitHub: https://github.com/digipay/digipay-node

## License

MIT
