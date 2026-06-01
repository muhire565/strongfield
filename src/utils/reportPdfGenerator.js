import { formatDate } from './formatters';

const fmt = (v) => {
  if (v == null) return '0';
  const n = Number(v);
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const currency = (v) => `UGX ${fmt(v)}`;

function getLogoUrl() {
  try {
    return `${window.location.origin}/logo.jpeg`;
  } catch {
    return '/logo.jpeg';
  }
}

function buildPage(title, subtitle, bodyHtml) {
  const logoUrl = getLogoUrl();
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 28px 36px; color: #1f2937; line-height: 1.45; font-size: 11.5px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .brand { display: flex; align-items: flex-start; gap: 12px; }
  .brand img { width: 52px; height: 52px; object-fit: contain; border-radius: 4px; }
  .brand-info h2 { margin: 0; font-size: 15px; font-weight: 700; color: #1f2937; letter-spacing: -0.2px; }
  .brand-info p { margin: 1px 0; font-size: 10px; color: #4b5563; line-height: 1.35; }
  .doc-title { text-align: right; }
  .doc-title h1 { margin: 0; font-size: 24px; font-weight: 800; color: #1f2937; letter-spacing: 1.5px; text-transform: uppercase; }
  .doc-title .sub { margin-top: 4px; font-size: 11px; color: #6b7280; }
  .divider { height: 3px; background: #1e40af; margin: 10px 0 20px; border-radius: 2px; }
  h2.section { font-size: 11px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 6px; padding-bottom: 4px; border-bottom: 2px solid #1e40af; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  thead tr { background: #1e293b; }
  th { color: #fff; font-size: 10.5px; font-weight: 600; padding: 8px 10px; text-align: left; border: 1px solid #1e293b; }
  th.text-right, td.text-right { text-align: right; }
  td { padding: 7px 10px; border: 1px solid #e5e7eb; font-size: 11px; color: #374151; vertical-align: top; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr:last-child td { border-bottom: 1px solid #94a3b8; }
  .bs-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  .bs-table td { padding: 6px 10px; border: none; font-size: 11px; color: #374151; vertical-align: top; }
  .bs-table td:first-child { width: 60%; }
  .bs-table td:last-child { width: 40%; text-align: right; font-variant-numeric: tabular-nums; }
  .bs-table tr.indent td:first-child { padding-left: 24px; color: #4b5563; }
  .bs-table tr.subtotal td { border-top: 1px solid #cbd5e1; padding-top: 7px; font-weight: 600; color: #1f2937; }
  .bs-table tr.total td { border-top: 2px solid #1e40af; padding-top: 8px; font-weight: 700; color: #1e3a8a; font-size: 11.5px; }
  .bs-table tr.neg td:last-child { color: #b91c1c; }
  .bs-table tr.spacer td { padding: 2px 0; }
  .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; color: #374151; }
  .row.bold { font-weight: 700; color: #1f2937; }
  .row.indent { padding-left: 20px; }
  .row.total { border-top: 1px solid #d1d5db; padding-top: 6px; margin-top: 4px; font-weight: 700; }
  .row.subtotal { border-top: 1px solid #e5e7eb; padding-top: 5px; margin-top: 3px; font-weight: 600; }
  .row.neg { color: #b91c1c; }
  .totals { width: 280px; margin-left: auto; margin-bottom: 20px; }
  .totals .row { padding: 4px 0; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .alert { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 16px; border-left: 4px solid; }
  .alert-ok { background: #ecfdf5; color: #065f46; border-color: #10b981; }
  .alert-warn { background: #fef2f2; color: #991b1b; border-color: #ef4444; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
  .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; background: #f8fafc; }
  .kpi-label { font-size: 10px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px; }
  .kpi-value { font-size: 16px; font-weight: 700; color: #1e293b; }
  .footer { margin-top: 36px; font-size: 9px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; }
  @media print { body { padding: 20px 28px; } button { display: none !important; } }
</style></head>
<body>
  <div class="top">
    <div class="brand">
      <img src="${logoUrl}" alt="Logo" />
      <div class="brand-info">
        <h2>StrongField Electrical Centre</h2>
        <p>TIN No: 1015192270</p>
        <p>Plot 46 Lubaas Road, Nge Estate 0026E, Uganda</p>
        <p>mapeetersimon@yahoo.com</p>
      </div>
    </div>
    <div class="doc-title">
      <h1>${title}</h1>
      <div class="sub">${subtitle || ''}</div>
    </div>
  </div>
  <div class="divider"></div>
  ${bodyHtml}
  <div class="footer">
    <p>Generated by StrongField Electrical Centre Management System</p>
    <p>This report is for internal use only.</p>
  </div>
</body></html>`;
}

function openWindow(html) {
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

export function printIncomeStatementReport(data) {
  const d = data || {};
  const rev = d.revenue || {};
  const cogs = d.cost_of_goods_sold || {};
  const opex = d.operating_expenses || {};
  const body = `
    <h2 class="section">Revenue</h2>
    <div class="row indent"><span>Gross Sales</span><span>${currency(rev.gross_sales)}</span></div>
    <div class="row indent"><span>Less: Discounts</span><span class="neg">${currency(rev.discounts_given)}</span></div>
    <div class="row indent"><span>Less: Refunds</span><span class="neg">${currency(rev.refunds)}</span></div>
    <div class="row total"><span>Net Revenue</span><span>${currency(rev.net_revenue)}</span></div>
    <h2 class="section">Cost of Goods Sold</h2>
    <div class="row indent"><span>Opening Stock Value</span><span>${currency(cogs.opening_stock_value)}</span></div>
    <div class="row indent"><span>Add: Purchases During Period</span><span>${currency(cogs.purchases_during_period)}</span></div>
    <div class="row indent"><span>Less: Closing Stock Value</span><span class="neg">${currency(cogs.closing_stock_value)}</span></div>
    <div class="row total"><span>Cost of Goods Sold</span><span>${currency(cogs.cogs)}</span></div>
    <div class="row subtotal" style="margin-top:10px;"><span>Gross Profit</span><span>${currency(d.gross_profit)}</span></div>
    <div class="row" style="margin-bottom:10px;"><span>Gross Margin</span><span>${d.gross_margin_pct}%</span></div>
    <h2 class="section">Operating Expenses</h2>
    ${(opex.by_category || []).map(c => `<div class="row indent"><span>${c.category}</span><span class="neg">${currency(c.amount)}</span></div>`).join('')}
    <div class="row total"><span>Total Operating Expenses</span><span class="neg">${currency(opex.total)}</span></div>
    <div class="row subtotal" style="margin-top:10px;"><span>Net Profit / (Loss)</span><span>${currency(d.net_profit)}</span></div>
    <div class="row"><span>Net Margin</span><span>${d.net_margin_pct}%</span></div>
  `;
  openWindow(buildPage('Income Statement', `Period: ${d.period?.from || ''} to ${d.period?.to || ''}`, body));
}

function bsRow(label, value, type = 'normal') {
  const classes = {
    normal: '',
    indent: 'indent',
    subtotal: 'subtotal',
    total: 'total',
    neg: 'neg',
  };
  const cls = classes[type] || '';
  return `<tr class="${cls}"><td>${label}</td><td>${currency(value)}</td></tr>`;
}

function bsSpacer() {
  return '<tr class="spacer"><td></td><td></td></tr>';
}

export function printBalanceSheetReport(data) {
  const d = data || {};
  const assets = d.assets || {};
  const ca = assets.current_assets || {};
  const cash = ca.cash_and_equivalents || {};
  const liab = d.liabilities || {};
  const cl = liab.current_liabilities || {};
  const eq = d.equity || {};
  const alert = d.balanced
    ? `<div class="alert alert-ok">Balance Sheet is BALANCED</div>`
    : `<div class="alert alert-warn">Balance sheet discrepancy detected. Total Assets &ne; Liabilities + Equity.</div>`;

  const body = `${alert}
    <h2 class="section">Assets</h2>
    <table class="bs-table">
      ${bsRow('Cash on Hand', cash.cash, 'indent')}
      ${bsRow('MTN Mobile Money', cash.mtn_mobile_money, 'indent')}
      ${bsRow('Airtel Money', cash.airtel_money, 'indent')}
      ${bsRow('Bank Transfer', cash.bank_transfer, 'indent')}
      ${bsRow('Total Cash & Equivalents', cash.total, 'subtotal')}
      ${bsSpacer()}
      ${bsRow('Accounts Receivable', ca.accounts_receivable, 'indent')}
      ${bsRow('Inventory at Cost', ca.inventory_value, 'indent')}
      ${bsRow('Total Current Assets', ca.total_current_assets, 'subtotal')}
      ${bsSpacer()}
      ${bsRow('TOTAL ASSETS', assets.total_assets, 'total')}
    </table>

    <h2 class="section">Liabilities</h2>
    <table class="bs-table">
      ${bsRow('Accounts Payable', cl.accounts_payable, 'indent')}
      ${bsRow('Total Current Liabilities', cl.total_current_liabilities, 'subtotal')}
      ${bsSpacer()}
      ${bsRow('TOTAL LIABILITIES', liab.total_liabilities, 'total')}
    </table>

    <h2 class="section">Owner's Equity</h2>
    <table class="bs-table">
      ${bsRow('Capital Injected', eq.owner_capital_injected, 'indent')}
      ${bsRow('Retained Earnings', eq.retained_earnings, 'indent')}
      ${bsRow('Less: Owner Drawings', eq.owner_drawings, 'indent')}
      ${bsRow('Net Owner\'s Equity', eq.net_equity, 'subtotal')}
      ${bsSpacer()}
      ${bsRow('TOTAL LIABILITIES + EQUITY', d.liabilities_plus_equity, 'total')}
    </table>
  `;
  openWindow(buildPage('Balance Sheet', `As at: ${d.as_at || ''}`, body));
}

export function printCashFlowReport(data) {
  const d = data || {};
  const op = d.operating_activities || {};
  const fin = d.financing_activities || {};
  const daily = d.daily_breakdown || [];
  let dailyTable = '';
  if (daily.length) {
    dailyTable = `<h2 class="section">Daily Cash Movement</h2>
      <table><thead><tr><th>Date</th><th class="text-right">Inflows</th><th class="text-right">Outflows</th><th class="text-right">Net</th></tr></thead>
      <tbody>${daily.map(day => `<tr><td>${day.date}</td><td class="text-right">${currency(day.inflows)}</td><td class="text-right">${currency(day.outflows)}</td><td class="text-right">${currency(day.net)}</td></tr>`).join('')}</tbody></table>`;
  }
  const body = `
    <h2 class="section">Operating Activities</h2>
    <div class="row indent"><span>Cash Received from Customers</span><span>${currency(op.cash_received_from_customers)}</span></div>
    <div class="row indent"><span>Cash Paid for Business Expenses</span><span class="neg">${currency(op.cash_paid_for_expenses)}</span></div>
    <div class="row indent"><span>Cash Paid for Stock Purchases</span><span class="neg">${currency(op.cash_paid_for_goods)}</span></div>
    <div class="row total"><span>Net Cash from Operating Activities</span><span>${currency(op.net_operating_cash_flow)}</span></div>
    <h2 class="section">Financing Activities</h2>
    <div class="row indent"><span>Capital Injected by Owner</span><span>${currency(fin.capital_injected)}</span></div>
    <div class="row indent"><span>Owner Withdrawals</span><span class="neg">${currency(fin.owner_withdrawals)}</span></div>
    <div class="row total"><span>Net Cash from Financing Activities</span><span>${currency(fin.net_financing_cash_flow)}</span></div>
    <div class="row subtotal" style="margin-top:12px;"><span>NET CHANGE IN CASH</span><span>${currency(d.net_change_in_cash)}</span></div>
    <div class="row indent"><span>Opening Cash Balance</span><span>${currency(d.opening_cash_balance)}</span></div>
    <div class="row total"><span>Closing Cash Balance</span><span>${currency(d.closing_cash_balance)}</span></div>
    ${dailyTable}
  `;
  openWindow(buildPage('Statement of Cash Flows', `${d.period?.from || ''} to ${d.period?.to || ''}`, body));
}

export function printSalesReport(data, groupBy) {
  const d = data || {};
  const rows = d.rows || [];
  const totals = d.totals || {};
  const headers = {
    day: ['Period', 'Transactions', 'Gross Sales', 'Discounts', 'Net Sales', 'Avg Sale'],
    week: ['Period', 'Transactions', 'Gross Sales', 'Discounts', 'Net Sales'],
    month: ['Period', 'Transactions', 'Gross Sales', 'Discounts', 'Net Sales'],
    product: ['Product', 'Brand', 'Units Sold', 'Revenue', 'Cost', 'Gross Margin', 'Margin %'],
    staff: ['Staff', 'Role', 'Transactions', 'Total Sales', 'Avg Sale', 'Discounts'],
    payment_mode: ['Mode', 'Transactions', 'Total Collected'],
    client: ['Client', 'Transactions', 'Total Purchases', 'Paid', 'Balance Due'],
  }[groupBy] || [];
  const renderRow = (row) => {
    if (groupBy === 'day') return `<tr><td>${row.period}</td><td class="text-right">${row.transactions}</td><td class="text-right">${currency(row.gross_sales)}</td><td class="text-right">${currency(row.discounts)}</td><td class="text-right">${currency(row.net_sales)}</td><td class="text-right">${currency(row.avg_sale_value)}</td></tr>`;
    if (groupBy === 'product') return `<tr><td>${row.product}</td><td>${row.brand} ${row.model}</td><td class="text-right">${row.units_sold}</td><td class="text-right">${currency(row.revenue)}</td><td class="text-right">${currency(row.cost)}</td><td class="text-right">${currency(row.gross_margin)}</td><td class="text-right">${row.gross_margin_pct}%</td></tr>`;
    if (groupBy === 'staff') return `<tr><td>${row.staff_name}</td><td>${row.role}</td><td class="text-right">${row.transactions}</td><td class="text-right">${currency(row.total_sales)}</td><td class="text-right">${currency(row.avg_sale)}</td><td class="text-right">${currency(row.discounts_given)}</td></tr>`;
    if (groupBy === 'payment_mode') return `<tr><td>${row.mode?.replace(/_/g, ' ') || ''}</td><td class="text-right">${row.transactions}</td><td class="text-right">${currency(row.total_collected)}</td></tr>`;
    if (groupBy === 'client') return `<tr><td>${row.client_name}</td><td class="text-right">${row.transactions}</td><td class="text-right">${currency(row.total_purchases)}</td><td class="text-right">${currency(row.total_paid)}</td><td class="text-right">${currency(row.balance_due)}</td></tr>`;
    return `<tr><td>${row.period}</td><td class="text-right">${row.transactions}</td><td class="text-right">${currency(row.gross_sales)}</td><td class="text-right">${currency(row.discounts)}</td><td class="text-right">${currency(row.net_sales)}</td></tr>`;
  };
  const body = `
    <p style="font-size:11px; color:#6b7280; margin-bottom:10px;">Grouped by: <strong>${groupBy.replace(/_/g, ' ').toUpperCase()}</strong></p>
    <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(renderRow).join('')}</tbody></table>
    ${Object.keys(totals).length ? `<div class="totals">${Object.entries(totals).map(([k, v]) => `<div class="row"><span class="bold">${k.replace(/_/g, ' ').toUpperCase()}</span><span class="bold">${currency(v)}</span></div>`).join('')}</div>` : ''}
  `;
  openWindow(buildPage('Sales Report', '', body));
}

export function printInventoryReport(data) {
  const d = data || {};
  const ms = d.stock_movement_summary || {};
  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Total Products</div><div class="kpi-value">${d.total_products || 0}</div></div>
      <div class="kpi-card"><div class="kpi-label">Total Units</div><div class="kpi-value">${d.total_units || 0}</div></div>
      <div class="kpi-card"><div class="kpi-label">Stock Value (Sell)</div><div class="kpi-value">${currency(d.total_stock_value)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Stock Value (Cost)</div><div class="kpi-value">${currency(d.total_cost_value)}</div></div>
    </div>
    <h2 class="section">Stock Movement Summary</h2>
    <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; margin-bottom:16px;">
      ${Object.entries(ms).map(([k, v]) => `<div style="border:1px solid #e5e7eb; border-radius:6px; padding:8px; text-align:center;"><div style="font-size:10px; color:#6b7280; text-transform:capitalize;">${k.replace(/_/g, ' ')}</div><div style="font-size:14px; font-weight:700;">${v}</div></div>`).join('')}
    </div>
    <h2 class="section">Low Stock Items</h2>
    <table><thead><tr><th>Product</th><th class="text-right">Quantity</th><th class="text-right">Threshold</th></tr></thead>
    <tbody>${(d.low_stock_items || []).map(i => `<tr><td>${i.name} (${i.brand} ${i.model})</td><td class="text-right">${i.quantity}</td><td class="text-right">${i.low_stock_threshold}</td></tr>`).join('')}</tbody></table>
    <h2 class="section">Out of Stock Items</h2>
    <table><thead><tr><th>Product</th></tr></thead>
    <tbody>${(d.out_of_stock_items || []).map(i => `<tr><td>${i.name} (${i.brand} ${i.model})</td></tr>`).join('')}</tbody></table>
  `;
  openWindow(buildPage('Inventory Report', '', body));
}

export function printCreditReport(data) {
  const d = data || {};
  const ledger = d.client_ledger || [];
  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Total Credit Issued</div><div class="kpi-value">${currency(d.total_credit_sales)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Total Collected</div><div class="kpi-value">${currency(d.total_collected)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Outstanding</div><div class="kpi-value">${currency(d.total_outstanding)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Collection Rate</div><div class="kpi-value">${d.collection_rate_pct}%</div></div>
    </div>
    <h2 class="section">Client Ledger</h2>
    <table><thead><tr><th>Client</th><th class="text-right">Total Invoiced</th><th class="text-right">Paid</th><th class="text-right">Balance</th><th class="text-right">Oldest Unpaid</th></tr></thead>
    <tbody>${ledger.map(c => `<tr><td>${c.client_name}</td><td class="text-right">${currency(c.total_invoiced)}</td><td class="text-right">${currency(c.total_paid)}</td><td class="text-right">${currency(c.balance_due)}</td><td class="text-right">${c.oldest_unpaid_date || '-'}</td></tr>`).join('')}</tbody></table>
  `;
  openWindow(buildPage('Credit Report', '', body));
}

export function printExpensesReport(data) {
  const d = data || {};
  const byCat = d.by_category || [];
  const top = d.top_expenses || [];
  const body = `
    <div style="text-align:center; margin-bottom:16px;">
      <div style="font-size:10px; color:#6b7280;">Total Expenses</div>
      <div style="font-size:24px; font-weight:700; color:#b91c1c;">${currency(d.total)}</div>
    </div>
    <h2 class="section">By Category</h2>
    <table><thead><tr><th>Category</th><th class="text-right">Amount</th><th class="text-right">Count</th><th class="text-right">%</th></tr></thead>
    <tbody>${byCat.map(c => `<tr><td>${c.category.replace(/_/g, ' ').toUpperCase()}</td><td class="text-right">${currency(c.amount)}</td><td class="text-right">${c.count}</td><td class="text-right">${d.total ? Math.round((c.amount / d.total) * 100) : 0}%</td></tr>`).join('')}</tbody></table>
    <h2 class="section">Top Expenses</h2>
    <table><thead><tr><th>Description</th><th>Category</th><th>Date</th><th class="text-right">Amount</th></tr></thead>
    <tbody>${top.map(e => `<tr><td>${e.description}</td><td>${e.category?.replace(/_/g, ' ') || ''}</td><td>${e.expense_date}</td><td class="text-right">${currency(e.amount)}</td></tr>`).join('')}</tbody></table>
  `;
  openWindow(buildPage('Expenses Report', '', body));
}

export function printOwnerEquityReport(data) {
  const d = data || {};
  const cap = d.capital_injections || {};
  const wd = d.owner_drawings || {};
  const move = d.equity_movement || [];
  const body = `
    <h2 class="section">Equity Reconciliation</h2>
    <div class="row total"><span>Opening Equity (start of period)</span><span>${currency(d.opening_equity)}</span></div>
    <div class="row indent"><span>Add: Capital Injected During Period</span><span>${currency(cap.total)}</span></div>
    <div class="row" style="padding-left:20px; font-size:10px; color:#6b7280;">${cap.count} injection(s)</div>
    <div class="row indent"><span>Add: Net Profit for Period</span><span>${currency(d.net_profit_for_period)}</span></div>
    <div class="row indent"><span>Less: Owner Drawings During Period</span><span class="neg">${currency(wd.total)}</span></div>
    <div class="row" style="padding-left:20px; font-size:10px; color:#6b7280;">${wd.count} withdrawal(s)</div>
    <div class="row total" style="margin-top:8px;"><span>Closing Equity (end of period)</span><span>${currency(d.closing_equity)}</span></div>
    ${move.length ? `<h2 class="section">Equity Movement Log</h2>
    <table><thead><tr><th>Date</th><th>Event</th><th class="text-right">Amount</th></tr></thead>
    <tbody>${move.map(m => `<tr><td>${m.date}</td><td><span class="badge ${m.type === 'credit' ? 'badge-green' : 'badge-red'}">${m.event}</span></td><td class="text-right">${currency(m.amount)}</td></tr>`).join('')}</tbody></table>` : ''}
  `;
  openWindow(buildPage("Statement of Changes in Owner's Equity", `${d.period?.from || ''} to ${d.period?.to || ''}`, body));
}

export function printTrialBalanceReport(data) {
  const d = data || {};
  const accounts = d.accounts || [];
  const alert = d.balanced
    ? `<div class="alert alert-ok">Trial Balance is BALANCED</div>`
    : `<div class="alert alert-warn">Trial balance is NOT balanced. Debits ≠ Credits.</div>`;
  const body = `${alert}
    <table><thead><tr><th>Account</th><th class="text-right">Debit</th><th class="text-right">Credit</th></tr></thead>
    <tbody>${accounts.map(acc => `<tr><td>${acc.account}</td><td class="text-right">${acc.debit > 0 ? currency(acc.debit) : '-'}</td><td class="text-right">${acc.credit > 0 ? currency(acc.credit) : '-'}</td></tr>`).join('')}
    <tr style="font-weight:700; border-top:2px solid #1e293b;"><td>TOTAL</td><td class="text-right">${currency(d.total_debit)}</td><td class="text-right">${currency(d.total_credit)}</td></tr></tbody></table>
  `;
  openWindow(buildPage('Trial Balance', `As at: ${d.as_at || ''}`, body));
}

export function printGeneralLedgerReport(data, modeLabel) {
  const d = data || {};
  const rows = d.rows || [];
  const body = `
    <div class="kpi-grid" style="grid-template-columns: repeat(2, 1fr);">
      <div class="kpi-card"><div class="kpi-label">Opening Balance</div><div class="kpi-value">${currency(d.opening_balance)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Closing Balance</div><div class="kpi-value">${currency(d.closing_balance)}</div></div>
    </div>
    <p style="font-size:11px; color:#6b7280; margin-bottom:10px;">Payment Mode: <strong>${modeLabel || 'All'}</strong></p>
    <table><thead><tr><th>Date</th><th>Reference</th><th>Type</th><th class="text-right">Debit</th><th class="text-right">Credit</th><th class="text-right">Balance</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td>${r.date}</td><td>${r.reference || '-'}</td><td>${r.type?.replace(/_/g, ' ') || ''}</td><td class="text-right">${r.debit > 0 ? currency(r.debit) : '-'}</td><td class="text-right">${r.credit > 0 ? currency(r.credit) : '-'}</td><td class="text-right">${currency(r.balance)}</td></tr>`).join('')}</tbody></table>
  `;
  openWindow(buildPage('General Ledger', '', body));
}

export function printComparativeReport(data, p1Label, p2Label) {
  const d = data || {};
  const p1 = d.income_statement_1 || {};
  const p2 = d.income_statement_2 || {};
  const diff = (v1, v2) => {
    const dv = (v2 || 0) - (v1 || 0);
    const pct = v1 ? ((dv / v1) * 100).toFixed(1) : '0';
    return { val: dv, pct };
  };
  const metrics = [
    { label: 'Net Revenue', v1: (p1.revenue?.net_revenue || 0), v2: (p2.revenue?.net_revenue || 0) },
    { label: 'COGS', v1: (p1.cost_of_goods_sold?.cogs || 0), v2: (p2.cost_of_goods_sold?.cogs || 0) },
    { label: 'Gross Profit', v1: (p1.gross_profit || 0), v2: (p2.gross_profit || 0) },
    { label: 'Operating Expenses', v1: (p1.operating_expenses?.total || 0), v2: (p2.operating_expenses?.total || 0) },
    { label: 'Net Profit', v1: (p1.net_profit || 0), v2: (p2.net_profit || 0) },
  ];
  const body = `
    <table><thead><tr><th>Metric</th><th class="text-right">${p1Label || 'Period 1'}</th><th class="text-right">${p2Label || 'Period 2'}</th><th class="text-right">Change (UGX)</th><th class="text-right">Change (%)</th></tr></thead>
    <tbody>${metrics.map(m => {
      const d = diff(m.v1, m.v2);
      return `<tr><td class="bold">${m.label}</td><td class="text-right">${currency(m.v1)}</td><td class="text-right">${currency(m.v2)}</td><td class="text-right ${d.val >= 0 ? '' : 'neg'}">${d.val >= 0 ? '' : '-'}${currency(Math.abs(d.val))}</td><td class="text-right">${d.val >= 0 ? '+' : ''}${d.pct}%</td></tr>`;
    }).join('')}</tbody></table>
  `;
  openWindow(buildPage('Comparative Report', `${p1Label || 'Period 1'} vs ${p2Label || 'Period 2'}`, body));
}

export function printDashboardReport(data, fromDate, toDate) {
  const d = data || {};
  const gp = d.revenue ? (d.gross_profit || 0) : 0;
  const rev = d.revenue || 0;
  const body = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Net Revenue</div><div class="kpi-value">${currency(rev)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Net Profit</div><div class="kpi-value">${currency(d.net_profit || 0)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Total Expenses</div><div class="kpi-value">${currency(d.expenses || 0)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Outstanding Receivables</div><div class="kpi-value">${currency(d.accounts_receivable || 0)}</div></div>
    </div>
    <h2 class="section">Financial Summary</h2>
    <div class="row"><span>Gross Sales</span><span>${currency(rev)}</span></div>
    <div class="row"><span>Discounts Given</span><span>${currency(0)}</span></div>
    <div class="row total"><span>Net Revenue</span><span>${currency(rev)}</span></div>
    <div class="row" style="margin-top:8px;"><span>Cost of Goods Sold</span><span>${currency(rev - gp)}</span></div>
    <div class="row subtotal"><span>Gross Profit</span><span>${currency(gp)}</span></div>
    <div class="row"><span>Gross Margin</span><span>${rev ? Math.round((gp / rev) * 100) : 0}%</span></div>
    <div class="row" style="margin-top:8px;"><span>Operating Expenses</span><span>${currency(d.expenses || 0)}</span></div>
    <div class="row subtotal"><span>Net Profit</span><span>${currency(d.net_profit || 0)}</span></div>
    <div class="row"><span>Net Margin</span><span>${rev ? Math.round(((d.net_profit || 0) / rev) * 100) : 0}%</span></div>
  `;
  openWindow(buildPage('Financial Dashboard Summary', `${fromDate || ''} to ${toDate || ''}`, body));
}
