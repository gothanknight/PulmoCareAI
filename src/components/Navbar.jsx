import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserGroupIcon,
  ChartBarIcon,
  HomeIcon,
  ClockIcon,
  InformationCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import PulmoCareAILogo from './PulmoCareAILogo';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'Patients', href: '/patients', icon: UserGroupIcon },
    { name: 'Analysis', href: '/analysis', icon: PulmoCareAILogo },
    { name: 'History', href: '/history', icon: ClockIcon },
    { name: 'Statistics', href: '/medical-statistics', icon: BeakerIcon },
    { name: 'About', href: '/about', icon: InformationCircleIcon },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-100">
      <div className="relative h-16">
        {/* Logo - Absolute Left */}
        <Link to="/" className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-3 z-10">
            <div className="medical-gradient p-2 rounded-lg">
              <PulmoCareAILogo className="h-8 w-8 text-white" />
            </div>
          <div className="min-w-0">
            <span className="text-lg font-bold text-gray-900 whitespace-nowrap">PulmoCareAI</span>
            <p className="text-xs text-gray-500 hidden md:block whitespace-nowrap">Lung Cancer Detection</p>
          </div>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center space-x-4 lg:space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-2 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
        </div>

        {/* User Menu - Absolute Right */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
            >
              <UserCircleIcon className="h-5 w-5" />
              <span className="hidden lg:block truncate max-w-40">{user?.full_name || user?.username}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.department}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 md:hidden z-20">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile User Info & Logout */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.department}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors rounded-lg"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;