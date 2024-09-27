import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nama Lengkap
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700">
          Sekolah/Kantor/Instansi
        </label>
        <input
          type="text"
          id="affiliation"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="guests" className="block text-sm font-medium text-gray-700">
          Jumlah Tamu
        </label>
        <select
          id="guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit RSVP
      </button>
    </form>
  );
};

export default RSVPForm;