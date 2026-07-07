import React, { useState, useEffect } from 'react';
import ExpenseModal from '../components/ExpenseModal';
import { CATEGORIES } from '../components/ExpenseModal';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Calendar,
} from 'lucide-react';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date:desc');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build Query String
      const params = new URLSearchParams({
        page,
        limit: 15,
        sortBy,
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setExpenses(data.expenses);
        setPages(data.pages);
      } else {
        setError(data.message || 'Could not fetch transactions.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure during records retrieval.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, sortBy, category, startDate, endDate]); // Reload immediately on filter change

  // Execute search queries when users trigger manually or hit enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExpenses();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSortBy('date:desc');
    setPage(1);
  };

  const handleSaveExpense = async (payload, id) => {
    try {
      const url = id ? `/api/expenses/${id}` : '/api/expenses';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        fetchExpenses();
        return true;
      } else {
        alert(data.message || 'Operation failed');
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this expense?')) {
      return;
    }

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        fetchExpenses();
      } else {
        alert(data.message || 'Could not delete item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  return (
    <main className="main-content" id="expenses-page">
      <header className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Expense Ledger</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review, edit, and log your individual financial transactions.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" id="add-expense-btn">
          <Plus size={16} />
          <span>Log Expense</span>
        </button>
      </header>

      {/* Filter and sorting widgets */}
      <section className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} className="filters-bar" id="filters-form">
          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search description..."
              className="input-field"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }} id="search-btn">
              <Search size={14} />
            </button>
          </div>

          <select
            className="input-field"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="input-field"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />

          <input
            type="date"
            className="input-field"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="date:desc">Newest First</option>
            <option value="date:asc">Oldest First</option>
            <option value="amount:desc">Amount: High to Low</option>
            <option value="amount:asc">Amount: Low to High</option>
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            onClick={handleResetFilters}
            id="reset-filters-btn"
          >
            Reset
          </button>
        </form>
      </section>

      {/* Ledger Table */}
      <section className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div className="flex-center" style={{ minHeight: '300px' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="alert alert-danger" style={{ margin: '24px' }}>
            <span>{error}</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex-center" style={{ minHeight: '300px', color: 'var(--text-muted)' }}>
            No expenses found matching the search criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" id="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const badgeClass = `badge badge-${expense.category.toLowerCase()}`;
                  const expDate = new Date(expense.date);
                  
                  return (
                    <tr key={expense._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: 'none' }}>
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{expDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </td>
                      <td>{expense.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description</span>}</td>
                      <td>
                        <span className={badgeClass}>{expense.category}</span>
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-family-title)' }}>
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn-icon"
                            title="Edit Record"
                            onClick={() => openEditModal(expense)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn-icon"
                            title="Delete Record"
                            style={{ color: 'var(--danger-color)' }}
                            onClick={() => handleDeleteExpense(expense._id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination indicators */}
      {!loading && pages > 1 && (
        <footer className="flex-center" style={{ gap: '16px', marginTop: '24px' }} id="pagination-controls">
          <button
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            style={{ padding: '8px 12px' }}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page {page} of {pages}
          </span>

          <button
            className="btn btn-secondary"
            disabled={page === pages}
            onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
            style={{ padding: '8px 12px' }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </footer>
      )}

      {/* Add / Edit modal popup */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
      />
    </main>
  );
};

export default ExpensesPage;
