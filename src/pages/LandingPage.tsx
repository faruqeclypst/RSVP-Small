import React, { useState } from 'react';
import RSVPForm from '../components/RSVPForm';
import LoadingAnimation from '../components/LoadingAnimation';
import { useFirebase } from '../hooks/useFirebase';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const { addRSVP, landingPageSettings, loading } = useFirebase();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleRSVPSubmit = async (data: { name: string; affiliation: string; guests: number }) => {
    try {
      await addRSVP(data);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsSubmitted(true);
        setIsTransitioning(false);
      }, 300); // This should match the transition duration in CSS
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
      className="landing-page"
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
          className="background-video"
        >
          <source src={landingPageSettings.backgroundUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      <div className="content-wrapper">
        <div className="form-container">
          <h1>{landingPageSettings.title}</h1>
          <div className={`transition-container ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
            {isSubmitted ? (
              <div className="thank-you-message">
                <h2>Terima kasih sudah berhadir di acara maulid SMAN Modal Bangsa!</h2>
                <p>Kami menantikan kehadiran Anda.</p>
              </div>
            ) : (
              <RSVPForm onSubmit={handleRSVPSubmit} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;