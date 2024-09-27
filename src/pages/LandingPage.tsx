import React, { useState, useEffect } from 'react';
import { Parallax } from 'react-parallax';
import RSVPForm from '../components/RSVPForm';
import LoadingAnimation from '../components/LoadingAnimation';
import { useFirebase } from '../hooks/useFirebase';
import { LandingPageSettings } from '../types';

const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<LandingPageSettings>({
    title: 'Welcome to Our Event!',
    backgroundImage: '/path/to/default-background.jpg',
  });
  const { addRSVP, getLandingPageSettings } = useFirebase();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const fetchedSettings = await getLandingPageSettings();
        if (fetchedSettings) {
          setSettings(fetchedSettings);
        }
      } catch (error) {
        console.error('Error fetching landing page settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [getLandingPageSettings]);

  const handleRSVPSubmit = async (data: { name: string; affiliation: string; guests: number }) => {
    try {
      await addRSVP(data);
      alert('RSVP submitted successfully!');
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Failed to submit RSVP. Please try again.');
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <Parallax
      bgImage={settings.backgroundImage}
      strength={500}
      bgImageStyle={{objectFit: 'cover', width: '100%', height: '100%'}}
    >
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-center mb-6">{settings.title}</h1>
          <RSVPForm onSubmit={handleRSVPSubmit} />
        </div>
      </div>
    </Parallax>
  );
};

export default LandingPage;