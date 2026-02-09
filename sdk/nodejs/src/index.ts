import axios, { AxiosInstance } from 'axios';

export interface DigiPayConfig {
  apiKey: string;
  environment?: 'production' | 'sandbox';
  baseUrl?: string;
}

export interface PaymentRequest {
  amount: number;
  currency?: string;
  customer: {
    phone: string;
    email?: string;
  };
  metadata?: Record<string, any>;
  webhookUrl?: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  currency: string;
  customer: {
    phone: string;
    email?: string;
  };
  freemopayReference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TransactionStatus {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  currency: string;
  freemopayReference?: string;
  completedAt?: string;
}

export interface BalanceResponse {
  balance: number;
  totalRevenue: number;
  totalCommissionPaid: number;
}

export class DigiPay {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  public payments: {
    create: (request: PaymentRequest) => Promise<PaymentResponse>;
    verify: (transactionId: string) => Promise<TransactionStatus>;
    get: (transactionId: string) => Promise<PaymentResponse>;
  };
  public settlements: {
    getBalance: () => Promise<BalanceResponse>;
  };

  constructor(config: DigiPayConfig) {
    this.apiKey = config.apiKey;
    
    // Determine base URL
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else if (config.environment === 'sandbox') {
      this.baseUrl = 'https://sandbox.digitalcertify.net/v1/api';
    } else {
      this.baseUrl = 'https://digitalcertify.net/v1/api';
    }

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Initialize payments methods
    this.payments = {
      create: this.createPayment.bind(this),
      verify: this.verifyPayment.bind(this),
      get: this.getPayment.bind(this),
    };

    // Initialize settlements methods
    this.settlements = {
      getBalance: this.getBalance.bind(this),
    };
  }

  /**
   * Initiate a new payment
   */
  private async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.client.post('/payments/initiate', {
        amount: request.amount,
        currency: request.currency || 'XAF',
        customerPhone: request.customer.phone,
        customerEmail: request.customer.email,
        metadata: request.metadata,
        webhookUrl: request.webhookUrl,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create payment'
      );
    }
  }

  /**
   * Verify a payment status
   */
  private async verifyPayment(transactionId: string): Promise<TransactionStatus> {
    try {
      const response = await this.client.get(`/payments/verify/${transactionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to verify payment'
      );
    }
  }

  /**
   * Get payment by transaction ID
   */
  private async getPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      const response = await this.client.get(`/payments/${transactionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get payment'
      );
    }
  }

  /**
   * Get merchant account balance
   */
  private async getBalance(): Promise<BalanceResponse> {
    try {
      const response = await this.client.get('/settlements/balance');
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get balance'
      );
    }
  }
}

export default DigiPay;
