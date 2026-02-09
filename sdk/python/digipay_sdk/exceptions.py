"""
Custom exceptions for DigiPay SDK
"""


class DigiPayError(Exception):
    """Base exception for all DigiPay errors"""
    pass


class AuthenticationError(DigiPayError):
    """Raised when API key is invalid or missing"""
    pass


class APIError(DigiPayError):
    """Raised when API returns an error response"""
    
    def __init__(self, message, status_code=None, response=None):
        super().__init__(message)
        self.status_code = status_code
        self.response = response
