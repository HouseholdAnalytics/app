import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Plus, Trash2, Filter } from "lucide-react";

interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

interface Transaction {
  id: number;
  amount: number;
  date: string;
  comment: string;
  category: Category;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    dateFrom: "",
    dateTo: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    comment: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [transactionsRes, categoriesRes] = await Promise.all([
          axios.get("http://localhost:3000/transactions"),
          axios.get("http://localhost:3000/categories"),
        ]);

        setTransactions(transactionsRes.data);
        setCategories(categoriesRes.data);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      const response = await axios.post("http://localhost:3000/transactions", {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
      });

      // Fetch the complete transaction data with category
      const transactionResponse = await axios.get(
        `http://localhost:3000/transactions/${response.data.id}`
      );

      setTransactions([transactionResponse.data, ...transactions]);
      setShowForm(false);
      setFormData({
        category_id: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        comment: "",
      });
    } catch (err: any) {
      console.error("Error creating transaction:", err);
      setError(err.response?.data?.message || "Не удалось создать транзакцию");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/transactions/${id}`);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Не удалось удалить транзакцию");
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filters.type !== "all" && transaction.category.type !== filters.type) {
      return false;
    }

    // Filter by category
    if (
      filters.category !== "all" &&
      transaction.category.id !== parseInt(filters.category)
    ) {
      return false;
    }

    // Filter by date range
    if (
      filters.dateFrom &&
      new Date(transaction.date) < new Date(filters.dateFrom)
    ) {
      return false;
    }

    if (
      filters.dateTo &&
      new Date(transaction.date) > new Date(filters.dateTo)
    ) {
      return false;
    }

    return true;
  });

  if (loading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mt-6">Транзакции</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          <span>Добавить транзакцию</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Transaction Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Добавить новую транзакцию
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="category_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Категория
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите категорию</option>
                  <optgroup label="Доходы">
                    {categories
                      .filter((c) => c.type === "income")
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Расходы">
                    {categories
                      .filter((c) => c.type === "expense")
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Сумма
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Дата
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Комментарий (необязательно)
                </label>
                <input
                  type="text"
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Сохранить транзакцию
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={18} className="text-gray-500" />
          <h2 className="text-lg font-semibold">Фильтры</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Тип
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все типы</option>
              <option value="income">Доходы</option>
              <option value="expense">Расходы</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Категория
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="dateFrom"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Дата с
            </label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="dateTo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Дата по
            </label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(transaction.date), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.category.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.comment || "-"}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        transaction.category.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.category.type === "income" ? "+" : "-"}{" "}
                      {Number(transaction.amount).toFixed(2)} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Транзакции не найдены
          </p>
        )}
      </div>
    </div>
  );
};

export default Transactions;
