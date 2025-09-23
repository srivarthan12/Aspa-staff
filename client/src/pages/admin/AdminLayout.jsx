import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HamburgerIcon from '../../components/HamburgerIcon';

// Icons
import {
  MdDashboard,
  MdPeople,
  MdRequestQuote,
  MdAttachMoney,
  MdHistory,
  MdLogout,
} from 'react-icons/md';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white font-semibold'
      : 'flex items-center gap-2 px-4 py-2 rounded-md text-gray-300 hover:bg-[#39424e] hover:text-emerald-400 transition-all duration-300';

  const SidebarContent = () => (
    <>
      <div className="px-6 py-4 border-b border-gray-600 flex items-center space-x-3 bg-[#2e3440]">
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold shrink-0">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <h2 className="text-lg font-semibold truncate text-white">{user?.username}</h2>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
        <NavLink to="/admin/dashboard" className={navLinkClasses}><MdDashboard size={18} />Dashboard</NavLink>
        <NavLink to="/admin/users" className={navLinkClasses}><MdPeople size={18} />Users</NavLink>
        <NavLink to="/admin/requests" className={navLinkClasses}><MdRequestQuote size={18} />Advance Requests</NavLink>
        <NavLink to="/admin/payroll" className={navLinkClasses}><MdAttachMoney size={18} />Payroll</NavLink>
        <NavLink to="/admin/montly" className={navLinkClasses}><MdHistory size={18} />Monthly Salary History</NavLink>
        <NavLink to="/admin/history" className={navLinkClasses}><MdHistory size={18} />Detailed Salary History</NavLink>
      </nav>

      <div className="px-6 py-4 border-t border-gray-600 bg-[#2e3440]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-300"
        >
          <MdLogout size={18} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#2e3440] text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:flex md:flex-col`}
      >
        <SidebarContent />
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
          <HamburgerIcon onClick={() => setIsSidebarOpen(true)} />
          <span className="text-lg font-bold text-gray-800">Admin Panel</span>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
