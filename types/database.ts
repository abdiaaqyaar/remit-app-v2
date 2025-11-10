export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag_emoji?: string;
  enabled: boolean;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  fee_percentage: number;
  created_at: string;
  valid_until: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'bank_account' | 'debit_card' | 'credit_card' | 'mobile_money';
  currency: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  swift_code?: string;
  is_default: boolean;
  created_at: string;
}

export interface Recipient {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  country: string;
  currency: string;
  account_number?: string;
  bank_name?: string;
  swift_code?: string;
  mobile_money_provider?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  recipient_id?: string;
  payment_method_id?: string;
  from_currency: string;
  to_currency: string;
  send_amount: number;
  receive_amount: number;
  exchange_rate: number;
  fee_amount: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  delivery_method?: 'bank_transfer' | 'mobile_money' | 'cash_pickup' | 'wire_transfer';
  estimated_arrival?: string;
  completed_at?: string;
  reference_number: string;
  notes?: string;
  created_at: string;
  recipient?: Recipient;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  kyc_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
