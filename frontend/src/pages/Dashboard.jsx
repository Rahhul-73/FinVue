import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CategoryProgress from '../components/CategoryProgress';
import ExpenseModal from '../components/ExpenseModal';
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Receipt,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalSpent: 0, avgSpent: 0, count: 0, breakdown: [] });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      // Fetch analytics summary
      const summaryRes = await fetch(`/api/analytics/summary?month=${month}&year=${year}`);
      const summaryData = await summaryRes.json();

      // Fetch 5 recent expenses
      const expensesRes = await fetch('/api/expenses?limit=5');
      const expensesData = await expensesRes.json();

      if (summaryData.success && expensesData.success) {
        setSummary(summaryData.summary);
        setRecentExpenses(expensesData.expenses);
      } else {
        setError('Failed to fetch dashboard records.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection issues with server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveExpense = async (payload) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh dashboard data
        fetchDashboardData();
        return true;
      } else {
        alert(data.message || 'Failed to save expense');
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Compute Dashboard Metrics
  const totalSpent = summary.totalSpent;
  const totalBudget = summary.breakdown.reduce((sum, item) => sum + (item.limit || 0), 0);
  
  // Find top spending category
  const topCategoryItem = summary.breakdown.reduce(
    (max, item) => (item.spent > (max?.spent || 0) ? item : max),
    null
  );
  
  // Exceeded budgets listing for alarm banners
  const exceededBudgets = summary.breakdown.filter(
    (item) => item.limit > 0 && item.spent > item.limit
  );

  // Compute compliance score
  const budgetItems = summary.breakdown.filter((item) => item.limit > 0);
  const compliantCount = budgetItems.filter((item) => item.spent <= item.limit).length;
  const complianceScore =
    budgetItems.length > 0 ? Math.round((compliantCount / budgetItems.length) * 100) : 100;

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="main-content" id="dashboard-page">
      <header className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Financial Summary</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Overview for {currentMonthName} {new Date().getFullYear()}
          </p>
        </div>
        
        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="btn btn-primary"
          id="quick-add-expense-btn"
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </header>

      {/* Alarms Banner */}
      {exceededBudgets.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          {exceededBudgets.map((b, idx) => (
            <div key={idx} className="alert alert-danger" style={{ marginBottom: '10px' }}>
              <AlertTriangle size={18} />
              <div>
                <strong>Budget Exceeded Alert:</strong> Your spending on <strong>{b.category}</strong> (${b.spent.toFixed(2)}) is over limit by <strong>${(b.spent - b.limit).toFixed(2)}</strong>!
              </div>
            </div>
          ))}
        </section>
      )}

      {/* KPI Cards Grid */}
      <section className="stats-grid" id="stats-section">
        {/* Total Spent */}
        <div className="glass-card stat-card">
          <div className="flex-between stat-header">
            <span className="stat-title">Total Spend</span>
            <div className="flex-center stat-icon">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="stat-value">${totalSpent.toFixed(2)}</div>
          <div className="stat-desc">Accumulated this month</div>
        </div>

        {/* Total Budget */}
        <div className="glass-card stat-card">
          <div className="flex-between stat-header">
            <span className="stat-title">Total Budget</span>
            <div className="flex-center stat-icon" style={{ color: 'var(--secondary-color)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="stat-value">${totalBudget.toFixed(2)}</div>
          <div className="stat-desc">Assigned limits combined</div>
        </div>

        {/* Top Category */}
        <div className="glass-card stat-card">
          <div className="flex-between stat-header">
            <span className="stat-title">Top Spent Category</span>
            <div className="flex-center stat-icon" style={{ color: 'var(--warning-color)' }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="stat-value">
            {topCategoryItem ? topCategoryItem.category : 'N/A'}
          </div>
          <div className="stat-desc">
            {topCategoryItem ? `$${topCategoryItem.spent.toFixed(2)} spent` : 'No transactions recorded'}
          </div>
        </div>

        {/* Compliance Rating */}
        <div className="glass-card stat-card">
          <div className="flex-between stat-header">
            <span className="stat-title">Compliance Rating</span>
            <div className="flex-center stat-icon" style={{ color: 'var(--success-color)' }}>
              <Award size={16} />
            </div>
          </div>
          <div className="stat-value">{complianceScore}%</div>
          <div className="stat-desc">
            {complianceScore === 100
              ? 'All budgets within bounds'
              : `${compliantCount} of ${budgetItems.length} active limits respected`}
          </div>
        </div>
      </section>

      {/* Main Section layout */}
      <section className="dashboard-grid">
        {/* Category breakdown columns */}
        <div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Category Utilization</span>
          </h2>
          
          {summary.breakdown.length === 0 ? (
            <div className="glass-card flex-center" style={{ minHeight: '200px', color: 'var(--text-muted)' }}>
              No budget limits or transactions set up for this month yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="category-progress-grid">
              {summary.breakdown.map((item, index) => (
                <CategoryProgress
                  key={index}
                  category={item.category}
                  spent={item.spent}
                  limit={item.limit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Recent Expenses</h2>
            <Link to="/expenses" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} id="view-all-expenses-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="glass-card">
            {recentExpenses.length === 0 ? (
              <div className="flex-center" style={{ minHeight: '200px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No recent transactions recorded.
              </div>
            ) : (
              <div className="transaction-list" id="recent-expenses-list">
                {recentExpenses.map((expense) => {
                  const badgeClass = `badge badge-${expense.category.toLowerCase()}`;
                  const expDate = new Date(expense.date);
                  
                  return (
                    <div key={expense._id} className="transaction-item">
                      <div className="transaction-info">
                        <div className="flex-center transaction-icon">
                          <Receipt size={16} />
                        </div>
                        <div>
                          <div className="transaction-desc">
                            {expense.description || `${expense.category} transaction`}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                            <span className={badgeClass}>{expense.category}</span>
                            <span className="transaction-date">
                              {expDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="transaction-amount">
                        -${expense.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Expense Addition modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
      />
    </main>
  );
};

export default Dashboard;
