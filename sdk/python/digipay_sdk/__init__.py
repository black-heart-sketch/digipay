"""
DigiPay Python SDK
Official Python SDK for DigiPay - Accept mobile money payments with ease
"""

__version__ = "1.0.0"
__author__ = "DigiPay"

from .client import DigiPay
from .exceptions import DigiPayError, AuthenticationError, APIError

__all__ = [
    "DigiPay",
    "DigiPayError",
    "AuthenticationError",
    "APIError",
]
