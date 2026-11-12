const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percent = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** 1234.5 -> "R$ 1.234,50" */
export const formatCurrency = (value: number | null | undefined): string => brl.format(Number(value) || 0);

/** 0.1785 -> "17,9%" */
export const formatPercent = (ratio: number | null | undefined): string =>
  percent.format(Number.isFinite(Number(ratio)) ? Number(ratio) : 0);

/** ISO date string or Date -> "11/11/2026 20:38" */
export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateTime.format(date);
};
