import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LandingPageSettings } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface AlertProps {
  message: string;
  type: 'success' | 'error';
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const Alert: React.FC<AlertProps> = ({ message, type }) => (
  <div className={`alert ${type} fixed top-4 right-4 p-4 rounded-md text-white`}>
    {message}
  </div>
);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { rsvps, updateLandingPage, deleteRSVP, deleteAllRSVPs, landingPageSettings, uploadFile } = useFirebase();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [deleteAction, setDeleteAction] = useState<() => Promise<void>>(() => Promise.resolve());

  const [settings, setSettings] = useState<LandingPageSettings>({
    title: '',
    backgroundType: 'image',
    backgroundUrl: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;

  useEffect(() => {
    if (landingPageSettings) {
      setSettings(landingPageSettings);
    }
  }, [landingPageSettings]);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleUpdateLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLandingPage(settings);
      showAlert('Landing page updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating landing page:', error);
      showAlert('Failed to update landing page. Please try again.', 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        setSettings({ ...settings, backgroundType: fileType, backgroundUrl: url });
        showAlert('File uploaded successfully!', 'success');
      } catch (error) {
        console.error('Error uploading file:', error);
        showAlert('Failed to upload file. Please try again.', 'error');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
      showAlert('Failed to log out. Please try again.', 'error');
    }
  };

  const handleDeleteRSVP = (id: string) => {
    setModalMessage('Are you sure you want to delete this RSVP?');
    setDeleteAction(() => async () => {
      try {
        await deleteRSVP(id);
        showAlert('RSVP deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting RSVP:', error);
        showAlert('Failed to delete RSVP. Please try again.', 'error');
      }
    });
    setIsModalOpen(true);
  };

  const handleDeleteAllRSVPs = () => {
    setModalMessage('Are you sure you want to delete all RSVPs? This action cannot be undone.');
    setDeleteAction(() => async () => {
      try {
        await deleteAllRSVPs();
        showAlert('All RSVPs deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting all RSVPs:', error);
        showAlert('Failed to delete all RSVPs. Please try again.', 'error');
      }
    });
    setIsModalOpen(true);
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.autoTable({
      head: [['No.', 'Name', 'Affiliation', 'Guests']],
      body: rsvps.map((rsvp, index) => [index + 1, rsvp.name, rsvp.affiliation, rsvp.guests]),
    });
    doc.save('rsvp_list.pdf');
  };

  const filteredRSVPs = rsvps.filter(
    (rsvp) =>
      rsvp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rsvp.affiliation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRSVPs = filteredRSVPs.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredRSVPs.length / rowsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <ul className="py-4">
          <li>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left py-2 px-6 ${
                activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left py-2 px-6 ${
                activeTab === 'settings' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Settings
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-6 text-gray-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8 overflow-y-auto">
        {alert && <Alert message={alert.message} type={alert.type} />}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">RSVP Submissions</h1>
            <div className="flex justify-between items-center mb-6">
              <div className="space-x-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  onClick={exportToPDF}
                >
                  Export to PDF
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleDeleteAllRSVPs}
                >
                  Delete All
                </button>
              </div>
              <input
                type="text"
                placeholder="Search by name or affiliation"
                className="px-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affiliation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRSVPs.map((rsvp, index) => (
                    <tr key={rsvp.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstRow + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rsvp.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rsvp.affiliation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rsvp.guests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteRSVP(rsvp.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRSVPs.length === 0 && (
              <p className="text-center py-4 text-gray-500">No RSVPs submitted yet.</p>
            )}
            <div className="mt-4 flex justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Landing Page Settings</h1>
            <form onSubmit={handleUpdateLandingPage} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="title"
                  type="text"
                  placeholder="Enter title"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Background
                </label>
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 mb-2">
                    {settings.backgroundType === 'image' ? (
                      <img
                        src={settings.backgroundUrl}
                        alt="Background preview"
                        className="object-cover rounded"
                      />
                    ) : (
                      <video
                        src={settings.backgroundUrl}
                        loop
                        muted
                        autoPlay
                        className="object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Change {settings.backgroundType}
                    </button>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Update Landing Page
                  </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          deleteAction();
          setIsModalOpen(false);
        }}
        message={modalMessage}
      />
    </div>
  );
};

export default AdminDashboard;