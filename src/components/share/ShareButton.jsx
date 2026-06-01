import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  Printer,
  Download,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Smartphone,
  X,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  openWhatsApp,
  openEmail,
  copyToClipboard,
  nativeShare,
  canNativeShare,
  downloadBlob,
  shareFile,
} from '../../utils/shareUtils';

export function ShareButton({
  title = 'Document',
  shareText = '',
  onPrint,
  onDownload,
  generatePdf,
  pdfFileName,
  whatsappNumber,
  variant = 'outline', // 'outline' | 'primary' | 'icon'
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfSharing, setPdfSharing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNativeShare = async () => {
    const ok = await nativeShare({ title, text: shareText });
    if (ok) setOpen(false);
  };

  const handleWhatsApp = () => {
    openWhatsApp({ text: shareText, phone: whatsappNumber });
    setOpen(false);
  };

  const handleEmail = () => {
    openEmail({ subject: title, body: shareText });
    setOpen(false);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    setOpen(false);
  };

  const handleDownload = () => {
    if (onDownload) onDownload();
    setOpen(false);
  };

  const handleSharePdf = async () => {
    if (!generatePdf) return;
    setPdfSharing(true);
    try {
      const blob = await generatePdf();
      const filename = pdfFileName || `${title.replace(/\s+/g, '_')}.pdf`;
      const shared = await shareFile(blob, filename, title);
      if (!shared) {
        downloadBlob(blob, filename);
        toast.success('PDF downloaded. Attach it in WhatsApp to share.');
      }
      setOpen(false);
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setPdfSharing(false);
    }
  };

  const hasNative = canNativeShare();

  const btnClasses =
    variant === 'primary'
      ? 'w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm'
      : variant === 'icon'
      ? 'w-full p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
      : 'w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm';

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button onClick={() => setOpen(!open)} className={btnClasses}>
        <Share2 className="w-4 h-4" />
        {variant !== 'icon' && <span>Share</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-xl shadow-2xl overflow-hidden isolate z-[100]"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Share</span>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            <div className="p-1.5 space-y-0.5">
              {hasNative && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
                >
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span>Share via Device</span>
                </button>
              )}

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp (Text)</span>
              </button>

              {generatePdf && (
                <button
                  onClick={handleSharePdf}
                  disabled={pdfSharing}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{pdfSharing ? 'Generating...' : 'WhatsApp (PDF)'}</span>
                </button>
              )}

              <button
                onClick={handleEmail}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
              >
                <Mail className="w-4 h-4 text-orange-500" />
                <span>Email</span>
              </button>

              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-muted-foreground" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              {onPrint && (
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
                >
                  <Printer className="w-4 h-4 text-muted-foreground" />
                  <span>Print</span>
                </button>
              )}

              {onDownload && (
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-foreground"
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
