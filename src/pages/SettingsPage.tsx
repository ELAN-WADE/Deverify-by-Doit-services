import { useState, useRef } from 'react';
import {
  Settings,
  Database,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  HardDrive,
  FileJson,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useParticipantStore, type Participant } from '@/hooks/useParticipantStore';

export default function SettingsPage() {
  const { participants, stats, resetData, clearData, importParticipants } = useParticipantStore();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResetDialogClose = (open: boolean) => {
    setShowResetDialog(open);
    if (!open) setConfirmText('');
  };

  const handleClearDialogClose = (open: boolean) => {
    setShowClearDialog(open);
    if (!open) setConfirmText('');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
         setMessage('CSV file is empty or missing headers');
         return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      
      const imported: Omit<Participant, 'id'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const p: any = {};
        
        headers.forEach((h, index) => {
          let val = (values[index] || '').trim();
          if (val.startsWith('"') && val.endsWith('"')) {
             val = val.substring(1, val.length - 1).replace(/""/g, '"');
          }
          if (h.includes('name')) p.name = val;
          if (h.includes('phone')) p.phone = val;
          if (h.includes('email')) p.email = val;
          if (h.includes('sex') || h.includes('gender')) p.sex = val;
          if (h.includes('registered')) p.registeredAt = val;
        });
        
        if (p.name) {
           // Basic sanitization
           const cleanName = String(p.name).replace(/[<>]/g, '').trim();
           const cleanPhone = String(p.phone || '').replace(/[^\d+()\s-]/g, '').trim();
           const cleanEmail = String(p.email || '').toLowerCase().trim();
           let cleanSex = String(p.sex || 'M').toUpperCase().trim().charAt(0);
           if (cleanSex !== 'M' && cleanSex !== 'F') cleanSex = 'M';

           if (cleanName.length > 0) {
             imported.push({
               name: cleanName,
               phone: cleanPhone,
               email: cleanEmail,
               sex: cleanSex,
               registeredAt: p.registeredAt || new Date().toISOString()
             });
           }
        }
      }
      
      if (imported.length > 0) {
         importParticipants(imported);
         setMessage(`Successfully imported ${imported.length} participants!`);
         setTimeout(() => setMessage(''), 3000);
      } else {
         setMessage('No valid participants found in CSV.');
         setTimeout(() => setMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
       fileInputRef.current.value = '';
    }
  };

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
    handleResetDialogClose(false);
    setMessage('Data reset to original records!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClear = async () => {
    setResetting(true);
    await new Promise(r => setTimeout(r, 500));
    clearData();
    setResetting(false);
    handleClearDialogClose(false);
    setMessage('Database cleared successfully!');
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
              <p className="text-sm font-semibold text-blue-800">Persistent SQLite Database</p>
              <p className="text-xs text-blue-600 mt-0.5">All data is permanently stored in a local SQLite file (`participants.db`). Syncs locally when offline.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import & Export Data */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Download className="w-3.5 h-3.5 text-secondary" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Import & Export Data</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-500 mb-4">
            Import participants from a CSV file, or export all data for backup.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImportCSV} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="action-btn group"
            >
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Import CSV</p>
                <p className="text-xs text-slate-400">Add from spreadsheet</p>
              </div>
            </button>
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
      <Dialog open={showResetDialog} onOpenChange={handleResetDialogClose}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-500" />
              Reset Data
            </DialogTitle>
            <DialogDescription>
              This will restore all {stats.total.toLocaleString()} original participants. Any new registrations will be lost.
              
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm font-semibold text-orange-800 mb-2">Type "RESET" below to confirm:</p>
                <Input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="RESET"
                  className="bg-white border-orange-200 focus-visible:ring-orange-400"
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleResetDialogClose(false)} className="rounded-xl">Cancel</Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 gap-2 rounded-xl" 
              onClick={handleReset} 
              disabled={resetting || confirmText !== 'RESET'}
            >
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Dialog */}
      <Dialog open={showClearDialog} onOpenChange={handleClearDialogClose}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Clear All Data
            </DialogTitle>
            <DialogDescription>
              This will permanently remove all participant data from your SQLite database. This action cannot be undone.
              
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm font-semibold text-red-800 mb-2">Type "DELETE" below to confirm:</p>
                <Input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="bg-white border-red-200 focus-visible:ring-red-400"
                />
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleClearDialogClose(false)} className="rounded-xl">Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleClear} 
              className="gap-2 rounded-xl"
              disabled={resetting || confirmText !== 'DELETE'}
            >
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
