import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmt = (v) => {
  if (v == null) return '0';
  const n = Number(v);
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

function setupDoc(title) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  return doc;
}

function addHeader(doc, title, subtitle = '') {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HIGHWAY ELECTRONICS', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Kampala, Uganda', 14, 24);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 35);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 41);
  }

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.8);
  doc.line(14, 45, 196, 45);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  return 52;
}

export function generateInvoicePdfBlob(sale) {
  const s = sale || {};
  const doc = setupDoc('INVOICE');
  let y = addHeader(doc, 'INVOICE', `Date: ${s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}`);

  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice: ${s.sale_number || ''}`, 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${(s.status || '').replace(/_/g, ' ').toUpperCase()}`, 14, y);
  y += 6;
  doc.text(`Customer: ${s.client?.full_name || 'Walk-in'}`, 14, y);
  y += 10;

  const items = (s.items || []).map((it, i) => [
    i + 1,
    it.product_name || '',
    fmt(it.quantity),
    `UGX ${fmt(it.unit_price)}`,
    `UGX ${fmt(it.line_total)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item', 'Qty', 'Unit Price', 'Line Total']],
    body: items,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: UGX ${fmt(s.subtotal)}`, 140, y, { align: 'right' });
  y += 6;
  doc.text(`Discount: UGX ${fmt(s.discount_amount)}`, 140, y, { align: 'right' });
  y += 6;
  doc.text(`Tax: UGX ${fmt(s.tax_amount)}`, 140, y, { align: 'right' });
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: UGX ${fmt(s.total_amount)}`, 140, y, { align: 'right' });
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Paid: UGX ${fmt(s.amount_paid)}`, 140, y, { align: 'right' });
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Balance Due: UGX ${fmt(s.balance_due)}`, 140, y, { align: 'right' });

  return doc.output('blob');
}

export function generateBalanceSheetPdfBlob(data) {
  const d = data || {};
  const a = d.assets || {};
  const ca = a.current_assets || {};
  const cash = ca.cash_and_equivalents || {};
  const l = d.liabilities || {};
  const cl = l.current_liabilities || {};
  const e = d.equity || {};

  const doc = setupDoc('BALANCE SHEET');
  let y = addHeader(doc, 'BALANCE SHEET', `As at: ${d.as_at || ''}`);

  const body = [
    ['Cash on Hand', `UGX ${fmt(cash.cash)}`],
    ['MTN Mobile Money', `UGX ${fmt(cash.mtn_mobile_money)}`],
    ['Airtel Money', `UGX ${fmt(cash.airtel_money)}`],
    ['Bank Transfer', `UGX ${fmt(cash.bank_transfer)}`],
    ['Total Cash & Equivalents', `UGX ${fmt(cash.total)}`],
    ['Accounts Receivable', `UGX ${fmt(ca.accounts_receivable)}`],
    ['Inventory at Cost', `UGX ${fmt(ca.inventory_value)}`],
    ['Total Current Assets', `UGX ${fmt(ca.total_current_assets)}`],
    ['TOTAL ASSETS', `UGX ${fmt(a.total_assets)}`],
    ['', ''],
    ['Accounts Payable', `UGX ${fmt(cl.accounts_payable)}`],
    ['Total Current Liabilities', `UGX ${fmt(cl.total_current_liabilities)}`],
    ['TOTAL LIABILITIES', `UGX ${fmt(l.total_liabilities)}`],
    ['', ''],
    ['Capital Injected', `UGX ${fmt(e.owner_capital_injected)}`],
    ['Retained Earnings', `UGX ${fmt(e.retained_earnings)}`],
    ['Less: Owner Drawings', `UGX ${fmt(e.owner_drawings)}`],
    ['Net Owner\'s Equity', `UGX ${fmt(e.net_equity)}`],
    ['TOTAL LIABILITIES + EQUITY', `UGX ${fmt(d.liabilities_plus_equity)}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['', '']],
    body,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 50, halign: 'right' } },
    didParseCell: (hookData) => {
      const row = hookData.row.index;
      const boldRows = [8, 12, 18];
      if (boldRows.includes(row)) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [240, 240, 240];
      }
      if (row === 9 || row === 13) {
        hookData.cell.styles.minCellHeight = 4;
        hookData.cell.styles.fillColor = [255, 255, 255];
      }
    },
  });

  return doc.output('blob');
}

export function generateIncomeStatementPdfBlob(data) {
  const d = data || {};
  const rev = d.revenue || {};
  const cogs = d.cost_of_goods_sold || {};
  const opex = d.operating_expenses || {};
  const cats = opex.by_category || [];

  const doc = setupDoc('INCOME STATEMENT');
  let y = addHeader(doc, 'INCOME STATEMENT', `Period: ${d.period?.from || ''} to ${d.period?.to || ''}`);

  const body = [
    ['Gross Sales', `UGX ${fmt(rev.gross_sales)}`],
    ['Less: Discounts', `UGX ${fmt(rev.discounts_given)}`],
    ['Less: Refunds', `UGX ${fmt(rev.refunds)}`],
    ['Net Revenue', `UGX ${fmt(rev.net_revenue)}`],
    ['', ''],
    ['Opening Stock', `UGX ${fmt(cogs.opening_stock_value)}`],
    ['Add: Purchases', `UGX ${fmt(cogs.purchases_during_period)}`],
    ['Less: Closing Stock', `UGX ${fmt(cogs.closing_stock_value)}`],
    ['Cost of Goods Sold', `UGX ${fmt(cogs.cogs)}`],
    ['Gross Profit', `UGX ${fmt(d.gross_profit)}`],
    ['', ''],
    ...cats.map((c) => [c.category, `UGX ${fmt(c.amount)}`]),
    ['Total Operating Expenses', `UGX ${fmt(opex.total)}`],
    ['', ''],
    ['NET PROFIT / (LOSS)', `UGX ${fmt(d.net_profit)}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['', '']],
    body,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 50, halign: 'right' } },
    didParseCell: (hookData) => {
      const row = hookData.row.index;
      const boldRows = [3, 9, cats.length + 12, cats.length + 14];
      if (boldRows.includes(row)) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [240, 240, 240];
      }
      if (row === 4 || row === 10 || row === cats.length + 11 || row === cats.length + 13) {
        hookData.cell.styles.minCellHeight = 4;
        hookData.cell.styles.fillColor = [255, 255, 255];
      }
    },
  });

  return doc.output('blob');
}

export function generateCashFlowPdfBlob(data) {
  const d = data || {};
  const op = d.operating_activities || {};
  const fin = d.financing_activities || {};

  const doc = setupDoc('CASH FLOW');
  let y = addHeader(doc, 'STATEMENT OF CASH FLOWS', `Period: ${d.period?.from || ''} to ${d.period?.to || ''}`);

  const body = [
    ['Cash Received from Customers', `UGX ${fmt(op.cash_received_from_customers)}`],
    ['Cash Paid for Business Expenses', `UGX ${fmt(op.cash_paid_for_expenses)}`],
    ['Cash Paid for Stock Purchases', `UGX ${fmt(op.cash_paid_for_goods)}`],
    ['Net Cash from Operating Activities', `UGX ${fmt(op.net_operating_cash_flow)}`],
    ['', ''],
    ['Capital Injected by Owner', `UGX ${fmt(fin.capital_injected)}`],
    ['Owner Withdrawals', `UGX ${fmt(fin.owner_withdrawals)}`],
    ['Net Cash from Financing Activities', `UGX ${fmt(fin.net_financing_cash_flow)}`],
    ['', ''],
    ['NET CHANGE IN CASH', `UGX ${fmt(d.net_change_in_cash)}`],
    ['Opening Cash Balance', `UGX ${fmt(d.opening_cash_balance)}`],
    ['Closing Cash Balance', `UGX ${fmt(d.closing_cash_balance)}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['', '']],
    body,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 50, halign: 'right' } },
    didParseCell: (hookData) => {
      const row = hookData.row.index;
      const boldRows = [3, 7, 9, 11];
      if (boldRows.includes(row)) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [240, 240, 240];
      }
      if (row === 4 || row === 8) {
        hookData.cell.styles.minCellHeight = 4;
        hookData.cell.styles.fillColor = [255, 255, 255];
      }
    },
  });

  return doc.output('blob');
}

export function generateDashboardPdfBlob(data, fromDate, toDate) {
  const d = data || {};
  const doc = setupDoc('SUMMARY');
  let y = addHeader(doc, 'FINANCIAL SUMMARY', `Period: ${fromDate || ''} to ${toDate || ''}`);

  const body = [
    ['Net Revenue', `UGX ${fmt(d.revenue)}`],
    ['Net Profit', `UGX ${fmt(d.net_profit)}`],
    ['Total Expenses', `UGX ${fmt(d.expenses)}`],
    ['Outstanding Receivables', `UGX ${fmt(d.accounts_receivable)}`],
    ['Total Sales', `${fmt(d.total_sales)}`],
    ['Total Quotations', `${fmt(d.total_quotations)}`],
    ['Credit Sales', `${fmt(d.credit_sales)}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 50, halign: 'right' } },
  });

  return doc.output('blob');
}

export function generateQuotationPdfBlob(quote) {
  const q = quote || {};
  const doc = setupDoc('QUOTATION');
  let y = addHeader(doc, 'QUOTATION', `Date: ${q.created_at ? new Date(q.created_at).toLocaleDateString() : ''}`);

  doc.setFont('helvetica', 'bold');
  doc.text(`Quote: ${q.quote_number || ''}`, 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${(q.status || '').replace(/_/g, ' ').toUpperCase()}`, 14, y);
  y += 6;
  doc.text(`Valid Until: ${q.valid_until ? new Date(q.valid_until).toLocaleDateString() : ''}`, 14, y);
  y += 6;
  doc.text(`Customer: ${q.client?.full_name || 'Walk-in'}`, 14, y);
  y += 10;

  const items = (q.items || []).map((it, i) => [
    i + 1,
    it.product_name || '',
    fmt(it.quantity),
    `UGX ${fmt(it.unit_price)}`,
    `UGX ${fmt(it.line_total)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Item', 'Qty', 'Unit Price', 'Line Total']],
    body: items,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: UGX ${fmt(q.subtotal)}`, 140, y, { align: 'right' });
  y += 6;
  doc.text(`Discount: UGX ${fmt(q.discount_amount)}`, 140, y, { align: 'right' });
  y += 6;
  doc.text(`Tax: UGX ${fmt(q.tax_amount)}`, 140, y, { align: 'right' });
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: UGX ${fmt(q.total_amount)}`, 140, y, { align: 'right' });

  return doc.output('blob');
}
