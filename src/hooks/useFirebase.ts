import { useState, useEffect, useCallback } from 'react';
import { ref, push, onValue, set, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebase';
import { RSVP, LandingPageSettings } from '../types';

export const useFirebase = () => {
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landingPageSettings, setLandingPageSettings] = useState<LandingPageSettings | null>(null);

  useEffect(() => {
    const rsvpsRef = ref(database, 'rsvps');
    const settingsRef = ref(database, 'settings/landingPage');

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
      setLoading(false);
    };

    const rsvpUnsubscribe = onValue(rsvpsRef, handleRSVPData, (error) => {
      console.error("Error fetching RSVPs:", error);
      setError(error.message);
    });

    const settingsUnsubscribe = onValue(settingsRef, handleSettingsData, (error) => {
      console.error("Error fetching settings:", error);
      setError(error.message);
    });

    return () => {
      rsvpUnsubscribe();
      settingsUnsubscribe();
    };
  }, []);

  const addRSVP = useCallback(async (data: Omit<RSVP, 'id'>) => {
    setOperationLoading(true);
    setError(null);
    try {
      const rsvpsRef = ref(database, 'rsvps');
      await push(rsvpsRef, data);
    } catch (err) {
      setError('Failed to add RSVP');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const deleteRSVP = useCallback(async (id: string) => {
    setOperationLoading(true);
    setError(null);
    try {
      const rsvpRef = ref(database, `rsvps/${id}`);
      await remove(rsvpRef);
    } catch (err) {
      setError('Failed to delete RSVP');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const updateLandingPage = useCallback(async (data: LandingPageSettings) => {
    setOperationLoading(true);
    setError(null);
    try {
      const settingsRef = ref(database, 'settings/landingPage');
      await set(settingsRef, data);
    } catch (err) {
      setError('Failed to update landing page');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setOperationLoading(true);
    setError(null);
    try {
      const fileRef = storageRef(storage, `backgrounds/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      const backgroundType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video';

      const updatedSettings: LandingPageSettings = {
        ...landingPageSettings!,
        backgroundType,
        backgroundUrl: url,
      };
      await updateLandingPage(updatedSettings);
      
      return url;
    } catch (err) {
      setError('Failed to upload file');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, [landingPageSettings, updateLandingPage]);

  const deleteAllRSVPs = useCallback(async () => {
    setOperationLoading(true);
    setError(null);
    try {
      const rsvpsRef = ref(database, 'rsvps');
      await remove(rsvpsRef);
    } catch (err) {
      setError('Failed to delete all RSVPs');
      throw err;
    } finally {
      setOperationLoading(false);
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
    operationLoading,
    error
  };
};