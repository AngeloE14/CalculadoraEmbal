/**
 * Utilidades de parseo y formateo numérico.
 * Fuente original: script.js del proyecto tradicional.
 */

import { ML_PER_OZ } from './constants';

const numberFormatterCache = new Map<number, Intl.NumberFormat>();

export function getNumberFormatter(decimals: number): Intl.NumberFormat {
  if (!numberFormatterCache.has(decimals)) {
    numberFormatterCache.set(
      decimals,
      new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    );
  }

  return numberFormatterCache.get(decimals)!;
}

export function formatNumber(value: number, decimals = 2): string {
  return getNumberFormatter(decimals).format(value);
}

export function formatMlAndOz(valueMl: number, mlDecimals = 0, ozDecimals = 1): string {
  return `${formatNumber(valueMl, mlDecimals)} ml / ${formatNumber(valueMl / ML_PER_OZ, ozDecimals)} fl oz`;
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatVolumeMlAndLiters(valueMl: number): string {
  const valueMlRounded = roundToOneDecimal(valueMl);
  const valueLitersRounded = roundToOneDecimal(valueMl / 1000);
  return `${formatNumber(valueMlRounded, 1)} ml (${formatNumber(valueLitersRounded, 1)} L)`;
}

export function parseInputNumber(raw: string): number | null {
  if (!raw.trim()) {
    return null;
  }

  const normalized = raw.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

export function sanitizeDecimalText(raw: string): string {
  return raw.replace(/,/g, '.');
}
