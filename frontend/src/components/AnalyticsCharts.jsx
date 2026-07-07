import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const CATEGORY_COLORS = {
  Food: 'hsl(38, 92%, 50%)',
  Utilities: 'hsl(217, 91%, 60%)',
  Entertainment: 'hsl(258, 90%, 66%)',
  Travel: 'hsl(190, 90%, 45%)',
  Shopping: 'hsl(327, 83%, 60%)',
  Health: 'hsl(142, 72%, 40%)',
  Other: 'hsl(220, 9%, 60%)',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '10px 14px',
          background: 'var(--card-bg-solid)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.85rem',
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
          {payload[0].name || payload[0].payload.month}
        </p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color || 'var(--primary-color)', margin: '2px 0' }}>
            {item.name}: ${parseFloat(item.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const CategoryPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex-center" style={{ height: '260px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        No transactions recorded for this period.
      </div>
    );
  }

  // Filter out items with 0 spent to keep pie chart readable
  const chartData = data
    .filter((item) => item.spent > 0)
    .map((item) => ({
      name: item.category,
      value: item.spent,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex-center" style={{ height: '260px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        No transactions recorded for this period.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || 'var(--primary-color)'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TrendAreaChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex-center" style={{ height: '260px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Inadequate data to calculate trends.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--secondary-color)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--secondary-color)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            name="Spent"
            type="monotone"
            dataKey="spent"
            stroke="var(--primary-color)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorSpent)"
          />
          <Area
            name="Budget"
            type="monotone"
            dataKey="budget"
            stroke="var(--secondary-color)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorBudget)"
          />
          <Legend verticalAlign="top" height={36} iconType="plainline" wrapperStyle={{ fontSize: '0.8rem' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
