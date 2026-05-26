import { useState } from 'react';
import {
  Settings,
  Database,
  RotateCcw,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  HardDrive,
  FileJson,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useParticipantStore } from '@/hooks/useParticipantStore';

export default function SettingsPage() {
  const { participants, stats, resetData } = useParticipantStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');

  const handleExportJSON = () => {
    const data = JSON.stringify(participants, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Data exported as JSON successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExportCSV = () => {
    const csv = [
      ['ID', 'Name', 'Phone', 'Email', 'Sex', 'Registered At'].join(','),
      ...participants.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.phone,
        `"${p.email}"`,
        p.sex,
        p.registeredAt,
      ].join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dsgb_participants_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Data exported as CSV successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = async () => {
    setResetting(true);
    await new Promise(r => setTimeout(r, 500));
    resetData();
    setResetting(false);
    setShowResetDialog(false);
    setMessage('Data reset to original records!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('dsgb_participants');
    localStorage.removeItem('dsgb_initialized');
    setShowClearDialog(false);
    setMessage('Local storage cleared! Refresh to reload.');
    setTimeout(() => setMessage(''), 3000);
  };

  const storageKB = (JSON.stringify(participants).length / 1024).toFixed(1);

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Page header */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Settings className="w-7 h-7 text-slate-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Settings</h2>
        <p className="text-slate-500 text-sm">Manage your data and application preferences.</p>
      </div>

      {/* Success banner */}
      {message && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-sm text-secondary font-semibold">{message}</p>
        </div>
      )}

      {/* Database Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
            <Database className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Database Info</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Total Records', value: stats.total.toLocaleString(), color: 'text-secondary' },
              { label: 'Storage Used', value: `${storageKB} KB`, color: 'text-blue-600' },
              { label: 'With Contact', value: stats.withPhone.toLocaleString(), color: 'text-violet-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <HardDrive className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Offline Storage Mode</p>
              <p className="text-xs text-blue-600 mt-0.5">All data is stored in your browser's localStorage. No internet required.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Download className="w-3.5 h-3.5 text-secondary" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Export Data</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-500 mb-4">
            Export all participant data for backup or external use.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportCSV}
              className="action-btn group"
            >
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Export as CSV</p>
                <p className="text-xs text-slate-400">Spreadsheet format</p>
              </div>
            </button>
            <button
              onClick={handleExportJSON}
              className="action-btn group"
            >
              <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                <FileJson className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Export as JSON</p>
                <p className="text-xs text-slate-400">Raw data backup</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2 bg-red-50/50">
          <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <h3 className="font-bold text-red-700 text-sm">Danger Zone</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div>
              <p className="text-sm font-bold text-slate-800">Reset to Original Data</p>
              <p className="text-xs text-slate-500 mt-0.5">Restore all original records from the spreadsheet</p>
            </div>
            <Button
              variant="outline"
              className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-100 rounded-xl shrink-0"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
            <div>
              <p className="text-sm font-bold text-red-800">Clear All Data</p>
              <p className="text-xs text-red-500 mt-0.5">Permanently remove all participants from storage</p>
            </div>
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-100 rounded-xl shrink-0"
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-500" />
              Reset Data
            </DialogTitle>
            <DialogDescription>
              This will restore all {stats.total.toLocaleString()} original participants. Any new registrations will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)} className="rounded-xl">Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2 rounded-xl" onClick={handleReset} disabled={resetting}>
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Clear All Data
            </DialogTitle>
            <DialogDescription>
              This will permanently remove all participant data from your browser's local storage. You'll need to refresh to reload original data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleClear} className="gap-2 rounded-xl">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
