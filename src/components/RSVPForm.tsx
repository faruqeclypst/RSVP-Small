import React, { useState } from 'react';
import '../styles/RSVPForm.css';

interface RSVPFormProps {
  onSubmit: (data: { name: string; affiliation: string; guests: number }) => void;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, affiliation, guests });
    setName('');
    setAffiliation('');
    setGuests(1);
  };

  return (
    <form onSubmit={handleSubmit} className="rsvp-form">
      <div className="form-group">
        <label htmlFor="name">Nama Lengkap</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="affiliation">Sekolah/Kantor/Instansi</label>
        <input
          type="text"
          id="affiliation"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="guests">Jumlah Tamu</label>
        <select
          id="guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          required
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="submit-btn">
        Submit RSVP
      </button>
    </form>
  );
};

export default RSVPForm;