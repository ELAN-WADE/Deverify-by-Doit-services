import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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

const PAGE_SIZE = 50;

export default function ParticipantsPage() {
  const navigate = useNavigate();
  const { filteredParticipants, searchQuery, setSearchQuery, deleteParticipant } = useParticipantStore();
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const totalPages = Math.ceil(filteredParticipants.length / PAGE_SIZE);
  const paginated = filteredParticipants.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Phone', 'Email', 'Sex', 'Registered At'].join(','),
      ...filteredParticipants.map(p => [
        p.id,
        `"${p.name}"`,
        p.phone,
        `"${p.email}"`,
        p.sex,
        p.registeredAt,
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800">All Participants</h2>
            <p className="text-xs text-slate-400">{filteredParticipants.length.toLocaleString()} records found</p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 h-9 rounded-xl text-sm font-semibold border-slate-200">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Search & filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
            className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-10 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Participant</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, idx) => (
                <tr
                  key={p.id}
                  className="data-row"
                  onClick={() => navigate(`/search?id=${p.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{p.id}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-extrabold shadow-sm ${
                          idx % 4 === 0 ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' :
                          idx % 4 === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          idx % 4 === 2 ? 'bg-gradient-to-br from-violet-400 to-violet-600' :
                          'bg-gradient-to-br from-pink-400 to-rose-500'
                        }`}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 text-sm truncate max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-300" />
                      {p.phone || <span className="text-slate-300">—</span>}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {p.email ? (
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        <span className="truncate max-w-[200px]">{p.email}</span>
                      </span>
                    ) : <span className="text-slate-300 text-sm">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.sex === 'F' ? 'bg-pink-100 text-pink-700' :
                      p.sex === 'M' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {p.sex === 'F' ? 'Female' : p.sex === 'M' ? 'Male' : 'Other'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-8 w-8 p-0"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setDeleteId(p.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <AlertCircle className="w-9 h-9 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-500 text-sm">No participants found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Page <span className="font-bold text-slate-700">{page + 1}</span> of {totalPages} &nbsp;·&nbsp; {filteredParticipants.length.toLocaleString()} total
            </p>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="h-8 w-8 p-0 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="h-8 w-8 p-0 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Participant
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this participant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => {
                if (deleteId !== null) deleteParticipant(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
