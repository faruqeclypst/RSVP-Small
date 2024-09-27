import { useState, useEffect, useCallback } from 'react';
import { ref, push, onValue, set, off, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebase';
import { RSVP, LandingPageSettings } from '../types';

export const useFirebase = () => {
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landingPageSettings, setLandingPageSettings] = useState<LandingPageSettings | null>(null);

  useEffect(() => {
    const rsvpsRef = ref(database, 'rsvps');
    const settingsRef = ref(database, 'settings/landingPage');
    
    setLoading(true);

    const handleRSVPData = (snapshot: any) => {
      const data = snapshot.val();
      const rsvpList: RSVP[] = [];
      for (let id in data) {
        rsvpList.push({ id, ...data[id] });
      }
      setRSVPs(rsvpList);
    };

    const handleSettingsData = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        setLandingPageSettings(data);
      }
    };

    onValue(rsvpsRef, handleRSVPData);
    onValue(settingsRef, handleSettingsData);

    setLoading(false);

    return () => {
      off(rsvpsRef);
      off(settingsRef);
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

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const fileRef = storageRef(storage, `backgrounds/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (err) {
      setError('Failed to upload file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAllRSVPs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rsvpsRef = ref(database, 'rsvps');
      await remove(rsvpsRef);
    } catch (err) {
      setError('Failed to delete all RSVPs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rsvps,
    addRSVP,
    deleteRSVP,
    deleteAllRSVPs,
    updateLandingPage,
    landingPageSettings,
    uploadFile,
    loading,
    error
  };
};