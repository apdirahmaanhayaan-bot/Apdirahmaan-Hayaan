import { CurrencySettings } from '../types';

export const DEFAULT_ETB_RATE = 130; // 1 USD = 130 ETB

export function toETB(usdAmount: number, rate: number = DEFAULT_ETB_RATE): number {
  return Number((usdAmount * rate).toFixed(2));
}

export function toUSD(etbAmount: number, rate: number = DEFAULT_ETB_RATE): number {
  if (!rate || rate <= 0) return 0;
  return Number((etbAmount / rate).toFixed(2));
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
}

export function formatETB(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0) + ' ETB';
}

/**
 * Returns a rich currency display with prominent Ethiopian Birr (ETB)
 */
export function formatCurrencyDisplay(
  usdAmount: number,
  settings?: CurrencySettings
) {
  const rate = settings?.etbRate || DEFAULT_ETB_RATE;
  const etbValue = toETB(usdAmount, rate);
  const usdFormatted = formatUSD(usdAmount);
  const etbFormatted = formatETB(etbValue);
  const isETBPrimary = settings?.primaryCurrency === 'ETB';

  return {
    usd: usdFormatted,
    etb: etbFormatted,
    etbNumber: etbValue,
    usdNumber: usdAmount,
    rate,
    isETBPrimary,
    // When ETB is primary, ETB is shown first with larger emphasis
    primaryDisplay: isETBPrimary ? etbFormatted : usdFormatted,
    secondaryDisplay: isETBPrimary ? usdFormatted : etbFormatted,
    fullDisplay: isETBPrimary ? `${etbFormatted} (${usdFormatted})` : `${usdFormatted} (~${etbFormatted})`
  };
}
