# DigiPay Python SDK

Official Python SDK for DigiPay - Accept mobile money payments with ease.

## Installation

```bash
pip install digipay-python
```

## Quick Start

```python
from digipay_sdk import DigiPay

# Initialize the client
client = DigiPay(
    api_key='YOUR_API_KEY',
    environment='production'  # or 'sandbox'
)

# Create a payment
payment = client.payments.create(
    amount=5000,  # 50.00 XAF
    currency='XAF',
    customer={
        'phone': '237699000000',
        'email': 'customer@example.com'
    },
    metadata={
        'order_id': 'ORDER_123'
    }
)

print(f"Payment created: {payment['transactionId']}")
print(f"Status: {payment['status']}")

# Verify payment status
status = client.payments.verify(payment['transactionId'])
print(f"Current status: {status['status']}")

# Get full payment details
details = client.payments.get(payment['transactionId'])
print(f"Payment details: {details}")
```

## API Reference

### `DigiPay(api_key, environment='production', base_url=None)`

Create a new DigiPay client instance.

**Parameters:**

- `api_key` (str, required): Your DigiPay API key
- `environment` (str, optional): 'production' or 'sandbox' (default: 'production')
- `base_url` (str, optional): Custom API base URL

### `client.payments.create(**kwargs)`

Initiate a new payment.

**Parameters:**

- `amount` (int, required): Amount in minor units (e.g., 5000 = 50.00 XAF)
- `customer` (dict, required): Customer info with 'phone' and optional 'email'
- `currency` (str, optional): Currency code (default: 'XAF')
- `metadata` (dict, optional): Custom metadata
- `webhook_url` (str, optional): Webhook URL for payment updates

**Returns:** dict with payment information

### `client.payments.verify(transaction_id)`

Verify the status of a payment.

**Parameters:**

- `transaction_id` (str, required): The transaction ID to verify

**Returns:** dict with payment status

### `client.payments.get(transaction_id)`

Get full payment details.

**Parameters:**

- `transaction_id` (str, required): The transaction ID

**Returns:** dict with complete payment information

## Error Handling

The SDK raises custom exceptions for different error scenarios:

```python
from digipay_sdk import DigiPay, DigiPayError, AuthenticationError, APIError

try:
    payment = client.payments.create(
        amount=5000,
        customer={'phone': '237699000000'}
    )
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except APIError as e:
    print(f"API error: {e}")
    print(f"Status code: {e.status_code}")
except DigiPayError as e:
    print(f"General error: {e}")
```

## Environment Variables

You can store your API key in environment variables:

```python
import os
from digipay_sdk import DigiPay

client = DigiPay(
    api_key=os.getenv('DIGIPAY_API_KEY'),
    environment='production'
)
```

## Development

Install development dependencies:

```bash
pip install -e ".[dev]"
```

Run tests:

```bash
pytest
```

## Support

- Documentation: https://docs.digipay.com
- Email: support@digipay.com
- GitHub: https://github.com/digipay/digipay-python

## License

MIT
