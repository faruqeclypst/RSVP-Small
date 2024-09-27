import React, { useState } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import LoadingAnimation from '../components/LoadingAnimation';
import { FaUser, FaBuilding, FaUsers } from 'react-icons/fa';

interface RSVPData {
  name: string;
  affiliation: string;
  guests: number;
}

const LandingPage: React.FC = () => {
  const { addRSVP, landingPageSettings, loading } = useFirebase();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    affiliation: '',
    guests: 1,
  });

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
      await addRSVP(formData);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsSubmitted(true);
        setIsTransitioning(false);
      }, 300);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Failed to submit RSVP. Please try again.');
    }
  };

  if (loading || !landingPageSettings) {
    return <LoadingAnimation />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: landingPageSettings.backgroundType === 'image' 
          ? `url(${landingPageSettings.backgroundUrl})`
          : 'none',
      }}
    >
      {landingPageSettings.backgroundType === 'video' && (
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={landingPageSettings.backgroundUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white bg-opacity-90 shadow-md rounded-lg overflow-hidden">
          <div className="px-8 pt-6 pb-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{landingPageSettings.title}</h1>
            <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {isSubmitted ? (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Terima kasih sudah berhadir di acara maulid SMAN Modal Bangsa!</h2>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      <FaUser className="inline-block mr-2" />
                      Nama Lengkap
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
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
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="affiliation"
                      name="affiliation"
                      type="text"
                      placeholder="Masukkan afiliasi"
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
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
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