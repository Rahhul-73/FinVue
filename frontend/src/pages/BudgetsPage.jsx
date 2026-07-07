import React, { useState, useEffect } from 'react';
import BudgetModal from '../components/BudgetModal';
import { CATEGORIES } from '../components/ExpenseModal';
import { PiggyBank, Edit2, Trash2, Calendar, AlertTriangle } from 'lucide-react';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [summaryBreakdown, setSummaryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Month & Year Selector
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch set budgets (to get IDs for deletion)
      const budgetsRes = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const budgetsData = await budgetsRes.json();

      // Fetch actual category spending summary
      const summaryRes = await fetch(`/api/analytics/summary?month=${month}&year=${year}`);
      const summaryData = await summaryRes.json();

      if (budgetsData.success && summaryData.success) {
        setBudgets(budgetsData.budgets);
        setSummaryBreakdown(summaryData.summary.breakdown);
      } else {
        setError('Failed to load budget values.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection issue during database query.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [month, year]);

  const handleSaveBudget = async (payload) => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        fetchBudgetData();
        return true;
      } else {
        alert(data.message || 'Could not update budget limit');
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to remove this budget limit?')) {
      return;
    }

    try {
      const res = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        fetchBudgetData();
      } else {
        alert(data.message || 'Failed to remove limit');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = (category = 'Food') => {
    setBudgetToEdit(null);
    setBudgetToEdit({ category, month, year, limit: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (budget) => {
    setBudgetToEdit(budget);
    setIsModalOpen(true);
  };

  // Compile active budgets joined with spend figures
  const activeBudgetsJoined = budgets.map((b) => {
    const stat = summaryBreakdown.find((item) => item.category === b.category);
    const spent = stat ? stat.spent : 0;
    const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;

    return {
      id: b._id,
      category: b.category,
      limit: b.limit,
      spent,
      percent,
      month: b.month,
      year: b.year,
    };
  });

  // Identify categories without any set limits
  const unsetCategories = CATEGORIES.filter(
    (cat) => !budgets.some((b) => b.category === cat)
  );

  const monthsList = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <main className="main-content" id="budgets-page">
      <header className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Monthly Budget Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Define category ceilings to restrict spending warnings.
          </p>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            className="input-field"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="input-field"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            style={{ padding: '6px 12px', fontSize: '0.85rem', width: '90px' }}
          />
        </div>
      </header>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid-cols-3" style={{ alignItems: 'start', gap: '24px' }}>
          {/* Active Budgets List (Grid occupies 2 cols if wide) */}
          <div style={{ gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Active Budgets</h2>
            
            {activeBudgetsJoined.length === 0 ? (
              <div className="glass-card flex-center" style={{ minHeight: '200px', color: 'var(--text-muted)' }}>
                No active budget limits configured for this period.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeBudgetsJoined.map((b) => {
                  let progressColor = 'progress-safe';
                  if (b.percent >= 100) progressColor = 'progress-danger';
                  else if (b.percent >= 80) progressColor = 'progress-warn';

                  return (
                    <div key={b.id} className="glass-card" style={{ padding: '20px' }}>
                      <div className="flex-between" style={{ marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-family-title)' }}>
                            {b.category}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn-icon"
                            title="Edit Limit"
                            onClick={() => openEditModal({ category: b.category, limit: b.limit, month: b.month, year: b.year })}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn-icon"
                            title="Remove Limit"
                            style={{ color: 'var(--danger-color)' }}
                            onClick={() => handleDeleteBudget(b.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-family-title)' }}>
                          ${b.spent.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          of ${b.limit.toFixed(2)} limit
                        </span>
                      </div>

                      <div className="budget-progress-bar-bg">
                        <div
                          className={`budget-progress-bar-fill ${progressColor}`}
                          style={{ width: `${Math.min(Math.round(b.percent), 100)}%` }}
                        />
                      </div>

                      <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        <span>{Math.round(b.percent)}% Spent</span>
                        <span>
                          {b.spent > b.limit ? (
                            <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>
                              Over by ${(b.spent - b.limit).toFixed(2)}
                            </span>
                          ) : (
                            <span>${(b.limit - b.spent).toFixed(2)} left</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Add Section */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Limit Setup</h2>
            <div className="glass-card" style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
                Setup budget ceilings for other categories to track your spending limits.
              </p>
              
              {unsetCategories.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                  🎉 All categories configured!
                </div>
              ) : (
                <div className="budget-list" id="unset-budget-list">
                  {unsetCategories.map((cat) => (
                    <div key={cat} className="flex-between budget-item" style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat}</span>
                      <button
                        onClick={() => openAddModal(cat)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <PiggyBank size={12} />
                        <span>Set Limit</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBudget}
        budgetToEdit={budgetToEdit}
      />
    </main>
  );
};

export default BudgetsPage;
