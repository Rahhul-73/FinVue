import React, { useState, useEffect } from 'react';
import { CategoryPieChart, TrendAreaChart } from '../components/AnalyticsCharts';
import { Calendar, BarChart3, PieChart, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

const AnalyticsPage = () => {
  const [summary, setSummary] = useState({ totalSpent: 0, avgSpent: 0, count: 0, breakdown: [] });
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Month & Year Selector
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch summary breakdown
      const summaryRes = await fetch(`/api/analytics/summary?month=${month}&year=${year}`);
      const summaryData = await summaryRes.json();

      // Fetch 6-month historical trend
      const trendRes = await fetch('/api/analytics/trend');
      const trendDataRes = await trendRes.json();

      if (summaryData.success && trendDataRes.success) {
        setSummary(summaryData.summary);
        setTrendData(trendDataRes.trend);
      } else {
        setError('Failed to fetch analytics statistics.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection issue during aggregate fetch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [month, year]);

  // Compute insights
  const totalSpent = summary.totalSpent;
  const avgSpent = summary.avgSpent;
  const count = summary.count;

  // Filter breakdown to get categories with positive spent
  const activeBreakdown = summary.breakdown.filter((item) => item.spent > 0);
  
  // Find highest category
  const topCategory = activeBreakdown.reduce(
    (max, item) => (item.spent > (max?.spent || 0) ? item : max),
    null
  );

  // Find category over budget
  const overBudgetCategories = summary.breakdown.filter(
    (item) => item.limit > 0 && item.spent > item.limit
  );

  // Dynamic savings tip generator
  const getSavingsTip = () => {
    if (activeBreakdown.length === 0) {
      return 'Log some transactions and configure budgets to retrieve automated financial suggestions.';
    }
    
    if (overBudgetCategories.length > 0) {
      const cats = overBudgetCategories.map((c) => c.category).join(', ');
      return `Warning: You have exceeded your budget limits on ${cats}. Try adjusting limits or cutting down non-essential transactions in these sectors.`;
    }

    if (topCategory && topCategory.spent > totalSpent * 0.4) {
      return `Tip: Your spending on "${topCategory.category}" accounts for over 40% of your total budget. Look for ways to downsize expenses in this category.`;
    }

    return 'Insight: Nice job! All active budget limits are being respected. Keep tracking to meet your monthly savings goal.';
  };

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
    <main className="main-content" id="analytics-page">
      <header className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Analytics & Insights</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Interactive charts detailing category allocations and monthly trends.
          </p>
        </div>

        {/* Period selection */}
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
        <div className="flex-center" style={{ minHeight: '40vh' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Charts Row */}
          <div className="grid-cols-2">
            {/* Category breakdown */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} style={{ color: 'var(--primary-color)' }} />
                <span>Category Breakdown</span>
              </h2>
              <CategoryPieChart data={summary.breakdown} />
            </div>

            {/* Monthly Trend */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} style={{ color: 'var(--secondary-color)' }} />
                <span>Monthly Spending Trend</span>
              </h2>
              <TrendAreaChart data={trendData} />
            </div>
          </div>

          {/* Numerical Analytics summaries + Savings Insight */}
          <div className="grid-cols-3" style={{ gap: '24px' }}>
            {/* Summary statistics */}
            <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '24px', textAlign: 'center' }}>
              <TrendingUp size={24} style={{ color: 'var(--primary-color)', marginBottom: '10px' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Average Expense Size
              </span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', fontFamily: 'var(--font-family-title)' }}>
                ${avgSpent.toFixed(2)}
              </span>
            </div>

            <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '24px', textAlign: 'center' }}>
              <Calendar size={24} style={{ color: 'var(--secondary-color)', marginBottom: '10px' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Transaction Count
              </span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', fontFamily: 'var(--font-family-title)' }}>
                {count}
              </span>
            </div>

            {/* AI Automated Insight panel */}
            <div
              className="glass-card"
              style={{
                gridColumn: 'span 1',
                padding: '24px',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(6, 182, 212, 0.05))',
              }}
            >
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary-color)' }} />
                <span>Smart Financial Advisor</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {getSavingsTip()}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AnalyticsPage;
