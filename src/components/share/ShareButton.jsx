import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

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
    <>
      <button onClick={() => setOpen(true)} className={`${btnClasses} ${className}`}>
        <Share2 className="w-4 h-4" />
        {variant !== 'icon' && <span>Share</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Share</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">{title}</p>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-muted rounded-full transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-3 grid grid-cols-3 gap-2">
                {hasNative && (
                  <button
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent transition-colors text-sm text-foreground"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs">Device</span>
                  </button>
                )}

                <button
                  onClick={handleWhatsApp}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent transition-colors text-sm text-foreground"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-xs">WhatsApp</span>
                </button>

                {generatePdf && (
                  <button
                    onClick={handleSharePdf}
                    disabled={pdfSharing}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent transition-colors text-sm text-foreground disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-xs">{pdfSharing ? '...' : 'PDF'}</span>
                  </button>
                )}

                <button
                  onClick={handleEmail}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent transition-colors text-sm text-foreground"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-xs">Email</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent transition-colors text-sm text-foreground"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {onPrint && (
                  <button
                    onClick={handlePrint}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent transition-colors text-sm text-foreground"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Printer className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs">Print</span>
                  </button>
                )}

                {onDownload && (
                  <button
                    onClick={handleDownload}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent transition-colors text-sm text-foreground"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Download className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs">Download</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
