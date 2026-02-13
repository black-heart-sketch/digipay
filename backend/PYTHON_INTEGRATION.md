# DigiPay Python Integration Guide

This guide shows how to integrate with the DigiPay API using Python.

## Installation

```bash
pip install requests python-dotenv
```

## DigiPay Python Client

Create a reusable client class to interact with the DigiPay API:

```python
# digipay_client.py
import requests
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class DigiPayClient:
    """DigiPay API Client for Python applications"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        Initialize DigiPay client
        
        Args:
            api_key: Your DigiPay API key (or set DIGIPAY_API_KEY env var)
            base_url: API base URL (or set DIGIPAY_API_URL env var)
        """
        self.api_key = api_key or os.getenv('DIGIPAY_API_KEY')
        self.base_url = (base_url or os.getenv('DIGIPAY_API_URL', 'http://localhost:5001')).rstrip('/')
        self.session = requests.Session()
        
        if self.api_key:
            self.session.headers.update({
                'x-api-key': self.api_key,
                'Content-Type': 'application/json'
            })
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make HTTP request to DigiPay API"""
        url = f"{self.base_url}/v1/api{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            raise
    
    # Payment Methods
    
    def initiate_payment(self, amount: float, customer_phone: str, 
                        description: str = "", metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Initiate a payment (Pay-In)
        
        Args:
            amount: Payment amount (XAF)
            customer_phone: Customer phone number (237XXXXXXXXX)
            description: Payment description
            metadata: Additional metadata
        
        Returns:
            Payment response with transaction details
        """
        payload = {
            "amount": amount,
            "customerPhone": customer_phone,
            "description": description,
            "metadata": metadata or {}
        }
        return self._make_request('POST', '/payments/initiate', json=payload)
    
    def get_transactions(self, status: Optional[str] = None, 
                         page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """
        Get list of transactions
        
        Args:
            status: Filter by status (SUCCESS, PENDING, FAILED)
            page: Page number
            limit: Items per page
        
        Returns:
            Transactions list with pagination
        """
        params = {'page': page, 'limit': limit}
        if status:
            params['status'] = status
        
        return self._make_request('GET', '/payments/transactions', params=params)
    
    def get_transaction(self, transaction_id: str) -> Dict[str, Any]:
        """
        Get transaction details
        
        Args:
            transaction_id: Transaction ID
        
        Returns:
            Transaction details
        """
        return self._make_request('GET', f'/payments/transactions/{transaction_id}')
    
    # Settlement Methods
    
    def get_balance(self) -> Dict[str, Any]:
        """
        Get merchant balance
        
        Returns:
            Balance information
        """
        return self._make_request('GET', '/settlements/balance')
    
    def request_settlement(self, amount: float, recipient_phone: Optional[str] = None) -> Dict[str, Any]:
        """
        Request a payout/settlement (requires JWT authentication)
        
        Args:
            amount: Payout amount (XAF)
            recipient_phone: Optional recipient phone number
        
        Returns:
            Settlement request response
        """
        payload = {"amount": amount}
        if recipient_phone:
            payload["recipientPhone"] = recipient_phone
        
        return self._make_request('POST', '/settlements/request', json=payload)
    
    def get_settlements(self, status: Optional[str] = None, 
                       page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """
        Get list of settlements
        
        Args:
            status: Filter by status
            page: Page number
            limit: Items per page
        
        Returns:
            Settlements list
        """
        params = {'page': page, 'limit': limit}
        if status:
            params['status'] = status
        
        return self._make_request('GET', '/settlements', params=params)


# JWT-based client for merchant dashboard operations
class DigiPayDashboardClient(DigiPayClient):
    """DigiPay Dashboard Client with JWT authentication"""
    
    def __init__(self, email: Optional[str] = None, password: Optional[str] = None, 
                 jwt_token: Optional[str] = None, base_url: Optional[str] = None):
        """
        Initialize Dashboard client with JWT authentication
        
        Args:
            email: Merchant email
            password: Merchant password
            jwt_token: Existing JWT token (optional)
            base_url: API base URL
        """
        super().__init__(api_key=None, base_url=base_url)
        self.jwt_token = jwt_token
        
        # Remove API key header, use JWT instead
        if 'x-api-key' in self.session.headers:
            del self.session.headers['x-api-key']
        
        # Auto-login if credentials provided
        if email and password and not jwt_token:
            self.login(email, password)
        elif jwt_token:
            self._set_jwt_token(jwt_token)
    
    def _set_jwt_token(self, token: str):
        """Set JWT token in session headers"""
        self.jwt_token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Login to get JWT token
        
        Args:
            email: Merchant email
            password: Merchant password
        
        Returns:
            Login response with token
        """
        response = self._make_request('POST', '/auth/login', 
                                     json={'email': email, 'password': password})
        
        if response.get('success') and response.get('data', {}).get('token'):
            self._set_jwt_token(response['data']['token'])
        
        return response
    
    def register(self, email: str, password: str, business_name: str) -> Dict[str, Any]:
        """
        Register new merchant account
        
        Args:
            email: Merchant email
            password: Password
            business_name: Business name
        
        Returns:
            Registration response
        """
        return self._make_request('POST', '/auth/register', 
                                 json={
                                     'email': email,
                                     'password': password,
                                     'businessName': business_name
                                 })
    
    # API Key Management
    
    def generate_api_key(self, name: str, environment: str = 'production') -> Dict[str, Any]:
        """
        Generate new API key
        
        Args:
            name: Key name/description
            environment: 'production' or 'sandbox'
        
        Returns:
            API key details
        """
        return self._make_request('POST', '/keys/generate', 
                                 json={'name': name, 'environment': environment})
    
    def get_api_keys(self) -> Dict[str, Any]:
        """Get list of API keys"""
        return self._make_request('GET', '/keys')
    
    def revoke_api_key(self, key_id: str) -> Dict[str, Any]:
        """Revoke an API key"""
        return self._make_request('DELETE', f'/keys/{key_id}')
```

## Environment Setup

Create a `.env` file in your Python project:

```env
DIGIPAY_API_KEY=your_api_key_here
DIGIPAY_API_URL=http://localhost:5001
```

## Usage Examples

### Example 1: Basic Payment Integration (API Key)

```python
# example_payment.py
from digipay_client import DigiPayClient

# Initialize client
client = DigiPayClient()

# Check balance
balance = client.get_balance()
print(f"Current Balance: {balance['data']['balance']} XAF")

# Initiate payment
payment = client.initiate_payment(
    amount=5000,
    customer_phone="237670000000",
    description="Product purchase",
    metadata={"order_id": "12345", "product": "Premium Plan"}
)

print(f"Payment initiated: {payment['data']['transactionId']}")
print(f"Status: {payment['data']['status']}")

# Get transaction details
transaction = client.get_transaction(payment['data']['transactionId'])
print(f"Transaction: {transaction}")

# List all transactions
transactions = client.get_transactions(status='SUCCESS', page=1, limit=10)
print(f"Total successful transactions: {transactions['data']['total']}")
```

### Example 2: Dashboard Operations (JWT)

```python
# example_dashboard.py
from digipay_client import DigiPayDashboardClient

# Login and manage account
dashboard = DigiPayDashboardClient(
    email="merchant@example.com",
    password="your_password"
)

# Generate API key
api_key = dashboard.generate_api_key(
    name="Production Key",
    environment="production"
)
print(f"New API Key: {api_key['data']['key']}")

# List API keys
keys = dashboard.get_api_keys()
print(f"Total API keys: {len(keys['data'])}")

# Request settlement
settlement = dashboard.request_settlement(
    amount=50000,
    recipient_phone="237670000000"
)
print(f"Settlement requested: {settlement}")
```

### Example 3: E-commerce Integration

```python
# ecommerce_integration.py
from digipay_client import DigiPayClient
from flask import Flask, request, jsonify

app = Flask(__name__)
client = DigiPayClient()

@app.route('/checkout', methods=['POST'])
def checkout():
    """Process checkout payment"""
    data = request.json
    
    try:
        # Initiate payment
        payment = client.initiate_payment(
            amount=data['amount'],
            customer_phone=data['phone'],
            description=f"Order #{data['order_id']}",
            metadata={
                'order_id': data['order_id'],
                'customer_email': data.get('email'),
                'items': data.get('items', [])
            }
        )
        
        return jsonify({
            'success': True,
            'transaction_id': payment['data']['transactionId'],
            'status': payment['data']['status']
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/payment/status/<transaction_id>', methods=['GET'])
def payment_status(transaction_id):
    """Check payment status"""
    try:
        transaction = client.get_transaction(transaction_id)
        return jsonify({
            'success': True,
            'status': transaction['data']['status'],
            'amount': transaction['data']['amount']
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

if __name__ == '__main__':
    app.run(port=3000)
```

### Example 4: Webhook Handler

```python
# webhook_handler.py
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)

@app.route('/webhooks/digipay', methods=['POST'])
def handle_webhook():
    """Handle DigiPay payment notifications"""
    data = request.json
    
    # Verify webhook signature (if implemented)
    # signature = request.headers.get('X-DigiPay-Signature')
    # ... verify signature ...
    
    # Process the webhook
    event_type = data.get('type')
    transaction = data.get('transaction', {})
    
    if event_type == 'payment.success':
        # Update your database
        print(f"Payment successful: {transaction.get('transactionId')}")
        # update_order_status(transaction['metadata']['order_id'], 'paid')
    
    elif event_type == 'payment.failed':
        print(f"Payment failed: {transaction.get('transactionId')}")
        # handle_failed_payment(transaction)
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(port=4000)
```

## Error Handling

```python
from digipay_client import DigiPayClient
import requests

client = DigiPayClient()

try:
    payment = client.initiate_payment(
        amount=5000,
        customer_phone="237670000000"
    )
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e}")
    # Handle specific error codes
    if e.response.status_code == 401:
        print("Invalid API key")
    elif e.response.status_code == 400:
        print("Bad request:", e.response.json())
except requests.exceptions.ConnectionError:
    print("Connection error - check if API is running")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Testing

```python
# test_digipay.py
import unittest
from digipay_client import DigiPayClient

class TestDigiPayClient(unittest.TestCase):
    
    def setUp(self):
        self.client = DigiPayClient(
            api_key='test_key',
            base_url='http://localhost:5001'
        )
    
    def test_get_balance(self):
        balance = self.client.get_balance()
        self.assertTrue(balance['success'])
        self.assertIn('balance', balance['data'])
    
    def test_initiate_payment(self):
        payment = self.client.initiate_payment(
            amount=1000,
            customer_phone="237670000000"
        )
        self.assertTrue(payment['success'])
        self.assertIn('transactionId', payment['data'])

if __name__ == '__main__':
    unittest.main()
```

## Next Steps

1. **Get API Credentials**: Login to DigiPay dashboard and generate an API key
2. **Set Environment Variables**: Add your API key to `.env` file
3. **Test Integration**: Start with balance check and test payments
4. **Implement Webhooks**: Handle payment notifications for real-time updates
5. **Go Live**: Switch from test mode to production

## Support

- API Documentation: See [backend README](./README.md)
- Base URL: `http://localhost:5001/v1/api` (development)
- Test Mode: Set `PAYMENT_TEST_MODE=true` in backend `.env` for testing

## Common API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/payments/initiate` | POST | API Key | Initiate payment |
| `/payments/transactions` | GET | API Key | List transactions |
| `/payments/transactions/:id` | GET | API Key | Get transaction |
| `/settlements/balance` | GET | API Key | Get balance |
| `/settlements/request` | POST | JWT | Request payout |
| `/auth/login` | POST | None | Login |
| `/keys/generate` | POST | JWT | Generate API key |
