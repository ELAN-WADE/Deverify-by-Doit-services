import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Participant {
  id: string;
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
  };

  // 2. Fetch from Live Database
  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch(`/api/participants?t=${Date.now()}`, { cache: 'no-store' });
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
    let successIds = new Set<string>();

    toast.info('Syncing offline data to server...', { id: 'sync-toast' });

    for (const action of queue) {
      try {
        const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (action.type === 'clear' || action.type === 'reset') {
          reqHeaders['x-api-key'] = 'doitservices2026';
        }

        const res = await fetch('/api/participants', {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify({ action: action.type, data: action.payload })
        });
        
        // If 200 OK or 409 Conflict (Duplicate), we consider it "processed" so it doesn't get stuck forever
        if (res.ok || res.status === 409) {
          successCount++;
          successIds.add(action.id);
        } else if (res.status === 500) {
          // If the server throws a 500 (e.g. UNIQUE constraint failed), we should still remove it from the queue so it doesn't block forever
          const errorData = await res.json().catch(() => ({}));
          if (errorData.error && errorData.error.includes('UNIQUE constraint failed')) {
            successIds.add(action.id);
          } else {
             break; // Unknown Server error, stop syncing
          }
        } else {
          break; // Other Server error, stop syncing
        }
      } catch (e) {
        break; // Network error, stop syncing
      }
    }

    // Filter out successful actions cleanly without index shifting bugs
    const remainingQueue = queue.filter(a => !successIds.has(a.id));
    localStorage.setItem('offline_queue', JSON.stringify(remainingQueue));
    setOfflineQueueCount(remainingQueue.length);
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
  }, []); // Run ONCE on mount to prevent infinite loops


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
    const newId = crypto.randomUUID();
    const newParticipant = {
      ...data,
      id: newId,
      registeredAt: new Date().toISOString(),
    };
    
    // Optimistic UI Update & Cache
    saveCache([newParticipant as Participant, ...participants]);

    // Strict Offline-First: Always enqueue first
    enqueueAction({
      id: newId,
      type: 'add',
      payload: newParticipant,
      timestamp: Date.now()
    });

    if (!navigator.onLine) {
      toast.info('Saved locally. Will sync when online.', { id: 'offline-saved' });
    }

    // Trigger background sync
    syncQueue();

    return newParticipant as Participant;
  }, [participants, syncQueue]);

  const importParticipants = useCallback((imported: Omit<Participant, 'id'>[]) => {
    // Strict Offline-First
    enqueueAction({
      id: `import_${Date.now()}`,
      type: 'import',
      payload: imported,
      timestamp: Date.now()
    });

    if (!navigator.onLine) {
      toast.info('Import saved locally. Will sync when online.', { id: 'offline-saved' });
    }

    syncQueue();
  }, [syncQueue]);

  const updateParticipant = useCallback((id: number | string, updates: Partial<Omit<Participant, 'id'>>) => {
    const target = participants.find(p => p.id === id);
    if (!target) return;
    
    const updated = { ...target, ...updates };
    
    // Optimistic UI Update
    const newParticipants = participants.map(p => (p.id === id ? updated : p));
    saveCache(newParticipants);
    
    // Strict Offline-First
    enqueueAction({
      id: `update_${id}_${Date.now()}`,
      type: 'update',
      payload: updated,
      timestamp: Date.now()
    });

    syncQueue();
  }, [participants, syncQueue]);

  const deleteParticipant = useCallback((id: number | string) => {
    // Optimistic UI Update
    const newParticipants = participants.filter(p => p.id !== id);
    saveCache(newParticipants);

    // Strict Offline-First
    enqueueAction({
      id: `delete_${id}_${Date.now()}`,
      type: 'delete',
      payload: { id },
      timestamp: Date.now()
    });

    syncQueue();
  }, [participants, syncQueue]);

  const clearData = useCallback(() => {
    saveCache([]);
    // Strict Offline-First
    enqueueAction({
      id: `clear_${Date.now()}`,
      type: 'clear',
      payload: null,
      timestamp: Date.now()
    });

    syncQueue();
  }, [syncQueue]);

  const resetData = useCallback(() => {
    // Strict Offline-First
    enqueueAction({
      id: `reset_${Date.now()}`,
      type: 'reset',
      payload: null,
      timestamp: Date.now()
    });

    syncQueue();
  }, [syncQueue]);

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
