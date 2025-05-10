import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { FileText, Download, Calendar } from 'lucide-react';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

interface Transaction {
  id: number;
  amount: number;
  date: string;
  comment: string;
  category: Category;
}

interface Report {
  id: number;
  report_type: string;
  period_from: string;
  period_to: string;
  created_at: string;
}

interface ReportData {
  period: {
    from: string;
    to: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  categories: {
    name: string;
    type: string;
    total: number;
  }[];
  transactions: Transaction[];
}

const Reports: React.FC = () => {
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Date range for report generation
  const [dateRange, setDateRange] = useState({
    from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const fetchSavedReports = async () => {
      try {
        const response = await axios.get('http://localhost:3000/reports');
        setSavedReports(response.data);
      } catch (err) {
        console.error('Error fetching saved reports:', err);
        setError('Не удалось загрузить сохраненные отчеты');
      }
    };

    fetchSavedReports();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:3000/reports/generate/monthly', dateRange);
      setReportData(response.data);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Не удалось сгенерировать отчет');
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!reportData) return;
    
    try {
      const response = await axios.post('http://localhost:3000/reports', {
        report_type: 'monthly',
        period_from: reportData.period.from,
        period_to: reportData.period.to,
      });
      
      setSavedReports([response.data, ...savedReports]);
    } catch (err) {
      console.error('Error saving report:', err);
      setError('Не удалось сохранить отчет');
    }
  };

  const loadReport = async (id: number) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`http://localhost:3000/reports/${id}`);
      const reportResponse = await axios.post('http://localhost:3000/reports/generate/monthly', {
        from: response.data.period_from,
        to: response.data.period_to,
      });
      
      setReportData(reportResponse.data);
      setDateRange({
        from: response.data.period_from,
        to: response.data.period_to,
      });
    } catch (err) {
      console.error('Error loading report:', err);
      setError('Не удалось загрузить отчет');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!reportData) return { doughnutData: null, barData: null };
    
    // Prepare doughnut chart data for categories
    const categoryColors = {
      income: 'rgba(34, 197, 94, 0.7)',
      expense: 'rgba(239, 68, 68, 0.7)',
    };
    
    const doughnutData = {
      labels: reportData.categories.map(cat => cat.name),
      datasets: [
        {
          data: reportData.categories.map(cat => cat.total),
          backgroundColor: reportData.categories.map(cat => categoryColors[cat.type as 'income' | 'expense']),
          borderWidth: 1,
        },
      ],
    };
    
    // Group transactions by date for bar chart
    const dailyData: Record<string, { income: number; expense: number }> = {};
    
    reportData.transactions.forEach(transaction => {
      const day = format(new Date(transaction.date), 'MMM dd');
      if (!dailyData[day]) {
        dailyData[day] = { income: 0, expense: 0 };
      }
      
      if (transaction.category.type === 'income') {
        dailyData[day].income += Number(transaction.amount);
      } else {
        dailyData[day].expense += Number(transaction.amount);
      }
    });
    
    const barData = {
      labels: Object.keys(dailyData),
      datasets: [
        {
          label: 'Доходы',
          data: Object.values(dailyData).map(data => data.income),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
        },
        {
          label: 'Расходы',
          data: Object.values(dailyData).map(data => data.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        },
      ],
    };
    
    return { doughnutData, barData };
  };

  const { doughnutData, barData } = reportData ? prepareChartData() : { doughnutData: null, barData: null };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Отчеты</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Report Generation Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold">Создать отчет</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
              Дата начала
            </label>
            <input
              type="date"
              id="from"
              name="from"
              value={dateRange.from}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
              Дата окончания
            </label>
            <input
              type="date"
              id="to"
              name="to"
              value={dateRange.to}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать отчет'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Saved Reports */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold">Сохраненные отчеты</h2>
        </div>
        
        {savedReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип отчета</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Период</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.report_type === 'monthly' ? 'Ежемесячный' : report.report_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(report.period_from), 'dd MMM yyyy')} - {format(new Date(report.period_to), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(report.created_at), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => loadReport(report.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Загрузить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Сохраненных отчетов нет</p>
        )}
      </div>
      
      {/* Report Results */}
      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Отчет: {format(new Date(reportData.period.from), 'dd MMM yyyy')} - {format(new Date(reportData.period.to), 'dd MMM yyyy')}
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={saveReport}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <FileText size={18} />
                <span>Сохранить отчет</span>
              </button>
              <button
                onClick={() => {
                  // In a real app, this would generate a PDF or CSV
                  alert('Функция экспорта будет реализована позже');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Download size={18} />
                <span>Экспорт</span>
              </button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-500 font-medium">Общий доход</p>
              <p className="text-2xl font-bold text-blue-700">${reportData.summary.totalIncome.toFixed(2)}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-500 font-medium">Общий расход</p>
              <p className="text-2xl font-bold text-red-700">${reportData.summary.totalExpense.toFixed(2)}</p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              reportData.summary.balance >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className={`text-sm font-medium ${
                reportData.summary.balance >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                Баланс
              </p>
              <p className={`text-2xl font-bold ${
                reportData.summary.balance >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                ${reportData.summary.balance.toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Расходы по категориям</h3>
              {doughnutData && (
                <div className="h-64">
                  <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                </div>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Ежедневный обзор</h3>
              {barData && (
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
              )}
            </div>
          </div>
          
          {/* Category Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Разбивка по категориям</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% от общего</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.categories.map((category, index) => {
                    const percentage = category.type === 'income'
                      ? (category.total / reportData.summary.totalIncome) * 100
                      : (category.total / reportData.summary.totalExpense) * 100;
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {category.type === 'income' ? 'Доход' : 'Расход'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                          category.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${category.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {percentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Transactions List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Транзакции</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(transaction.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.category.name}
                        </span>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;