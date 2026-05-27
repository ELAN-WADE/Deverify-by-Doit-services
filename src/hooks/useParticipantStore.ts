import { useState, useEffect, useCallback } from 'react';

export interface Participant {
  id: number;
  name: string;
  phone: string;
  email: string;
  sex: string;
  registeredAt: string;
}

export function useParticipantStore() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch('/api/participants');
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
        setInitialized(true);
      }
    } catch (e) {
      console.error('Failed to load participants:', e);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const searchParticipants = useCallback((query: string): Participant[] => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase().trim();
    return participants.filter(p => {
      return (
        p.name.toLowerCase().includes(lower) ||
        (p.email && p.email.toLowerCase().includes(lower)) ||
        (p.phone && p.phone.includes(lower))
      );
    });
  }, [participants]);

  const getParticipantById = useCallback((id: number): Participant | undefined => {
    return participants.find(p => p.id === id);
  }, [participants]);

  const addParticipant = useCallback((data: Omit<Participant, 'id' | 'registeredAt'>): Participant => {
    const newParticipant = {
      ...data,
      registeredAt: new Date().toISOString(),
    };
    
    // Optimistic update without ID first, then fetch exact ID
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', data: newParticipant })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.id) {
         setParticipants(prev => [{ ...newParticipant, id: resData.id } as Participant, ...prev]);
      } else {
         fetchParticipants();
      }
    });

    return { ...newParticipant, id: Date.now() } as Participant; // temporary ID
  }, [fetchParticipants]);

  const importParticipants = useCallback((imported: Omit<Participant, 'id'>[]) => {
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'import', data: imported })
    })
    .then(() => {
      fetchParticipants();
    });
  }, [fetchParticipants]);

  const updateParticipant = useCallback((id: number, updates: Partial<Omit<Participant, 'id'>>) => {
    const target = participants.find(p => p.id === id);
    if (!target) return;
    
    const updated = { ...target, ...updates };
    setParticipants(prev => prev.map(p => (p.id === id ? updated : p)));
    
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', data: updated })
    });
  }, [participants]);

  const deleteParticipant = useCallback((id: number) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', data: { id } })
    });
  }, []);

  const clearData = useCallback(() => {
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' })
    }).then(() => {
      fetchParticipants();
    });
  }, [fetchParticipants]);

  const resetData = useCallback(() => {
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' })
    }).then(() => {
      fetchParticipants();
    });
  }, [fetchParticipants]);

  const filteredParticipants = searchQuery.trim()
    ? participants.filter(p => {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.phone && p.phone.includes(q))
        );
      })
    : participants;

  // Stats
  const stats = {
    total: participants.length,
    female: participants.filter(p => p.sex && p.sex.toUpperCase().trim().startsWith('F')).length,
    male: participants.filter(p => p.sex && p.sex.toUpperCase().trim().startsWith('M')).length,
    withPhone: participants.filter(p => p.phone && p.phone !== '0').length,
    withEmail: participants.filter(p => p.email && p.email.length > 3).length,
    recentRegistrations: [...participants].slice(0, 10),
  };

  return {
    participants,
    filteredParticipants,
    initialized,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    searchParticipants,
    getParticipantById,
    addParticipant,
    importParticipants,
    updateParticipant,
    deleteParticipant,
    resetData,
    clearData,
    stats,
  };
}
