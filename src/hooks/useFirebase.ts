import { useState, useEffect, useCallback } from 'react';
import { ref, push, onValue, set, off, remove } from 'firebase/database';
import { database } from '../firebase';
import { RSVP, LandingPageSettings } from '../types';

export const useFirebase = () => {
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rsvpsRef = ref(database, 'rsvps');
    setLoading(true);
    
    const handleData = (snapshot: any) => {
      const data = snapshot.val();
      const rsvpList: RSVP[] = [];
      for (let id in data) {
        rsvpList.push({ id, ...data[id] });
      }
      setRSVPs(rsvpList);
      setLoading(false);
    };

    const handleError = (err: Error) => {
      setError('Failed to fetch RSVPs');
      setLoading(false);
      console.error('Error fetching RSVPs:', err);
    };

    onValue(rsvpsRef, handleData, handleError);

    return () => {
      off(rsvpsRef);
    };
  }, []);

  const addRSVP = useCallback(async (data: Omit<RSVP, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const rsvpsRef = ref(database, 'rsvps');
      await push(rsvpsRef, data);
    } catch (err) {
      setError('Failed to add RSVP');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRSVP = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const rsvpRef = ref(database, `rsvps/${id}`);
      await remove(rsvpRef);
    } catch (err) {
      setError('Failed to delete RSVP');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLandingPage = useCallback(async (data: LandingPageSettings) => {
    setLoading(true);
    setError(null);
    try {
      const settingsRef = ref(database, 'settings/landingPage');
      await set(settingsRef, data);
    } catch (err) {
      setError('Failed to update landing page');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLandingPageSettings = useCallback(async (): Promise<LandingPageSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      const settingsRef = ref(database, 'settings/landingPage');
      const snapshot = await new Promise<any>((resolve, reject) => {
        onValue(settingsRef, resolve, reject, { onlyOnce: true });
      });
      return snapshot.val();
    } catch (err) {
      setError('Failed to fetch landing page settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rsvps,
    addRSVP,
    deleteRSVP,
    updateLandingPage,
    getLandingPageSettings,
    loading,
    error
  };
};