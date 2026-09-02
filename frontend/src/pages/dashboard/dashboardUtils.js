export const statusStyles = {
  active: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  paused: 'border-slate-300 bg-slate-100 text-slate-600',
};

export const intervalLabels = {
  30000: '30s',
  60000: '1m',
  120000: '2m',
  300000: '5m',
  900000: '15m',
};

export const formatMonitorDate = (date) => {
  if (!date) return '-';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatInterval = (interval) => intervalLabels[interval] || `${Math.round(Number(interval || 0) / 1000)}s`;
