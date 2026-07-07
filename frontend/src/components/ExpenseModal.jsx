import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Utilities',
  'Entertainment',
  'Travel',
  'Shopping',
  'Health',
  'Other',
];

const ExpenseModal = ({ isOpen, onClose, onSave, expenseToEdit }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount);
      setCategory(expenseToEdit.category || 'Food');
      setDescription(expenseToEdit.description || '');
      // Format date to YYYY-MM-DD
      const expDate = expenseToEdit.date ? new Date(expenseToEdit.date) : new Date();
      setDate(expDate.toISOString().split('T')[0]);
    } else {
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setErrors({});
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Client-side validations
    const formErrors = {};
    if (!amount || parseFloat(amount) <= 0) {
      formErrors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!category) {
      formErrors.category = 'Please select a category';
    }
    if (!date) {
      formErrors.date = 'Please select a date';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date).toISOString(),
    };

    const success = await onSave(payload, expenseToEdit?._id);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="expense-modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} id="expense-modal-content">
        <button className="btn-icon modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title" id="expense-modal-title">
            {expenseToEdit ? 'Edit Expense Record' : 'Add Expense Record'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Record details about your transaction.
          </p>
        </div>

        <form onSubmit={handleSubmit} id="expense-form">
          <div className="form-group">
            <label htmlFor="exp-amount">Amount ($) *</label>
            <input
              type="number"
              id="exp-amount"
              className="input-field"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {errors.amount && <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="exp-category">Category *</label>
            <select
              id="exp-category"
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="exp-date">Date *</label>
            <input
              type="date"
              id="exp-date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            {errors.date && <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="exp-description">Description</label>
            <input
              type="text"
              id="exp-description"
              className="input-field"
              placeholder="e.g. Weekly grocery shopping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="expense-save-btn">
              {isSubmitting ? 'Saving...' : expenseToEdit ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
export { CATEGORIES };
