import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { format } from 'date-fns';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface Transaction {
  id: number;
  amount: number;
  date: string;
  comment: string;
  category: {
    id: number;
    name: string;
    type: 'income' | 'expense';
  };
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/transactions');
        setTransactions(response.data);
        
        // Calculate summary
        const income = response.data
          .filter((t: Transaction) => t.category.type === 'income')
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
        
        const expense = response.data
          .filter((t: Transaction) => t.category.type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
        
        setSummary({
          totalIncome: income,
          totalExpense: expense,
          balance: income - expense,
        });
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Prepare data for charts
  const prepareChartData = () => {
    // Group by category
    const categoryData: Record<string, { total: number; type: string; color: string }> = {};
    
    transactions.forEach((transaction) => {
      const { category, amount } = transaction;
      if (!categoryData[category.name]) {
        categoryData[category.name] = {
          total: 0,
          type: category.type,
          color: category.type === 'income' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)',
        };
      }
      categoryData[category.name].total += Number(amount);
    });

    // Prepare doughnut chart data
    const doughnutData = {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData).map((cat) => cat.total),
          backgroundColor: Object.values(categoryData).map((cat) => cat.color),
          borderWidth: 1,
        },
      ],
    };

    // Group by month for bar chart
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach((transaction) => {
      const month = format(new Date(transaction.date), 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      
      if (transaction.category.type === 'income') {
        monthlyData[month].income += Number(transaction.amount);
      } else {
        monthlyData[month].expense += Number(transaction.amount);
      }
    });

    // Prepare bar chart data
    const barData = {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Income',
          data: Object.values(monthlyData).map((data) => data.income),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
        },
        {
          label: 'Expense',
          data: Object.values(monthlyData).map((data) => data.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        },
      ],
    };

    return { doughnutData, barData };
  };

  const { doughnutData, barData } = transactions.length ? prepareChartData() : { doughnutData: null, barData: null };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Wallet className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-xl font-bold">${summary.balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-xl font-bold">${summary.totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="text-red-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-xl font-bold">${summary.totalExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="text-purple-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-xl font-bold">{transactions.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          {doughnutData && transactions.length > 0 ? (
            <div className="h-64">
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No data to display</p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
          {barData && transactions.length > 0 ? (
            <div className="h-64">
              <Bar 
                data={barData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} 
              />
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No data to display</p>
          )}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.comment || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.category.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.category.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No transactions yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;