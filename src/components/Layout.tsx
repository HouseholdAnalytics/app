import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, DollarSign, PieChart, BarChart3, LogOut, User } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/transactions', label: 'Transactions', icon: <DollarSign size={20} /> },
    { path: '/categories', label: 'Categories', icon: <PieChart size={20} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Finance Tracker</h1>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 mt-auto border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-2 w-full text-left rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;