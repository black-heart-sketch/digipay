"""
DigiPay API Client
"""

import requests
from typing import Dict, Any, Optional
from .exceptions import DigiPayError, AuthenticationError, APIError


class DigiPay:
    """
    DigiPay API Client
    
    Args:
        api_key (str): Your DigiPay API key
        environment (str): 'production' or 'sandbox' (default: 'production')
        base_url (str): Custom base URL (optional)
    
    Example:
        >>> client = DigiPay(api_key='your_api_key')
        >>> payment = client.payments.create(
        ...     amount=5000,
        ...     currency='XAF',
        ...     customer={'phone': '237699000000'}
        ... )
    """
    
    def __init__(
        self,
        api_key: str,
        environment: str = 'production',
        base_url: Optional[str] = None
    ):
        if not api_key:
            raise AuthenticationError("API key is required")
        
        self.api_key = api_key
        
        # Determine base URL
        if base_url:
            self.base_url = base_url
        elif environment == 'sandbox':
            self.base_url = 'https://sandbox.digitalcertify.tech/v1/api'
        else:
            self.base_url = 'https://digitalcertify.tech/v1/api'
        
        # Initialize payments namespace
        self.payments = PaymentsAPI(self)
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make HTTP request to DigiPay API
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            data: Request payload (optional)
        
        Returns:
            API response as dictionary
        
        Raises:
            APIError: If API returns an error
        """
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                timeout=30
            )
            
            # Check for errors
            if response.status_code >= 400:
                error_message = response.json().get('message', 'Unknown error')
                raise APIError(
                    error_message,
                    status_code=response.status_code,
                    response=response.json()
                )
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise DigiPayError(f"Request failed: {str(e)}")


class PaymentsAPI:
    """Payments API namespace"""
    
    def __init__(self, client: DigiPay):
        self._client = client
    
    def create(
        self,
        amount: int,
        customer: Dict[str, str],
        currency: str = 'XAF',
        metadata: Optional[Dict[str, Any]] = None,
        webhook_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new payment
        
        Args:
            amount: Amount in minor units (e.g., 5000 = 50.00 XAF)
            customer: Customer info with 'phone' and optional 'email'
            currency: Currency code (default: 'XAF')
            metadata: Custom metadata (optional)
            webhook_url: Webhook URL for payment updates (optional)
        
        Returns:
            Payment response with transactionId and status
        
        Example:
            >>> payment = client.payments.create(
            ...     amount=5000,
            ...     customer={'phone': '237699000000', 'email': 'test@example.com'},
            ...     metadata={'order_id': 'ORDER_123'}
            ... )
        """
        payload = {
            'amount': amount,
            'currency': currency,
            'customerPhone': customer.get('phone'),
            'customerEmail': customer.get('email'),
            'metadata': metadata,
            'webhookUrl': webhook_url,
        }
        
        return self._client._request('POST', '/payments/initiate', payload)
    
    def verify(self, transaction_id: str) -> Dict[str, Any]:
        """
        Verify payment status
        
        Args:
            transaction_id: Transaction ID to verify
        
        Returns:
            Payment status information
        
        Example:
            >>> status = client.payments.verify('TXN_123456')
            >>> print(status['status'])  # 'pending', 'success', or 'failed'
        """
        return self._client._request('GET', f'/payments/verify/{transaction_id}')
    
    def get(self, transaction_id: str) -> Dict[str, Any]:
        """
        Get full payment details
        
        Args:
            transaction_id: Transaction ID
        
        Returns:
            Complete payment information
        
        Example:
            >>> payment = client.payments.get('TXN_123456')
        """
        return self._client._request('GET', f'/payments/{transaction_id}')
