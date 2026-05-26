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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    setMessage('Data exported successfully!');
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
    setMessage('CSV exported successfully!');
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Settings className="w-7 h-7 text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm">
          Manage your data and application settings.
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">{message}</p>
        </div>
      )}

      {/* Data Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            Database Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {(JSON.stringify(participants).length / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Storage Mode:</span> Local (IndexedDB/localStorage)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              All data is stored locally in your browser. No internet connection required.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Export all participant data for backup or external use.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export as CSV
            </Button>
            <Button onClick={handleExportJSON} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export as JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Reset to Original Data</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Restore the original {stats.total.toLocaleString()} records from the spreadsheet
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-between bg-red-50 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-red-700">Clear All Data</p>
              <p className="text-xs text-red-500 mt-0.5">
                Remove all participants from local storage
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-100"
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Data</DialogTitle>
            <DialogDescription>
              This will restore all {stats.total.toLocaleString()} original participants from the spreadsheet.
              Any newly registered participants will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 gap-2"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Clear All Data
            </DialogTitle>
            <DialogDescription>
              This will permanently remove all participant data from your browser&apos;s local storage.
              You will need to refresh the page to reload the original data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClear} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
