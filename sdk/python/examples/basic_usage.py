"""
Example usage of DigiPay Python SDK
"""

from digipay_sdk import DigiPay
import os


def main():
    # Initialize the client
    client = DigiPay(
        api_key=os.getenv('DIGIPAY_API_KEY', 'your_api_key_here'),
        environment='production'  # or 'sandbox'
    )

    try:
        # Create a payment
        print("Creating payment...")
        payment = client.payments.create(
            amount=5000,  # 50.00 XAF
            currency='XAF',
            customer={
                'phone': '237699000000',
                'email': 'customer@example.com'
            },
            metadata={
                'order_id': 'ORDER_123',
                'customer_name': 'John Doe'
            }
        )

        print(f"✅ Payment created: {payment['transactionId']}")
        print(f"   Status: {payment['status']}")

        # Verify payment status
        print("\nVerifying payment...")
        status = client.payments.verify(payment['transactionId'])
        print(f"✅ Current status: {status['status']}")

        # Get full payment details
        print("\nGetting payment details...")
        details = client.payments.get(payment['transactionId'])
        print(f"✅ Payment details retrieved")
        print(f"   Amount: {details['amount']} {details['currency']}")
        print(f"   Customer: {details['customer']['phone']}")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == '__main__':
    main()
