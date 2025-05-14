import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Reports from './pages/Reports';

const App: React.FC = () => {
  // Здесь будет реальная логика аутентификации
  const user = {
    username: 'admin123',
    email: 'admin123@gmail.com'
  };

  const handleLogout = () => {
    // Здесь будет реальная логика выхода
    console.log('Выход из системы');
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;