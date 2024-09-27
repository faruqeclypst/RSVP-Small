import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LandingPageSettings } from '../types';
import { FaHome, FaCog, FaSignOutAlt, FaTrash, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Tambahkan tipe untuk jsPDF dengan autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const AdminDashboard: React.FC = () => {
  const [settings, setSettings] = useState<LandingPageSettings>({
    title: '',
    backgroundImage: '',
  });
  const { rsvps, updateLandingPage, getLandingPageSettings, deleteRSVP } = useFirebase();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchSettings = async () => {
      if (currentUser) {
        try {
          const landingPageSettings = await getLandingPageSettings();
          if (landingPageSettings) {
            setSettings(landingPageSettings);
          }
        } catch (error) {
          console.error('Error fetching landing page settings:', error);
        }
      }
    };

    fetchSettings();
  }, [currentUser, getLandingPageSettings]);

  const handleUpdateLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLandingPage(settings);
      alert('Landing page updated successfully!');
    } catch (error) {
      console.error('Error updating landing page:', error);
      alert('Failed to update landing page. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDeleteRSVP = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this RSVP?')) {
      try {
        await deleteRSVP(id);
        alert('RSVP deleted successfully!');
      } catch (error) {
        console.error('Error deleting RSVP:', error);
        alert('Failed to delete RSVP. Please try again.');
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.autoTable({
      head: [['Name', 'Affiliation', 'Guests']],
      body: rsvps.map(rsvp => [rsvp.name, rsvp.affiliation, rsvp.guests]),
    });
    doc.save('rsvp_list.pdf');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white p-6">
        <h2 className="text-2xl font-semibold mb-6">Admin Panel</h2>
        <nav>
          <button
            className={`w-full text-left py-2 px-4 rounded ${activeTab === 'dashboard' ? 'bg-indigo-900' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaHome className="inline-block mr-2" /> Dashboard
          </button>
          <button
            className={`w-full text-left py-2 px-4 rounded ${activeTab === 'settings' ? 'bg-indigo-900' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog className="inline-block mr-2" /> Settings
          </button>
          <button
            className="w-full text-left py-2 px-4 rounded hover:bg-indigo-900"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="inline-block mr-2" /> Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <>
            <h1 className="text-3xl font-bold mb-6">RSVP Submissions</h1>
            <div className="mb-4">
              <button
                onClick={exportToPDF}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                <FaFilePdf className="inline-block mr-2" /> Export to PDF
              </button>
            </div>
            <div className="overflow-x-auto bg-white shadow-md rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{rsvp.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rsvp.affiliation}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rsvp.guests}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteRSVP(rsvp.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rsvps.length === 0 && (
              <p className="text-center py-4 text-gray-500">No RSVPs submitted yet.</p>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Landing Page Settings</h1>
            <form onSubmit={handleUpdateLandingPage} className="space-y-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700">
                  Background Image URL
                </label>
                <input
                  type="text"
                  id="backgroundImage"
                  value={settings.backgroundImage}
                  onChange={(e) => setSettings({ ...settings, backgroundImage: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Landing Page
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;