import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LandingPageSettings } from '../types';
import * as XLSX from 'xlsx';
import { FaFileExport, FaTrashAlt, FaSearch, FaImage, FaVideo, FaSave, FaTachometerAlt, FaCog, FaSignOutAlt, FaEllipsisV, FaChevronDown, FaChevronUp, FaUsers } from 'react-icons/fa';

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
  <div className={`fixed top-4 left-4 right-4 p-4 rounded-md text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} shadow-lg z-50`}>
    {message}
  </div>
);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <p className="mb-4 text-lg">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
  const [isAndroid, setIsAndroid] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [settings, setSettings] = useState<LandingPageSettings>({
    title: '',
    backgroundType: 'image',
    backgroundUrl: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 5;

  useEffect(() => {
    if (landingPageSettings) {
      setSettings(landingPageSettings);
    }
    setIsAndroid(/Android/i.test(navigator.userAgent));
  }, [landingPageSettings]);

  const totalGuests = useMemo(() => {
    return rsvps.reduce((sum, rsvp) => sum + rsvp.guests, 0);
  }, [rsvps]);

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

  const handleLogout = () => {
    setModalMessage('Are you sure you want to logout?');
    setDeleteAction(() => async () => {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Failed to log out', error);
        showAlert('Failed to log out. Please try again.', 'error');
      }
    });
    setIsModalOpen(true);
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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rsvps.map((rsvp, index) => ({
      'No.': index + 1,
      'Nama Lengkap': rsvp.name,
      'Sekolah / Kantor': rsvp.affiliation,
      'Jumlah Tamu': rsvp.guests,
      'Tanggal Submit': rsvp.submittedAt ? new Date(rsvp.submittedAt).toLocaleString() : 'N/A'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RSVPs");

    XLSX.utils.sheet_add_aoa(worksheet, [["Daftar Tamu Maulid SMAN Modal Bangsa"]], { origin: "A1" });

    const max_width = rsvps.reduce((w, r) => Math.max(w, r.name.length), 10);
    worksheet["!cols"] = [ { wch: max_width } ];

    XLSX.writeFile(workbook, "Daftar_Tamu_Maulid_SMAN_Modal_Bangsa.xlsx");
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

  const toggleRowExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 2) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold md:text-left text-center">SMAN MODAL BANGSA</h1>
        </div>
      </header>
      {alert && <Alert message={alert.message} type={alert.type} />}
      <main className="flex-1 p-4 overflow-y-auto pb-20">
        <div className="container mx-auto max-w-6xl">
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold mb-4 md:text-left text-center">Daftar Tamu</h1>
   
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                    <p className="text-gray-600">
                      <FaUsers className="inline-block mr-2" />
                      RSVPs: {rsvps.length}
                    </p>
                    <p className="text-gray-600">
                      <FaUsers className="inline-block mr-2" />
                      Tamu: {totalGuests}
                    </p>
                  </div>
                  {!isAndroid && (
                    <div className="flex space-x-2">
                      <button
                        className="bg-green-500 text-white py-2 px-4 rounded flex items-center justify-center hover:bg-green-600 transition-colors"
                        onClick={exportToExcel}
                      >
                        <FaFileExport className="mr-2" /> Export to Excel
                      </button>
                      <button
                        className="bg-red-500 text-white py-2 px-4 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                        onClick={handleDeleteAllRSVPs}
                      >
                        <FaTrashAlt className="mr-2" /> Delete All
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari Nama / Sekolah / Kantor"
                    className="w-full px-4 py-2 border rounded pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                      {!isAndroid && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sekolah / Kantor</th>
                      {!isAndroid && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamu</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRSVPs.map((rsvp, index) => (
                      <React.Fragment key={rsvp.id}>
                        <tr>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{indexOfFirstRow + index + 1}</td>
                          {!isAndroid && <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rsvp.name}</td>}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{rsvp.affiliation}</td>
                          {!isAndroid && (
                            <>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{rsvp.guests}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {rsvp.submittedAt ? new Date(rsvp.submittedAt).toLocaleString() : 'N/A'}
                              </td>
                            </>
                          )}
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            {isAndroid && (
                              <button
                                onClick={() => toggleRowExpand(rsvp.id)}
                                className="text-green-600 hover:text-green-900 transition-colors mr-2"
                              >
                                {expandedRow === rsvp.id ? <FaChevronUp /> : <FaChevronDown />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRSVP(rsvp.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                        {isAndroid && expandedRow === rsvp.id && (
                          <tr>
                            <td colSpan={4}>
                              <div className="px-4 py-2 bg-gray-50">
                                <p><strong>Nama:</strong> {rsvp.name}</p>
                                <p><strong>Tamu:</strong> {rsvp.guests}</p>
                                <p><strong>Waktu:</strong> {rsvp.submittedAt ? new Date(rsvp.submittedAt).toLocaleString() : 'N/A'}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRSVPs.length === 0 && (
                <p className="text-center py-4 text-gray-500">No RSVPs submitted yet.</p>
              )}
              <div className="mt-4 flex justify-center">
                {getPaginationRange(currentPage, totalPages).map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-green-500 text-white'
                        : page === '...'
                        ? 'bg-gray-200 text-gray-700 cursor-default'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } transition-colors`}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold mb-4 md:text-left text-center">Landing Page Settings</h1>
              <form onSubmit={handleUpdateLandingPage} className="bg-white shadow rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <div className="aspect-w-16 aspect-h-9 mb-2 bg-gray-200 rounded overflow-hidden">
                      {settings.backgroundType === 'image' ? (
                        <img
                          src={settings.backgroundUrl}
                          alt="Background preview"
                          className="object-cover w-full h-60 md:h-full"
                        />
                      ) : (
                        <video
                          src={settings.backgroundUrl}
                          loop
                          muted
                          autoPlay
                          className="object-cover w-full h-60 md:h-full"
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                      >
                        {settings.backgroundType === 'image' ? <FaImage className="mr-2 inline" /> : <FaVideo className="mr-2 inline" />}
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
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors flex items-center"
                    type="submit"
                  >
                    <FaSave className="mr-2" /> Update Landing Page
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      {isAndroid && activeTab === 'dashboard' && (
        <div className="fixed bottom-20 right-4 flex flex-col-reverse items-end space-y-2 space-y-reverse">
          <button
            className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 ease-in-out transform hover:scale-110 z-20"
            onClick={() => setShowFloatingMenu(!showFloatingMenu)}
          >
            <FaEllipsisV className={`transform transition-transform duration-300 ${showFloatingMenu ? 'rotate-180' : ''}`} />
          </button>
          <div 
            className={`flex flex-col-reverse space-y-2 space-y-reverse transition-all duration-300 ease-in-out ${
              showFloatingMenu 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
          >
            <button
              className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 ease-in-out transform hover:scale-110"
              onClick={handleDeleteAllRSVPs}
            >
              <FaTrashAlt />
            </button>
            <button
              className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 ease-in-out transform hover:scale-110"
              onClick={exportToExcel}
            >
              <FaFileExport />
            </button>
          </div>
        </div>
      )}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="container mx-auto">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 py-2 ${
                activeTab === 'dashboard' ? 'text-green-500' : 'text-gray-500'
              } hover:text-green-500 transition-colors`}
            >
              <FaTachometerAlt className="text-xl mb-1" />
              <span className="text-xs">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center flex-1 py-2 ${
                activeTab === 'settings' ? 'text-green-500' : 'text-gray-500'
              } hover:text-green-500 transition-colors`}
            >
              <FaCog className="text-xl mb-1" />
              <span className="text-xs">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-green-500 transition-colors"
            >
              <FaSignOutAlt className="text-xl mb-1" />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>
      </nav>
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