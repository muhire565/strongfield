const DEFAULT_WHATSAPP_NUMBER = '256754925266';

function encodeForUrl(text) {
  return encodeURIComponent(text);
}

export function openWhatsApp({ text, phone = DEFAULT_WHATSAPP_NUMBER } = {}) {
  const message = text || '';
  const url = `https://wa.me/${phone}?text=${encodeForUrl(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareFile(blob, filename, title) {
  if (!navigator.canShare || !navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })) {
    return false;
  }
  try {
    const file = new File([blob], filename, { type: blob.type });
    await navigator.share({ title, files: [file] });
    return true;
  } catch {
    return false;
  }
}

export function openEmail({ subject, body } = {}) {
  const url = `mailto:?subject=${encodeForUrl(subject || '')}&body=${encodeForUrl(body || '')}`;
  window.location.href = url;
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function nativeShare({ title, text, url } = {}) {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

export function canNativeShare() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

// Report text generators
export function buildBalanceSheetSummary(data) {
  const d = data || {};
  const a = d.assets || {};
  const ca = a.current_assets || {};
  const cash = ca.cash_and_equivalents || {};
  const l = d.liabilities || {};
  const cl = l.current_liabilities || {};
  const e = d.equity || {};

  return [
    `*Balance Sheet* — As at ${d.as_at || ''}`,
    '',
    `*Assets*`,
    `Cash on Hand: USh ${formatNum(cash.cash)}`,
    `MTN Mobile Money: USh ${formatNum(cash.mtn_mobile_money)}`,
    `Airtel Money: USh ${formatNum(cash.airtel_money)}`,
    `Bank Transfer: USh ${formatNum(cash.bank_transfer)}`,
    `Total Cash & Equivalents: USh ${formatNum(cash.total)}`,
    `Accounts Receivable: USh ${formatNum(ca.accounts_receivable)}`,
    `Inventory at Cost: USh ${formatNum(ca.inventory_value)}`,
    `Total Current Assets: USh ${formatNum(ca.total_current_assets)}`,
    `*TOTAL ASSETS: USh ${formatNum(a.total_assets)}*`,
    '',
    `*Liabilities*`,
    `Accounts Payable: USh ${formatNum(cl.accounts_payable)}`,
    `Total Current Liabilities: USh ${formatNum(cl.total_current_liabilities)}`,
    `*TOTAL LIABILITIES: USh ${formatNum(l.total_liabilities)}*`,
    '',
    `*Owner's Equity*`,
    `Capital Injected: USh ${formatNum(e.owner_capital_injected)}`,
    `Retained Earnings: USh ${formatNum(e.retained_earnings)}`,
    `Less: Owner Drawings: USh ${formatNum(e.owner_drawings)}`,
    `Net Owner's Equity: USh ${formatNum(e.net_equity)}`,
    `*TOTAL LIABILITIES + EQUITY: USh ${formatNum(d.liabilities_plus_equity)}*`,
    d.balanced ? '\n✅ Balance Sheet is BALANCED' : '\n⚠️ Balance sheet discrepancy detected.',
  ].join('\n');
}

export function buildIncomeStatementSummary(data) {
  const d = data || {};
  const rev = d.revenue || {};
  const cogs = d.cost_of_goods_sold || {};
  const opex = d.operating_expenses || {};
  const cats = opex.by_category || [];

  return [
    `*Income Statement* — ${d.period?.from || ''} to ${d.period?.to || ''}`,
    '',
    `*Revenue*`,
    `Gross Sales: USh ${formatNum(rev.gross_sales)}`,
    `Less: Discounts: USh ${formatNum(rev.discounts_given)}`,
    `Less: Refunds: USh ${formatNum(rev.refunds)}`,
    `Net Revenue: USh ${formatNum(rev.net_revenue)}`,
    '',
    `*Cost of Goods Sold*`,
    `Opening Stock: USh ${formatNum(cogs.opening_stock_value)}`,
    `Add: Purchases: USh ${formatNum(cogs.purchases_during_period)}`,
    `Less: Closing Stock: USh ${formatNum(cogs.closing_stock_value)}`,
    `COGS: USh ${formatNum(cogs.cogs)}`,
    `Gross Profit: USh ${formatNum(d.gross_profit)} (${d.gross_margin_pct || 0}%)`,
    '',
    `*Operating Expenses*`,
    ...cats.map((cat) => `${cat.category}: USh ${formatNum(cat.amount)}`),
    `Total OpEx: USh ${formatNum(opex.total)}`,
    '',
    `*NET PROFIT: USh ${formatNum(d.net_profit)} (${d.net_margin_pct || 0}%)*`,
  ].join('\n');
}

export function buildCashFlowSummary(data) {
  const d = data || {};
  const op = d.operating_activities || {};
  const fin = d.financing_activities || {};

  return [
    `*Cash Flow Statement* — ${d.period?.from || ''} to ${d.period?.to || ''}`,
    '',
    `*Operating Activities*`,
    `Cash Received: USh ${formatNum(op.cash_received_from_customers)}`,
    `Cash Paid (Expenses): USh ${formatNum(op.cash_paid_for_expenses)}`,
    `Cash Paid (Goods): USh ${formatNum(op.cash_paid_for_goods)}`,
    `Net Operating: USh ${formatNum(op.net_operating_cash_flow)}`,
    '',
    `*Financing Activities*`,
    `Capital Injected: USh ${formatNum(fin.capital_injected)}`,
    `Owner Withdrawals: USh ${formatNum(fin.owner_withdrawals)}`,
    `Net Financing: USh ${formatNum(fin.net_financing_cash_flow)}`,
    '',
    `*NET CHANGE IN CASH: USh ${formatNum(d.net_change_in_cash)}*`,
    `Opening Balance: USh ${formatNum(d.opening_cash_balance)}`,
    `Closing Balance: USh ${formatNum(d.closing_cash_balance)}`,
  ].join('\n');
}

export function buildInvoiceSummary(sale) {
  const s = sale || {};
  const items = (s.items || []).map((it, i) =>
    `${i + 1}. ${it.product_name} x${it.quantity} @ USh ${formatNum(it.unit_price)} = USh ${formatNum(it.line_total)}`
  ).join('\n');

  return [
    `*Invoice ${s.sale_number || ''}*`,
    `Status: ${(s.status || '').replace(/_/g, ' ').toUpperCase()}`,
    `Date: ${s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}`,
    `Customer: ${s.client?.full_name || 'Walk-in'}`,
    '',
    `*Items*`,
    items || 'No items',
    '',
    `Subtotal: USh ${formatNum(s.subtotal)}`,
    `Discount: USh ${formatNum(s.discount_amount)}`,
    `Tax: USh ${formatNum(s.tax_amount)}`,
    `*Total: USh ${formatNum(s.total_amount)}*`,
    `Paid: USh ${formatNum(s.amount_paid)}`,
    `*Balance Due: USh ${formatNum(s.balance_due)}*`,
  ].join('\n');
}

export function buildDashboardSummary(data, fromDate, toDate) {
  const d = data || {};
  return [
    `*Financial Summary* — ${fromDate || ''} to ${toDate || ''}`,
    '',
    `Net Revenue: USh ${formatNum(d.revenue)}`,
    `Net Profit: USh ${formatNum(d.net_profit)}`,
    `Total Expenses: USh ${formatNum(d.expenses)}`,
    `Outstanding Receivables: USh ${formatNum(d.accounts_receivable)}`,
    '',
    `Total Sales: ${d.total_sales || 0}`,
    `Total Quotations: ${d.total_quotations || 0}`,
    `Credit Sales: ${d.credit_sales || 0}`,
  ].join('\n');
}

export function buildQuotationSummary(quote) {
  const q = quote || {};
  const items = (q.items || []).map((it, i) =>
    `${i + 1}. ${it.product_name} x${it.quantity} @ USh ${formatNum(it.unit_price)} = USh ${formatNum(it.line_total)}`
  ).join('\n');

  return [
    `*Quotation ${q.quote_number || ''}*`,
    `Status: ${(q.status || '').replace(/_/g, ' ').toUpperCase()}`,
    `Date: ${q.created_at ? new Date(q.created_at).toLocaleDateString() : ''}`,
    `Valid Until: ${q.valid_until ? new Date(q.valid_until).toLocaleDateString() : ''}`,
    `Customer: ${q.client?.full_name || 'Walk-in'}`,
    '',
    `*Items*`,
    items || 'No items',
    '',
    `Subtotal: USh ${formatNum(q.subtotal)}`,
    `Discount: USh ${formatNum(q.discount_amount)}`,
    `Tax: USh ${formatNum(q.tax_amount)}`,
    `*Total: USh ${formatNum(q.total_amount)}*`,
  ].join('\n');
}

function formatNum(val) {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-UG');
}
