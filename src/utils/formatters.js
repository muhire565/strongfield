export function formatUGX(value) {
  if (value == null) return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-UG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
