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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParticipantStore } from '@/hooks/useParticipantStore';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { participants, searchParticipants } = useParticipantStore();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [results, setResults] = useState<typeof participants>([]);
  const [searched, setSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedParticipant = participants.find(p => p.id === selectedId);

  // Check for ID in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedId(Number(id));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const res = searchParticipants(query, searchType);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button if viewing a participant */}
      {selectedParticipant && (
        <Button
          variant="ghost"
          className="gap-2 text-gray-600"
          onClick={() => setSelectedId(null)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </Button>
      )}

      {!selectedParticipant ? (
        <>
          {/* Search Section */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Participant Lookup</h2>
            <p className="text-gray-500 text-sm">
              Search for participants by email or phone number to verify training attendance.
            </p>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              {/* Search Type Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={searchType === 'email' ? 'default' : 'outline'}
                  onClick={() => { setSearchType('email'); setSearched(false); setResults([]); }}
                  className={searchType === 'email' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  size="sm"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  By Email
                </Button>
                <Button
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  onClick={() => { setSearchType('phone'); setSearched(false); setResults([]); }}
                  className={searchType === 'phone' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  By Phone
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={searchType === 'email' ? 'Enter email address...' : 'Enter phone number...'}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </Button>
                {searched && (
                  <Button variant="outline" onClick={clearSearch}>
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && (
            <div className="space-y-4">
              {results.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600">
                    Found <span className="font-semibold text-emerald-600">{results.length}</span> participant(s)
                  </p>
                  <div className="space-y-2">
                    {results.map(p => (
                      <Card
                        key={p.id}
                        className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedId(p.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                              <User className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                {p.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {p.phone}
                                  </span>
                                )}
                                {p.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {p.email}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Found
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No Results Found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      No participant matches &quot;{query}&quot; in the database.
                    </p>
                    <Button
                      onClick={() => { /* scroll to register or navigate */ }}
                      variant="outline"
                      className="gap-2"
                      onClickCapture={() => window.location.href = '/register'}
                    >
                      <AlertCircle className="w-4 h-4" />
                      Register as New Participant
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      ) : (
        /* Participant Detail View */
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
                <CheckCircle2 className="w-4 h-4" />
                Training Verified
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedParticipant.name}</h2>
              <p className="text-gray-500 mt-1">Participant ID: #{selectedParticipant.id}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedParticipant.phone || 'Not provided'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User className="w-4 h-4" />
                  Gender
                </div>
                <p className="font-semibold text-gray-900">
                  {selectedParticipant.sex === 'F' ? 'Female' : selectedParticipant.sex === 'M' ? 'Male' : 'Not specified'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="font-semibold text-gray-900 break-all">
                  {selectedParticipant.email || 'Not provided'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <GraduationCap className="w-4 h-4" />
                  Training Status
                </div>
                <p className="font-semibold text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Has completed training
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setSelectedId(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
