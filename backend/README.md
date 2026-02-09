# DigiPay Backend

Payment API platform with KYC verification built on FreemoPay.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (if running locally):

```bash
mongod
```

4. Run the server:

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new merchant
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (requires JWT)

### Payments (requires API key)

- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/transactions` - List transactions
- `GET /api/payments/transactions/:id` - Get transaction details

### API Keys (requires JWT)

- `POST /api/keys/generate` - Generate API key
- `GET /api/keys` - List API keys
- `DELETE /api/keys/:id` - Revoke API key

### Settlements (requires JWT)

- `POST /api/settlements/request` - Request payout
- `GET /api/settlements` - List settlements
- `GET /api/settlements/balance` - Get balance

### Webhooks

- `POST /api/webhooks/freemopay` - FreemoPay callback

## Environment Variables

See `.env.example` for all required variables.

## Real-Time Updates

DigiPay uses Socket.IO for real-time database change notifications:

- **MongoDB Change Streams**: Watches all collections for insert, update, delete operations
- **Throttling**: Events are throttled to 1 per second per collection to prevent spam
- **Auto-Retry**: Automatic reconnection with exponential backoff
- **Collection Channels**: Each collection has its own channel (e.g., `transactions`, `settlements`)

**Frontend Integration**:

```javascript
import socketService from "./services/socket";

// Connect
socketService.connect();

// Subscribe to collection
socketService.subscribe("transactions");

// Listen for changes
socketService.on("transactions", (change) => {
  console.log("Transaction updated:", change);
});
```

## Test Mode

Set `PAYMENT_TEST_MODE=true` to bypass FreemoPay API for testing.
