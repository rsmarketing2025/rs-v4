
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

// Brazil timezone constant
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Converts a UTC date to Brazil timezone
 */
export const toBrazilTime = (date: Date): Date => {
  return toZonedTime(date, BRAZIL_TIMEZONE);
};

/**
 * Converts a Brazil timezone date to UTC
 */
export const fromBrazilTime = (date: Date): Date => {
  return fromZonedTime(date, BRAZIL_TIMEZONE);
};

/**
 * Formats a date range for database queries (UTC strings)
 */
export const formatDateRangeForQuery = (dateRange: { from: Date; to: Date }) => {
  const startDate = toBrazilTime(startOfDay(dateRange.from));
  const endDate = toBrazilTime(endOfDay(dateRange.to));
  
  const startDateUTC = fromBrazilTime(startDate);
  const endDateUTC = fromBrazilTime(endDate);
  
  return {
    startDateStr: format(startDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    endDateStr: format(endDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  };
};

/**
 * Formats a single date for database queries (UTC string)
 */
export const formatDateForQuery = (date: Date): string => {
  const brazilDate = toBrazilTime(date);
  const utcDate = fromBrazilTime(brazilDate);
  return format(utcDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
};

/**
 * Standard display formats
 */
export const displayFormats = {
  date: 'dd/MM/yyyy',
  dateTime: 'dd/MM/yyyy HH:mm',
  dateTimeSeconds: 'dd/MM/yyyy HH:mm:ss',
  time: 'HH:mm',
  monthYear: 'MM/yyyy',
  dayMonth: 'dd/MM',
  weekDay: 'EEE dd/MM',
  month: 'MMM',
  year: 'yyyy'
} as const;

/**
 * Format a date for display with Brazil locale
 */
export const formatForDisplay = (
  date: Date | string, 
  formatType: keyof typeof displayFormats = 'date'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const brazilDate = toBrazilTime(dateObj);
  return format(brazilDate, displayFormats[formatType], { locale: ptBR });
};

/**
 * Parse a database date string to Brazil timezone
 */
export const parseDatabaseDate = (dateStr: string): Date => {
  const utcDate = parseISO(dateStr);
  return toBrazilTime(utcDate);
};

/**
 * Check if two dates are the same day in Brazil timezone
 */
export const isSameDayBrazil = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseDatabaseDate(date1) : toBrazilTime(date1);
  const d2 = typeof date2 === 'string' ? parseDatabaseDate(date2) : toBrazilTime(date2);
  
  return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
};

/**
 * Currency formatting
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
};
