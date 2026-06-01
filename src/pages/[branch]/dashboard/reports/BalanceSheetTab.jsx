import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBalanceSheet } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';
import { printBalanceSheetReport } from '../../../../utils/reportPdfGenerator';
import { generateBalanceSheetPdfBlob } from '../../../../utils/pdfBlobGenerator';
import { ShareButton } from '../../../../components/share/ShareButton';
import { buildBalanceSheetSummary } from '../../../../utils/shareUtils';

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, indent = false, isTotal = false, isSubtotal = false }) {
  return (
    <div className={`flex justify-between py-1.5 ${isTotal ? 'border-t border-border font-bold text-foreground' : ''} ${isSubtotal ? 'border-t border-border font-semibold' : ''}`}>
      <span className={indent ? 'pl-5 text-muted-foreground' : ''}>{label}</span>
      <span className="text-right">{typeof value === 'number' ? `USh ${formatUGX(value)}` : value}</span>
    </div>
  );
}

export default function BalanceSheetTab() {
  const { toDate } = useReportStore();
  const { data, isLoading } = useBalanceSheet(toDate);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(15)].map((_, i) => <div key={i} className="h-7 bg-muted rounded animate-pulse" />)}</div>;
  }

  const d = data || {};
  const assets = d.assets || {};
  const ca = assets.current_assets || {};
  const cash = ca.cash_and_equivalents || {};
  const liab = d.liabilities || {};
  const cl = liab.current_liabilities || {};
  const equity = d.equity || {};

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">BALANCE SHEET</h2>
        <p className="text-sm text-muted-foreground">As at: {d.as_at}</p>
      </div>

      {!d.balanced && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-3 rounded-lg text-sm font-medium">
          <AlertTriangle className="w-5 h-5" />
          Balance sheet discrepancy detected. Total Assets ≠ Liabilities + Equity.
        </div>
      )}
      {d.balanced && (
        <div className="mb-4 flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" /> Balance Sheet is BALANCED
        </div>
      )}

      <Section title="Assets">
        <Row label="Cash on Hand" value={cash.cash} indent />
        <Row label="MTN Mobile Money" value={cash.mtn_mobile_money} indent />
        <Row label="Airtel Money" value={cash.airtel_money} indent />
        <Row label="Bank Transfer" value={cash.bank_transfer} indent />
        <Row label="Total Cash & Equivalents" value={cash.total} isSubtotal />
        <Row label="Accounts Receivable" value={ca.accounts_receivable} indent />
        <Row label="Inventory at Cost" value={ca.inventory_value} indent />
        <Row label="Total Current Assets" value={ca.total_current_assets} isSubtotal />
        <Row label="TOTAL ASSETS" value={assets.total_assets} isTotal />
      </Section>

      <Section title="Liabilities">
        <Row label="Accounts Payable" value={cl.accounts_payable} indent />
        <Row label="Total Current Liabilities" value={cl.total_current_liabilities} isSubtotal />
        <Row label="TOTAL LIABILITIES" value={liab.total_liabilities} isTotal />
      </Section>

      <Section title="Owner's Equity">
        <Row label="Capital Injected" value={equity.owner_capital_injected} indent />
        <Row label="Retained Earnings" value={equity.retained_earnings} indent />
        <Row label="Less: Owner Drawings" value={equity.owner_drawings} indent />
        <Row label="Net Owner's Equity" value={equity.net_equity} isSubtotal />
        <Row label="TOTAL LIABILITIES + EQUITY" value={d.liabilities_plus_equity} isTotal />
      </Section>

      <div className="flex justify-end mt-6 gap-2">
        <button onClick={() => printBalanceSheetReport(d)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          Download PDF
        </button>
        <ShareButton
          title={`Balance Sheet — ${d.as_at}`}
          shareText={buildBalanceSheetSummary(d)}
          onPrint={() => printBalanceSheetReport(d)}
          onDownload={() => printBalanceSheetReport(d)}
          generatePdf={() => generateBalanceSheetPdfBlob(d)}
          pdfFileName={`Balance_Sheet_${d.as_at}.pdf`}
        />
      </div>
    </div>
  );
}
