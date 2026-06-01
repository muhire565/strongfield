import { format } from 'date-fns';

const formatCurrency = (val) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(val);

export const printInvoice = (sale, branchName = 'HIGHWAY') => {
  const printWindow = window.open('', '_blank');

  const displayBranch = branchName === 'HIGHWAY' ? 'High Way' : 'Main';
  const displayName = `StrongField ${displayBranch}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${sale.sale_number}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 30px 40px; color: #1f2937; line-height: 1.5; font-size: 13px; }
        .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .brand { display: flex; align-items: flex-start; gap: 12px; }
        .brand img { width: 56px; height: 56px; object-fit: contain; }
        .brand-info h2 { margin: 0; font-size: 15px; font-weight: 700; color: #1f2937; }
        .brand-info p { margin: 2px 0; font-size: 11px; color: #4b5563; line-height: 1.4; }
        .doc-title { text-align: right; }
        .doc-title h1 { margin: 0; font-size: 26px; font-weight: 800; color: #1f2937; letter-spacing: 1px; }
        .doc-title .num { margin-top: 4px; font-size: 13px; font-weight: 600; color: #374151; }
        .doc-title .bal-label { margin-top: 2px; font-size: 11px; color: #6b7280; }
        .doc-title .bal { font-size: 14px; font-weight: 700; color: #1f2937; }

        .divider { height: 2px; background: #3b82f6; margin: 12px 0 20px; }

        .meta { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 24px; }
        .meta-col { text-align: right; }
        .meta-col .label { font-size: 11px; color: #6b7280; font-weight: 500; }
        .meta-col .value { font-size: 13px; font-weight: 600; color: #1f2937; margin-top: 2px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead tr { background: #1e293b; }
        th { color: #fff; font-size: 12px; font-weight: 600; padding: 10px 12px; text-align: left; border: 1px solid #1e293b; }
        th:last-child, th:nth-child(3) { text-align: right; }
        td { padding: 10px 12px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151; }
        td:first-child { border-left: 1px solid #e5e7eb; }
        td:last-child, td:nth-child(3) { text-align: right; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        tbody tr:last-child td { border-bottom: 1px solid #9ca3af; }

        .totals { width: 320px; margin-left: auto; margin-bottom: 30px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #374151; }
        .totals-row.bold { font-weight: 700; color: #1f2937; }
        .totals-row.due { font-weight: 700; color: #1f2937; border-top: 1px solid #d1d5db; padding-top: 8px; margin-top: 4px; }
        .totals-row.paid { color: #b91c1c; }

        .footer { margin-top: 40px; font-size: 10px; color: #6b7280; line-height: 1.5; }
        .footer p { margin: 1px 0; }

        @media print {
          body { padding: 20px 30px; }
          button { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="top">
        <div class="brand">
          <img src="/logo.png" alt="Logo" />
          <div class="brand-info">
            <h2>${displayName}</h2>
            <p>TIN No: 1015192270</p>
            <p>Plot 46 Lubaas Road</p>
            <p>Nge Estate 0026E, Uganda</p>
            <p>mapeetersimon@yahoo.com</p>
          </div>
        </div>
        <div class="doc-title">
          <h1>INVOICE</h1>
          <div class="num"># ${sale.sale_number}</div>
          <div class="bal-label">Balance Due</div>
          <div class="bal">${formatCurrency(sale.balance_due)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="meta">
        <div class="meta-col">
          <div class="label">Invoice Date</div>
          <div class="value">${format(new Date(sale.created_at), 'dd MMM yyyy')}</div>
        </div>
        <div class="meta-col">
          <div class="label">Terms</div>
          <div class="value">Due upon receipt</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Qty</th>
            <th>Particulars</th>
            <th style="width: 20%;">Rate</th>
            <th style="width: 20%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>${item.quantity}</td>
              <td>${item.product_name}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>${formatCurrency(item.line_total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Sub Total</span>
          <span>${formatCurrency(sale.subtotal)}</span>
        </div>
        ${sale.discount_amount > 0 ? `
        <div class="totals-row">
          <span>Discount</span>
          <span>-${formatCurrency(sale.discount_amount)}</span>
        </div>
        ` : ''}
        <div class="totals-row bold">
          <span>Total</span>
          <span>${formatCurrency(sale.total_amount)}</span>
        </div>
        <div class="totals-row paid">
          <span>Payment Made</span>
          <span>(-) ${formatCurrency(sale.amount_paid)}</span>
        </div>
        <div class="totals-row due">
          <span>Balance Due</span>
          <span>${formatCurrency(sale.balance_due)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Payment terms: Payment is due upon receipt unless otherwise specified.</p>
        <p>Contact: mapeetersimon@yahoo.com</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const printQuotation = (quote, branchName = 'HIGHWAY') => {
  const printWindow = window.open('', '_blank');

  const displayBranch = branchName === 'HIGHWAY' ? 'High Way' : 'Main';
  const displayName = `StrongField ${displayBranch}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation ${quote.quote_number}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 30px 40px; color: #1f2937; line-height: 1.5; font-size: 13px; }
        .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .brand { display: flex; align-items: flex-start; gap: 12px; }
        .brand img { width: 56px; height: 56px; object-fit: contain; }
        .brand-info h2 { margin: 0; font-size: 15px; font-weight: 700; color: #1f2937; }
        .brand-info p { margin: 2px 0; font-size: 11px; color: #4b5563; line-height: 1.4; }
        .doc-title { text-align: right; }
        .doc-title h1 { margin: 0; font-size: 26px; font-weight: 800; color: #1f2937; letter-spacing: 1px; }
        .doc-title .num { margin-top: 4px; font-size: 13px; font-weight: 600; color: #374151; }
        .doc-title .bal-label { margin-top: 2px; font-size: 11px; color: #6b7280; }
        .doc-title .bal { font-size: 14px; font-weight: 700; color: #1f2937; }

        .divider { height: 2px; background: #3b82f6; margin: 12px 0 20px; }

        .meta { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 24px; }
        .meta-col { text-align: right; }
        .meta-col .label { font-size: 11px; color: #6b7280; font-weight: 500; }
        .meta-col .value { font-size: 13px; font-weight: 600; color: #1f2937; margin-top: 2px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead tr { background: #1e293b; }
        th { color: #fff; font-size: 12px; font-weight: 600; padding: 10px 12px; text-align: left; border: 1px solid #1e293b; }
        th:last-child, th:nth-child(3) { text-align: right; }
        td { padding: 10px 12px; border: 1px solid #e5e7eb; font-size: 12px; color: #374151; }
        td:first-child { border-left: 1px solid #e5e7eb; }
        td:last-child, td:nth-child(3) { text-align: right; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        tbody tr:last-child td { border-bottom: 1px solid #9ca3af; }

        .totals { width: 320px; margin-left: auto; margin-bottom: 30px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #374151; }
        .totals-row.bold { font-weight: 700; color: #1f2937; }
        .totals-row.due { font-weight: 700; color: #1f2937; border-top: 1px solid #d1d5db; padding-top: 8px; margin-top: 4px; }

        .footer { margin-top: 40px; font-size: 10px; color: #6b7280; line-height: 1.5; }
        .footer p { margin: 1px 0; }

        @media print {
          body { padding: 20px 30px; }
          button { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="top">
        <div class="brand">
          <img src="/logo.png" alt="Logo" />
          <div class="brand-info">
            <h2>${displayName}</h2>
            <p>TIN No: 1015192270</p>
            <p>Plot 46 Lubaas Road</p>
            <p>Nge Estate 0026E, Uganda</p>
            <p>mapeetersimon@yahoo.com</p>
          </div>
        </div>
        <div class="doc-title">
          <h1>QUOTATION</h1>
          <div class="num"># ${quote.quote_number}</div>
          <div class="bal-label">Total Amount</div>
          <div class="bal">${formatCurrency(quote.total_amount)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="meta">
        <div class="meta-col">
          <div class="label">Quote Date</div>
          <div class="value">${format(new Date(quote.created_at), 'dd MMM yyyy')}</div>
        </div>
        <div class="meta-col">
          <div class="label">Valid Until</div>
          <div class="value">${quote.valid_until ? format(new Date(quote.valid_until), 'dd MMM yyyy') : 'No expiry set'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Qty</th>
            <th>Particulars</th>
            <th style="width: 20%;">Rate</th>
            <th style="width: 20%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(quote.items || []).map(item => `
            <tr>
              <td>${item.quantity}</td>
              <td>${item.product_name}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>${formatCurrency(item.line_total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Sub Total</span>
          <span>${formatCurrency(quote.subtotal)}</span>
        </div>
        ${quote.discount_amount > 0 ? `
        <div class="totals-row">
          <span>Discount</span>
          <span>-${formatCurrency(quote.discount_amount)}</span>
        </div>
        ` : ''}
        <div class="totals-row bold due">
          <span>Total</span>
          <span>${formatCurrency(quote.total_amount)}</span>
        </div>
      </div>

      <div class="footer">
        <p>This quotation is not a tax invoice. Prices are subject to stock availability.</p>
        <p>Goods sold are not returnable unless agreed upon in writing.</p>
        <p>Contact: mapeetersimon@yahoo.com</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
