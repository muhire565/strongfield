import { create } from 'zustand';

function today() {
  return new Date().toISOString().split('T')[0];
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

function endOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
}

export const useReportStore = create((set) => ({
  fromDate: startOfMonth(),
  toDate: endOfMonth(),
  activeTab: 'dashboard',
  setPeriod: (fromDate, toDate) => set({ fromDate, toDate }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  applyPreset: (preset) => {
    const now = new Date();
    let from, to;
    switch (preset) {
      case 'today':
        from = to = today(); break;
      case 'yesterday': {
        const y = new Date(now); y.setDate(y.getDate() - 1);
        from = to = y.toISOString().split('T')[0]; break;
      }
      case 'this_week': {
        const d = new Date(now);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        from = new Date(d.setDate(diff)).toISOString().split('T')[0];
        to = today(); break;
      }
      case 'last_week': {
        const d = new Date(now);
        const day = d.getDay();
        const diff = d.getDate() - day - 6;
        from = new Date(d.setDate(diff)).toISOString().split('T')[0];
        const d2 = new Date(now);
        const day2 = d2.getDay();
        const diff2 = d2.getDate() - day2;
        to = new Date(d2.setDate(diff2)).toISOString().split('T')[0]; break;
      }
      case 'this_month':
        from = startOfMonth(); to = endOfMonth(); break;
      case 'last_month': {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        from = d.toISOString().split('T')[0];
        to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      }
      case 'this_quarter': {
        const q = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0];
        to = endOfMonth(); break;
      }
      case 'last_quarter': {
        const q = Math.floor(now.getMonth() / 3) - 1;
        const y = q < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const aq = q < 0 ? 3 : q;
        from = new Date(y, aq * 3, 1).toISOString().split('T')[0];
        to = new Date(y, aq * 3 + 3, 0).toISOString().split('T')[0];
        break;
      }
      case 'this_year':
        from = `${now.getFullYear()}-01-01`; to = today(); break;
      case 'last_year':
        from = `${now.getFullYear() - 1}-01-01`; to = `${now.getFullYear() - 1}-12-31`; break;
      default:
        from = startOfMonth(); to = endOfMonth();
    }
    set({ fromDate: from, toDate: to });
  },
}));
