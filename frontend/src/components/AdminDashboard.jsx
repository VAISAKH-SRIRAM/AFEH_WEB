import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarPlus, LogOut, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-heading font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 animate-fade-in">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-heading font-bold text-gray-800 mb-2">Welcome Back, {user?.username}</h2>
          <p className="text-gray-500">Manage your hospital operations efficiently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Create Appointment */}
          <div
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden"
            onClick={() => navigate('/book-appointment')}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CalendarPlus className="w-32 h-32 text-blue-600 transform rotate-12" />
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CalendarPlus className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Create Appointment</h3>
            <p className="text-gray-500 mb-4">Book a new appointment for walk-in or returning patients instantly.</p>
            <div className="text-blue-600 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
              Book Now →
            </div>
          </div>

          {/* Manage Patients */}
          <div
            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden"
            onClick={() => navigate('/admin/patients')}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-32 h-32 text-teal-600 transform rotate-12" />
            </div>
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Patients</h3>
            <p className="text-gray-500 mb-4">Access patient records, view history, and update details.</p>
            <div className="text-teal-600 font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
              View List →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;