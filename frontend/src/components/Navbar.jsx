import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, Receipt, PiggyBank, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar" id="main-nav">
      <div className="navbar-inner">
        <div className="nav-brand">
          <span>FinVue</span>
        </div>

        <div className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-link-dashboard"
          >
            <LayoutDashboard size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Dashboard
          </NavLink>
          <NavLink
            to="/expenses"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-link-expenses"
          >
            <Receipt size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Expenses
          </NavLink>
          <NavLink
            to="/budgets"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-link-budgets"
          >
            <PiggyBank size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Budgets
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-link-analytics"
          >
            <BarChart3 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Analytics
          </NavLink>
        </div>

        <div className="nav-actions">
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Hi, {user.name}
          </span>
          
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            id="logout-btn"
            title="Secure Logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
