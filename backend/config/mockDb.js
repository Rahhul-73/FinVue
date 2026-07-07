// In-memory Database Store for fallback mode
const bcrypt = require('bcryptjs');

const store = {
  users: [],
  expenses: [],
  budgets: [],
};

// Seed initial data for a beautiful initial experience
const seedMockData = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Seed default user
    const defaultUser = {
      _id: 'mock-user-id-111',
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      createdAt: new Date(),
    };
    
    store.users.push(defaultUser);
    
    // Seed budgets
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    store.budgets.push(
      { _id: 'b1', user: 'mock-user-id-111', category: 'Food', limit: 400, month: currentMonth, year: currentYear },
      { _id: 'b2', user: 'mock-user-id-111', category: 'Utilities', limit: 150, month: currentMonth, year: currentYear },
      { _id: 'b3', user: 'mock-user-id-111', category: 'Entertainment', limit: 200, month: currentMonth, year: currentYear }
    );
    
    // Seed expenses (past month and current month)
    const today = new Date();
    store.expenses.push(
      {
        _id: 'e1',
        user: 'mock-user-id-111',
        amount: 55.40,
        category: 'Food',
        description: 'Weekly Groceries at Trader Joe\'s',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
      },
      {
        _id: 'e2',
        user: 'mock-user-id-111',
        amount: 120.00,
        category: 'Utilities',
        description: 'Electric Bill',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
      },
      {
        _id: 'e3',
        user: 'mock-user-id-111',
        amount: 85.00,
        category: 'Entertainment',
        description: 'Movie night with friends',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
      },
      {
        _id: 'e4',
        user: 'mock-user-id-111',
        amount: 45.00,
        category: 'Food',
        description: 'Dinner takeout',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      },
      {
        _id: 'e5',
        user: 'mock-user-id-111',
        amount: 25.00,
        category: 'Travel',
        description: 'Uber ride',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4),
      }
    );
    
    // Seed older expenses for historical trend line
    for (let i = 5; i > 0; i--) {
      const pastDate = new Date(today.getFullYear(), today.getMonth() - i, 15);
      const m = pastDate.getMonth() + 1;
      const y = pastDate.getFullYear();
      
      // Budgets
      store.budgets.push(
        { _id: `b-p-${i}-1`, user: 'mock-user-id-111', category: 'Food', limit: 400, month: m, year: y },
        { _id: `b-p-${i}-2`, user: 'mock-user-id-111', category: 'Utilities', limit: 150, month: m, year: y }
      );
      
      // Expenses
      store.expenses.push(
        {
          _id: `e-p-${i}-1`,
          user: 'mock-user-id-111',
          amount: 200 + Math.random() * 150,
          category: 'Food',
          description: 'Monthly Groceries',
          date: pastDate,
        },
        {
          _id: `e-p-${i}-2`,
          user: 'mock-user-id-111',
          amount: 100 + Math.random() * 50,
          category: 'Utilities',
          description: 'Utility Bills',
          date: pastDate,
        }
      );
    }
    
    console.log('Mock database seeded with demo credentials: demo@example.com / password123');
  } catch (error) {
    console.error('Failed to seed mock database:', error);
  }
};

// Run seed immediately
seedMockData();

const generateId = () => Math.random().toString(36).substring(2, 9);

module.exports = {
  store,
  
  // Auth Operations
  users: {
    findByEmail: async (email) => {
      return store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    findById: async (id) => {
      return store.users.find(u => u._id === id);
    },
    create: async ({ name, email, password }) => {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = {
        _id: generateId(),
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      };
      store.users.push(user);
      return user;
    }
  },

  // Expense Operations
  expenses: {
    find: async (userId, filters = {}) => {
      let result = store.expenses.filter(e => e.user === userId);
      
      if (filters.category) {
        result = result.filter(e => e.category === filters.category);
      }
      
      if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        result = result.filter(e => regex.test(e.description));
      }
      
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        result = result.filter(e => new Date(e.date) >= start);
      }
      
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        result = result.filter(e => new Date(e.date) <= end);
      }

      // Sort
      const sortBy = filters.sortBy || 'date:desc';
      const [field, direction] = sortBy.split(':');
      const dirMultiplier = direction === 'desc' ? -1 : 1;
      
      result.sort((a, b) => {
        if (field === 'date') {
          return (new Date(a.date) - new Date(b.date)) * dirMultiplier;
        }
        if (field === 'amount') {
          return (a.amount - b.amount) * dirMultiplier;
        }
        return 0;
      });

      return result;
    },
    
    findById: async (id) => {
      return store.expenses.find(e => e._id === id);
    },
    
    create: async (userId, { amount, category, description, date }) => {
      const expense = {
        _id: generateId(),
        user: userId,
        amount,
        category,
        description,
        date: date ? new Date(date) : new Date(),
        createdAt: new Date(),
      };
      store.expenses.push(expense);
      return expense;
    },
    
    findByIdAndUpdate: async (id, { amount, category, description, date }) => {
      const idx = store.expenses.findIndex(e => e._id === id);
      if (idx === -1) return null;
      
      store.expenses[idx] = {
        ...store.expenses[idx],
        amount: amount !== undefined ? amount : store.expenses[idx].amount,
        category: category || store.expenses[idx].category,
        description: description !== undefined ? description : store.expenses[idx].description,
        date: date ? new Date(date) : store.expenses[idx].date,
        updatedAt: new Date(),
      };
      
      return store.expenses[idx];
    },
    
    deleteOne: async (id) => {
      const idx = store.expenses.findIndex(e => e._id === id);
      if (idx !== -1) {
        store.expenses.splice(idx, 1);
        return true;
      }
      return false;
    }
  },

  // Budget Operations
  budgets: {
    find: async (userId, month, year) => {
      return store.budgets.filter(b => b.user === userId && b.month === month && b.year === year);
    },
    
    findById: async (id) => {
      return store.budgets.find(b => b._id === id);
    },
    
    setBudget: async (userId, { category, limit, month, year }) => {
      const idx = store.budgets.findIndex(
        b => b.user === userId && b.category === category && b.month === month && b.year === year
      );
      
      if (idx !== -1) {
        store.budgets[idx].limit = limit;
        store.budgets[idx].updatedAt = new Date();
        return store.budgets[idx];
      } else {
        const budget = {
          _id: generateId(),
          user: userId,
          category,
          limit,
          month,
          year,
          createdAt: new Date(),
        };
        store.budgets.push(budget);
        return budget;
      }
    },
    
    deleteOne: async (id) => {
      const idx = store.budgets.findIndex(b => b._id === id);
      if (idx !== -1) {
        store.budgets.splice(idx, 1);
        return true;
      }
      return false;
    }
  }
};
