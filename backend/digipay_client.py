"""
DigiPay API Client for Python
A reusable client for integrating with the DigiPay payment platform.

Usage:
    # API Key authentication (for payment operations)
    from digipay_client import DigiPayClient
    
    client = DigiPayClient(api_key='your_api_key')
    balance = client.get_balance()
    
    # JWT authentication (for dashboard operations)
    from digipay_client import DigiPayDashboardClient
    
    dashboard = DigiPayDashboardClient(email='user@example.com', password='password')
    api_key = dashboard.generate_api_key('Production Key')
"""

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
            Balance information (balance, totalRevenue, totalCommissionPaid)
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
            Settlements list with pagination
        """
        params = {'page': page, 'limit': limit}
        if status:
            params['status'] = status
        
        return self._make_request('GET', '/settlements', params=params)


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
            Login response with token and user data
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
            Registration response with token
        """
        return self._make_request('POST', '/auth/register', 
                                 json={
                                     'email': email,
                                     'password': password,
                                     'businessName': business_name
                                 })
    
    def get_profile(self) -> Dict[str, Any]:
        """Get current user profile"""
        return self._make_request('GET', '/auth/profile')
    
    # API Key Management
    
    def generate_api_key(self, name: str, environment: str = 'production') -> Dict[str, Any]:
        """
        Generate new API key
        
        Args:
            name: Key name/description
            environment: 'production' or 'sandbox'
        
        Returns:
            API key details (includes the actual key - store it securely!)
        """
        return self._make_request('POST', '/keys/generate', 
                                 json={'name': name, 'environment': environment})
    
    def get_api_keys(self) -> Dict[str, Any]:
        """Get list of all API keys"""
        return self._make_request('GET', '/keys')
    
    def revoke_api_key(self, key_id: str) -> Dict[str, Any]:
        """
        Revoke an API key
        
        Args:
            key_id: ID of the key to revoke
        """
        return self._make_request('DELETE', f'/keys/{key_id}')


if __name__ == '__main__':
    # Example usage
    print("DigiPay Python Client")
    print("=" * 50)
    
    # Test with environment variables
    client = DigiPayClient()
    
    try:
        # Get balance
        balance = client.get_balance()
        print(f"✓ Balance: {balance['data']['balance']} XAF")
        
        # Get transactions
        transactions = client.get_transactions(limit=5)
        print(f"✓ Transactions: {transactions['data']['total']} total")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        print("\nMake sure to set DIGIPAY_API_KEY in your .env file or pass it to DigiPayClient()")
