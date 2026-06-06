import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import {
  Search,
  Phone,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParticipantStore } from '@/hooks/useParticipantStore';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { participants, searchParticipants } = useParticipantStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof participants>([]);
  const [searched, setSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  const selectedParticipant = participants.find(p => p.id === selectedId);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const numId = Number(id);
      setSelectedId(isNaN(numId) ? id : numId);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const res = searchParticipants(query);
    setResults(res);
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setSelectedId(null);
  };

  // ─── Participant Detail View ───
  if (selectedParticipant) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header banner */}
          <div className="gradient-hero px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-secondary/30">
                <span className="text-white text-3xl font-extrabold">
                  {selectedParticipant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-secondary/20 border border-indigo-400/30 rounded-full px-3 py-1 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-400 text-xs font-semibold">Training Data-Exist</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">{selectedParticipant.name}</h2>
              <p className="text-slate-400 text-sm mt-1">Participant ID: #{selectedParticipant.id}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
                <Phone className="w-3.5 h-3.5" />
                Phone Number
              </div>
              <p className="font-bold text-slate-800 text-base">{selectedParticipant.phone || 'Not provided'}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
                <User className="w-3.5 h-3.5" />
                Gender
              </div>
              <p className="font-bold text-slate-800 text-base">
                {selectedParticipant.sex === 'F' ? 'Female' : selectedParticipant.sex === 'M' ? 'Male' : 'Not specified'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 sm:col-span-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </div>
              <p className="font-bold text-slate-800 text-base break-all">{selectedParticipant.email || 'Not provided'}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 sm:col-span-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
                <MapPin className="w-3.5 h-3.5" />
                School / Location
              </div>
              <p className="font-bold text-slate-800 text-base break-all">{selectedParticipant.school || 'Not provided'}</p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 sm:col-span-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Training Status
              </div>
              <p className="font-bold text-secondary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Completed Training — Data-Exist ✓
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 flex justify-center">
            <Button variant="outline" onClick={() => setSelectedId(null)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Search View ───
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Search className="w-7 h-7 text-secondary" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Participant Lookup</h2>
        <p className="text-slate-500 text-sm">
          Search for participants by email or phone number to verify training attendance.
        </p>
      </div>

      {/* Search card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">


        {/* Input row */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search by name, email, or phone number..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-xl"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-secondary hover:bg-indigo-700 text-white h-11 px-5 rounded-xl gap-2 font-semibold shadow-md shadow-secondary/20"
          >
            <Search className="w-4 h-4" />
            Search
          </Button>
          {searched && (
            <Button variant="outline" onClick={clearSearch} className="h-11 rounded-xl">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          {results.length > 0 ? (
            <>
              <p className="text-sm text-slate-500 font-medium">
                Found <span className="font-bold text-secondary">{results.length}</span> participant(s)
              </p>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {results.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white text-base font-extrabold">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-0.5">
                        {p.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />{p.phone}
                          </span>
                        )}
                        {p.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />{p.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="badge-success shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Data-Exist
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">No Results Found</h3>
              <p className="text-sm text-slate-400 mb-5">
                No participant matches "{query}" in the database.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.location.href = '/register'}
              >
                <AlertCircle className="w-4 h-4" />
                Register as New Participant
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
