import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  LayoutDashboard,
  DollarSign,
  PieChart,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  user: {
    username: string;
    email: string;
  };
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { path: "/dashboard", name: "Панель управления", icon: LayoutDashboard },
    { path: "/transactions", name: "Транзакции", icon: DollarSign },
    { path: "/categories", name: "Категории", icon: PieChart },
    { path: "/reports", name: "Отчеты", icon: BarChart3 },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Мобильная кнопка меню */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Затемнение фона при открытом мобильном меню */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Боковая панель */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-md
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          ${isMobile ? "h-full" : "h-screen"}
        `}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl lg:mt-0 mt-16 font-bold text-gray-800">Финансовый Трекер</h1>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                      if (isMobileMenuOpen) {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`
                      flex items-center space-x-2 p-2 rounded-md transition-colors
                      ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 mt-auto border-t">
          <button
            onClick={() => {
              onLogout();
              if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
              }
            }}
            className="flex items-center space-x-2 p-2 w-full text-left rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
