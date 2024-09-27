import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import LoadingAnimation from '../components/LoadingAnimation';
import { FaUser, FaBuilding, FaUsers } from 'react-icons/fa';

interface RSVPData {
  name: string;
  affiliation: string;
  guests: number;
  submittedAt: string;
}

const LandingPage: React.FC = () => {
  const { addRSVP, landingPageSettings, loading } = useFirebase();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    affiliation: '',
    guests: 1,
    submittedAt: '',
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSubmitted && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSubmitted && countdown === 0) {
      resetForm();
    }
    return () => clearTimeout(timer);
  }, [isSubmitted, countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? Math.max(1, Math.min(50, parseInt(value) || 1)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      const submissionData = { 
        ...formData, 
        name: formData.name.replace(/\b\w/g, c => c.toUpperCase()),
        affiliation: formData.affiliation.replace(/\b\w/g, c => c.toUpperCase()),
        submittedAt: now.toISOString(),
        submittedAtLocale: now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      };
      await addRSVP(submissionData);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsSubmitted(true);
        setIsTransitioning(false);
        setCountdown(5);
      }, 300);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Failed to submit RSVP. Please try again.');
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      affiliation: '',
      guests: 1,
      submittedAt: '',
    });
  };

  const backgroundStyle = useMemo(() => {
    if (!landingPageSettings) return { backgroundColor: '#f0f0f0' };
    return landingPageSettings.backgroundType === 'image' && landingPageSettings.backgroundUrl
      ? { backgroundImage: `url("${landingPageSettings.backgroundUrl}")` }
      : { backgroundColor: '#f0f0f0' };
  }, [landingPageSettings]);

  if (loading || !landingPageSettings) {
    return <LoadingAnimation />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={backgroundStyle}
    >
      {landingPageSettings.backgroundType === 'video' && landingPageSettings.backgroundUrl && (
        <video
          key={landingPageSettings.backgroundUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={landingPageSettings.backgroundUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white bg-opacity-90 shadow-md rounded-lg overflow-hidden">
          <div className="px-8 pt-6 pb-8">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">{landingPageSettings.title}</h1>
            <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {isSubmitted ? (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Terima kasih sudah berhadir di acara maulid SMAN Modal Bangsa!</h2>
                  <p className="text-gray-600">Kembali ke form dalam {countdown} detik</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      <FaUser className="inline-block mr-2" />
                      Nama Lengkap
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline capitalize"
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="affiliation">
                      <FaBuilding className="inline-block mr-2" />
                      Sekolah/Kantor/Instansi
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline capitalize"
                      id="affiliation"
                      name="affiliation"
                      type="text"
                      value={formData.affiliation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guests">
                      <FaUsers className="inline-block mr-2" />
                      Jumlah Tamu
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="guests"
                      name="guests"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                      type="submit"
                    >
                      Submit RSVP
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;