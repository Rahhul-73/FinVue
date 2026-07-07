import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from './ExpenseModal';

const BudgetModal = ({ isOpen, onClose, onSave, budgetToEdit }) => {
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category || 'Food');
      setLimit(budgetToEdit.limit);
      setMonth(budgetToEdit.month || new Date().getMonth() + 1);
      setYear(budgetToEdit.year || new Date().getFullYear());
    } else {
      setCategory('Food');
      setLimit('');
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
    }
    setErrors({});
  }, [budgetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const formErrors = {};
    if (!limit || parseFloat(limit) < 0) {
      formErrors.limit = 'Please enter a valid budget limit (0 or greater)';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      category,
      limit: parseFloat(limit),
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    };

    const success = await onSave(payload);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
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
    <div className="modal-overlay" onClick={onClose} id="budget-modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} id="budget-modal-content">
        <button className="btn-icon modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title" id="budget-modal-title">
            {budgetToEdit ? 'Adjust Budget Ceiling' : 'Establish Category Budget'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Configure spending boundaries for your categories.
          </p>
        </div>

        <form onSubmit={handleSubmit} id="budget-form">
          <div className="form-group">
            <label htmlFor="bud-category">Category *</label>
            <select
              id="bud-category"
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!budgetToEdit} // Lock category if editing
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bud-limit">Monthly Limit ($) *</label>
            <input
              type="number"
              id="bud-limit"
              className="input-field"
              placeholder="e.g. 500"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
            {errors.limit && <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.limit}</span>}
          </div>

          <div className="grid-cols-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="bud-month">Month *</label>
              <select
                id="bud-month"
                className="input-field"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={!!budgetToEdit} // Lock period if editing
                required
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bud-year">Year *</label>
              <input
                type="number"
                id="bud-year"
                className="input-field"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={!!budgetToEdit} // Lock period if editing
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="budget-save-btn">
              {isSubmitting ? 'Saving...' : budgetToEdit ? 'Update Limit' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
