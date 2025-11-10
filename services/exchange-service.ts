import { Currency } from '@/types/database';

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag_emoji: '🇺🇸', enabled: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag_emoji: '🇪🇺', enabled: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag_emoji: '🇬🇧', enabled: true },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag_emoji: '🇰🇪', enabled: true },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag_emoji: '🇳🇬', enabled: true },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag_emoji: '🇬🇭', enabled: true },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag_emoji: '🇿🇦', enabled: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag_emoji: '🇮🇳', enabled: true },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag_emoji: '🇵🇭', enabled: true },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag_emoji: '🇲🇽', enabled: true },
];

const EXCHANGE_RATES: Record<string, Record<string, { rate: number; fee: number }>> = {
  USD: {
    KES: { rate: 129.15, fee: 4.89 },
    NGN: { rate: 1450.5, fee: 5.99 },
    GHS: { rate: 15.75, fee: 4.89 },
    INR: { rate: 83.25, fee: 4.89 },
    PHP: { rate: 56.45, fee: 4.89 },
    EUR: { rate: 0.92, fee: 3.99 },
    GBP: { rate: 0.79, fee: 3.99 },
    ZAR: { rate: 18.65, fee: 4.89 },
    MXN: { rate: 17.05, fee: 4.89 },
  },
  EUR: {
    USD: { rate: 1.09, fee: 3.99 },
    KES: { rate: 140.77, fee: 5.49 },
    GBP: { rate: 0.86, fee: 2.99 },
  },
  GBP: {
    USD: { rate: 1.27, fee: 3.99 },
    KES: { rate: 164.02, fee: 5.49 },
    EUR: { rate: 1.16, fee: 2.99 },
  },
  KES: {
    USD: { rate: 0.00774, fee: 4.89 },
  },
};

export const getExchangeRate = (
  fromCurrency: string,
  toCurrency: string
): { rate: number; fee: number } => {
  if (fromCurrency === toCurrency) {
    return { rate: 1, fee: 0 };
  }

  const direct = EXCHANGE_RATES[fromCurrency]?.[toCurrency];
  if (direct) {
    return direct;
  }

  const reverse = EXCHANGE_RATES[toCurrency]?.[fromCurrency];
  if (reverse) {
    return { rate: 1 / reverse.rate, fee: reverse.fee };
  }

  return { rate: 1, fee: 5.0 };
};

export const calculateExchange = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): {
  receiveAmount: number;
  rate: number;
  fee: number;
  total: number
} => {
  const { rate, fee } = getExchangeRate(fromCurrency, toCurrency);
  const receiveAmount = amount * rate;
  const total = amount + fee;

  return {
    receiveAmount,
    rate,
    fee,
    total,
  };
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return amount.toFixed(2);

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency.symbol}${formatted}`;
};

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find((c) => c.code === code);
};
