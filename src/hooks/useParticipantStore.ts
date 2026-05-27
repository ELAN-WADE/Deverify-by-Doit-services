import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Participant {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  sex: string;
  registeredAt: string;
}

interface OfflineAction {
  id: string;
  type: 'add' | 'update' | 'delete' | 'import' | 'clear' | 'reset';
  payload: any;
  timestamp: number;
}

export function useParticipantStore() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // 1. Initial Load from Local Cache (Offline First)
  useEffect(() => {
    const cached = localStorage.getItem('participant_cache');
    if (cached) {
      try { setParticipants(JSON.parse(cached)); } catch(e){}
    }
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    setOfflineQueueCount(queue.length);
  }, []);

  const saveCache = (data: Participant[]) => {
    localStorage.setItem('participant_cache', JSON.stringify(data));
    setParticipants(data);
  };

  const enqueueAction = (action: OfflineAction) => {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    queue.push(action);
    localStorage.setItem('offline_queue', JSON.stringify(queue));
    setOfflineQueueCount(queue.length);
    toast.error('You are offline. Saved to device and will sync later.', { id: 'offline-toast' });
  };

  // 2. Fetch from Live Database
  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch('/api/participants');
      if (res.ok) {
        const data = await res.json();
        saveCache(data); // update cache
        setInitialized(true);
      }
    } catch (e) {
      console.warn('Offline mode: Using cached data.');
      setInitialized(true);
    }
  }, []);

  // 3. Process Offline Queue
  const syncQueue = useCallback(async () => {
    if (isSyncing) return;
    const queue: OfflineAction[] = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    if (queue.length === 0) return;
    if (!navigator.onLine) return; // Don't try if still offline

    setIsSyncing(true);
    let successCount = 0;
    const newQueue = [...queue];

    toast.info('Syncing offline data to server...', { id: 'sync-toast' });

    for (const action of queue) {
      try {
        const res = await fetch('/api/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: action.type, data: action.payload })
        });
        if (res.ok) {
          successCount++;
          newQueue.shift(); // Remove successful action
        } else {
          break; // Server error, stop syncing
        }
      } catch (e) {
        break; // Network error, stop syncing
      }
    }

    // Save remaining queue
    localStorage.setItem('offline_queue', JSON.stringify(newQueue));
    setOfflineQueueCount(newQueue.length);
    setIsSyncing(false);

    if (successCount > 0) {
      toast.success(`Successfully synced ${successCount} offline records!`);
      fetchParticipants(); // Refresh list to get real DB IDs
    }
  }, [isSyncing, fetchParticipants]);

  // Listen for internet returning
  useEffect(() => {
    const handleOnline = () => { syncQueue(); };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncQueue]);

  // Initial Fetch & Sync
  useEffect(() => {
    fetchParticipants();
    syncQueue();
  }, [fetchParticipants, syncQueue]);


  // ----------------------------------------------------
  // DATA ACTIONS (Optimistic + Offline Support)
  // ----------------------------------------------------

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

  const getParticipantById = useCallback((id: number | string): Participant | undefined => {
    return participants.find(p => p.id === id);
  }, [participants]);

  const addParticipant = useCallback((data: Omit<Participant, 'id' | 'registeredAt'>) => {
    const tempId = `temp_${Date.now()}`;
    const newParticipant = {
      ...data,
      id: tempId,
      registeredAt: new Date().toISOString(),
    };
    
    // Optimistic UI Update & Cache
    saveCache([newParticipant as Participant, ...participants]);

    // Attempt Network Save
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', data: newParticipant })
    })
    .then(res => {
      if (!res.ok) throw new Error('Server error');
      return res.json();
    })
    .then(() => fetchParticipants())
    .catch(() => {
      // Offline fallback
      enqueueAction({
        id: tempId,
        type: 'add',
        payload: newParticipant,
        timestamp: Date.now()
      });
    });

    return newParticipant as Participant;
  }, [participants, fetchParticipants]);

  const importParticipants = useCallback((imported: Omit<Participant, 'id'>[]) => {
    // Attempt Network Save
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'import', data: imported })
    })
    .then(() => fetchParticipants())
    .catch(() => {
      enqueueAction({
        id: `import_${Date.now()}`,
        type: 'import',
        payload: imported,
        timestamp: Date.now()
      });
    });
  }, [fetchParticipants]);

  const updateParticipant = useCallback((id: number | string, updates: Partial<Omit<Participant, 'id'>>) => {
    const target = participants.find(p => p.id === id);
    if (!target) return;
    
    const updated = { ...target, ...updates };
    
    // Optimistic UI Update
    const newParticipants = participants.map(p => (p.id === id ? updated : p));
    saveCache(newParticipants);
    
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', data: updated })
    }).catch(() => {
      enqueueAction({
        id: `update_${id}_${Date.now()}`,
        type: 'update',
        payload: updated,
        timestamp: Date.now()
      });
    });
  }, [participants]);

  const deleteParticipant = useCallback((id: number | string) => {
    // Optimistic UI Update
    const newParticipants = participants.filter(p => p.id !== id);
    saveCache(newParticipants);

    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', data: { id } })
    }).catch(() => {
      enqueueAction({
        id: `delete_${id}_${Date.now()}`,
        type: 'delete',
        payload: { id },
        timestamp: Date.now()
      });
    });
  }, [participants]);

  const clearData = useCallback(() => {
    saveCache([]);
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' })
    }).catch(() => {
      enqueueAction({
        id: `clear_${Date.now()}`,
        type: 'clear',
        payload: null,
        timestamp: Date.now()
      });
    });
  }, []);

  const resetData = useCallback(() => {
    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' })
    })
    .then(() => fetchParticipants())
    .catch(() => {
      enqueueAction({
        id: `reset_${Date.now()}`,
        type: 'reset',
        payload: null,
        timestamp: Date.now()
      });
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
    offlineQueueCount // Expose this in case we want to show a badge in the UI
  };
}
