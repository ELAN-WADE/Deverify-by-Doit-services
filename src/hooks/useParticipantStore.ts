import { useState, useEffect, useCallback } from 'react';

export interface Participant {
  id: number;
  name: string;
  phone: string;
  email: string;
  sex: string;
  registeredAt: string;
}

const STORAGE_KEY = 'dsgb_participants';
const INITIALIZED_KEY = 'dsgb_initialized';

function loadFromStorage(): Participant[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* empty */ }
  return null;
}

function saveToStorage(participants: Participant[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
  } catch { /* empty */ }
}

function generateId(participants: Participant[]): number {
  return participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
}

export function useParticipantStore() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');

  // Initialize data from localStorage or fetch from JSON
  useEffect(() => {
    const stored = loadFromStorage();
    const alreadyInit = localStorage.getItem(INITIALIZED_KEY);

    if (stored && alreadyInit) {
      setParticipants(stored);
      setInitialized(true);
    } else {
      // Fetch the embedded JSON file using the correct base path
      fetch(`${import.meta.env.BASE_URL}participants.json`)
        .then(res => res.json())
        .then((data: Participant[]) => {
          setParticipants(data);
          saveToStorage(data);
          localStorage.setItem(INITIALIZED_KEY, 'true');
          setInitialized(true);
        })
        .catch(() => {
          setParticipants([]);
          setInitialized(true);
        });
    }
  }, []);

  // Save to localStorage whenever participants change
  useEffect(() => {
    if (initialized) {
      saveToStorage(participants);
    }
  }, [participants, initialized]);

  const searchParticipants = useCallback((query: string): Participant[] => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase().trim();
    return participants.filter(p => {
      return (
        (p.email && p.email.toLowerCase().includes(lower)) ||
        (p.phone && p.phone.includes(lower))
      );
    });
  }, [participants]);

  const getParticipantById = useCallback((id: number): Participant | undefined => {
    return participants.find(p => p.id === id);
  }, [participants]);

  const addParticipant = useCallback((data: Omit<Participant, 'id' | 'registeredAt'>): Participant => {
    const newParticipant: Participant = {
      ...data,
      id: generateId(participants),
      registeredAt: new Date().toISOString(),
    };
    setParticipants(prev => [newParticipant, ...prev]);
    return newParticipant;
  }, [participants]);

  const updateParticipant = useCallback((id: number, updates: Partial<Omit<Participant, 'id'>>) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteParticipant = useCallback((id: number) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  const resetData = useCallback(() => {
    fetch(`${import.meta.env.BASE_URL}participants.json`)
      .then(res => res.json())
      .then((data: Participant[]) => {
        setParticipants(data);
        saveToStorage(data);
      });
  }, []);

  const filteredParticipants = searchQuery.trim()
    ? participants.filter(p => {
        const q = searchQuery.toLowerCase().trim();
        return (
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.phone && p.phone.includes(q))
        );
      })
    : participants;

  // Stats
  const stats = {
    total: participants.length,
    female: participants.filter(p => p.sex === 'F').length,
    male: participants.filter(p => p.sex === 'M').length,
    withPhone: participants.filter(p => p.phone && p.phone !== '0').length,
    withEmail: participants.filter(p => p.email && p.email.length > 3).length,
    recentRegistrations: [...participants]
      .sort((a, b) => b.id - a.id)
      .slice(0, 10),
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
    updateParticipant,
    deleteParticipant,
    resetData,
    stats,
  };
}
