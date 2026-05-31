import { format } from 'date-fns';

const formatCurrency = (val) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(val);

export const printInvoice = (sale, branchName = 'HIGHWAY') => {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${sale.sale_number}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .brand h1 { margin: 0; font-size: 28px; color: #000; }
        .brand p { margin: 5px 0 0; color: #666; font-size: 14px; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 24px; color: #555; text-transform: uppercase; }
        .invoice-details p { margin: 5px 0 0; font-size: 14px; }
        .client-info { margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px; }
        .client-info h3 { margin: 0 0 10px; font-size: 14px; color: #777; text-transform: uppercase; }
        .client-info p { margin: 0; font-weight: bold; font-size: 16px; }
        table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; padding: 12px; background: #f4f4f5; border-bottom: 2px solid #ddd; font-size: 14px; color: #555; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .text-right { text-align: right; }
        .totals { width: 300px; margin-left: auto; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .totals-row.grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #ddd; padding-top: 12px; margin-top: 12px; color: #000; }
        .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <h1>Strongfield Electrical</h1>
          <p>${branchName} Branch</p>
          <p>Email: contact@strongfield.co.ug</p>
          <p>Tel: +256 700 000 000</p>
        </div>
        <div class="invoice-details">
          <h2>INVOICE</h2>
          <p><strong># ${sale.sale_number}</strong></p>
          <p>Date: ${format(new Date(sale.created_at), 'dd MMM yyyy')}</p>
          <p>Status: <strong>${sale.status.replace('_', ' ').toUpperCase()}</strong></p>
        </div>
      </div>

      <div class="client-info">
        <h3>Billed To</h3>
        <p>${sale.client?.full_name || 'Walk-in Customer'}</p>
        ${sale.client?.phone ? `<p style="font-weight: normal; margin-top: 5px;">${sale.client.phone}</p>` : ''}
        ${sale.client?.address ? `<p style="font-weight: normal; margin-top: 5px;">${sale.client.address}</p>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>
                <strong>${item.product_name}</strong><br/>
                <span style="color:#777; font-size:12px;">${item.brand} - ${item.model}</span>
              </td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unit_price)}</td>
              <td class="text-right">${formatCurrency(item.line_total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formatCurrency(sale.subtotal)}</span>
        </div>
        ${sale.discount_amount > 0 ? `
          <div class="totals-row">
            <span>Discount</span>
            <span>-${formatCurrency(sale.discount_amount)}</span>
          </div>
        ` : ''}
        <div class="totals-row grand-total">
          <span>Total Amount</span>
          <span>${formatCurrency(sale.total_amount)}</span>
        </div>
        <div class="totals-row" style="color: #16a34a; margin-top: 10px;">
          <span>Amount Paid</span>
          <span>${formatCurrency(sale.amount_paid)}</span>
        </div>
        <div class="totals-row" style="color: ${sale.balance_due > 0 ? '#dc2626' : '#555'}; font-weight: bold;">
          <span>Balance Due</span>
          <span>${formatCurrency(sale.balance_due)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Goods sold are not returnable unless agreed upon in writing.</p>
        <p style="margin-top:20px;"><button onclick="window.print()" style="padding: 10px 20px; background:#000; color:#fff; border:none; border-radius:5px; cursor:pointer;">Print Invoice</button></p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const printQuotation = (quote, branchName = 'HIGHWAY') => {
  const printWindow = window.open('', '_blank');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation ${quote.quote_number}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .brand h1 { margin: 0; font-size: 28px; color: #000; }
        .brand p { margin: 5px 0 0; color: #666; font-size: 14px; }
        .quote-details { text-align: right; }
        .quote-details h2 { margin: 0; font-size: 24px; color: #555; text-transform: uppercase; }
        .quote-details p { margin: 5px 0 0; font-size: 14px; }
        .client-info { margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px; }
        .client-info h3 { margin: 0 0 10px; font-size: 14px; color: #777; text-transform: uppercase; }
        .client-info p { margin: 0; font-weight: bold; font-size: 16px; }
        table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; padding: 12px; background: #f4f4f5; border-bottom: 2px solid #ddd; font-size: 14px; color: #555; text-transform: uppercase; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .text-right { text-align: right; }
        .totals { width: 300px; margin-left: auto; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .totals-row.grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #ddd; padding-top: 12px; margin-top: 12px; color: #000; }
        .valid-until { background: #fffbeb; border: 1px solid #f59e0b; padding: 10px 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #92400e; }
        .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <h1>Strongfield Electrical</h1>
          <p>${branchName} Branch</p>
          <p>Email: contact@strongfield.co.ug</p>
          <p>Tel: +256 700 000 000</p>
        </div>
        <div class="quote-details">
          <h2>QUOTATION</h2>
          <p><strong># ${quote.quote_number}</strong></p>
          <p>Date: ${format(new Date(quote.created_at), 'dd MMM yyyy')}</p>
          <p>Status: <strong>${quote.status.replace('_', ' ').toUpperCase()}</strong></p>
        </div>
      </div>

      <div class="valid-until">
        <strong>Valid Until:</strong> ${quote.valid_until ? format(new Date(quote.valid_until), 'dd MMM yyyy') : 'No expiry set'}
      </div>

      <div class="client-info">
        <h3>Prepared For</h3>
        <p>${quote.client?.full_name || quote.client_name_snapshot || 'Walk-in Customer'}</p>
        ${quote.client?.phone ? `<p style="font-weight: normal; margin-top: 5px;">${quote.client.phone}</p>` : ''}
        ${quote.client?.address ? `<p style="font-weight: normal; margin-top: 5px;">${quote.client.address}</p>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${(quote.items || []).map(item => `
            <tr>
              <td>
                <strong>${item.product_name}</strong><br/>
                <span style="color:#777; font-size:12px;">${item.brand} - ${item.model}</span>
              </td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unit_price)}</td>
              <td class="text-right">${formatCurrency(item.line_total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formatCurrency(quote.subtotal)}</span>
        </div>
        ${quote.discount_amount > 0 ? `
          <div class="totals-row">
            <span>Discount</span>
            <span>-${formatCurrency(quote.discount_amount)}</span>
          </div>
        ` : ''}
        <div class="totals-row grand-total">
          <span>Total Amount</span>
          <span>${formatCurrency(quote.total_amount)}</span>
        </div>
      </div>

      <div class="footer">
        <p>This quotation is not a tax invoice. Prices are subject to stock availability.</p>
        <p>Goods sold are not returnable unless agreed upon in writing.</p>
        <p style="margin-top:20px;"><button onclick="window.print()" style="padding: 10px 20px; background:#000; color:#fff; border:none; border-radius:5px; cursor:pointer;">Print Quotation</button></p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
