import sqlite3
import os

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
DB_PATH = os.environ.get('SQLITE_DB_PATH', os.path.join(DB_DIR, 'expenseease.db'))

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create Categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
            color TEXT NOT NULL,
            icon TEXT NOT NULL
        )
    ''')

    # Create Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL CHECK(amount > 0),
            type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Seed Default Categories if empty
    cursor.execute('SELECT COUNT(*) FROM categories')
    if cursor.fetchone()[0] == 0:
        default_categories = [
            # Income categories
            ('Salary', 'income', '#10b981', 'Briefcase'),
            ('Freelance', 'income', '#06b6d4', 'Laptop'),
            ('Investments', 'income', '#8b5cf6', 'TrendingUp'),
            ('Gifts & Awards', 'income', '#ec4899', 'Gift'),
            ('Other Income', 'income', '#64748b', 'PlusCircle'),
            # Expense categories
            ('Food & Dining', 'expense', '#f97316', 'Utensils'),
            ('Housing & Rent', 'expense', '#ef4444', 'Home'),
            ('Transportation', 'expense', '#f59e0b', 'Car'),
            ('Utilities & Bills', 'expense', '#3b82f6', 'Zap'),
            ('Entertainment', 'expense', '#a855f7', 'Film'),
            ('Shopping', 'expense', '#ec4899', 'ShoppingBag'),
            ('Healthcare', 'expense', '#14b8a6', 'HeartPulse'),
            ('Education', 'expense', '#6366f1', 'GraduationCap'),
            ('Other Expense', 'expense', '#64748b', 'MoreHorizontal')
        ]
        cursor.executemany(
            'INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
            default_categories
        )

    # Seed initial demo transactions if empty
    cursor.execute('SELECT COUNT(*) FROM transactions')
    if cursor.fetchone()[0] == 0:
        demo_transactions = [
            ('Monthly Salary', 3500.00, 'income', 'Salary', '2026-10-01', 'October main salary direct deposit'),
            ('Freelance Web Design', 750.00, 'income', 'Freelance', '2026-10-15', 'Client landing page payment'),
            ('Apartment Rent', 1200.00, 'expense', 'Housing & Rent', '2026-10-02', 'October rent payment'),
            ('Grocery Supermarket', 185.50, 'expense', 'Food & Dining', '2026-10-05', 'Weekly groceries & household items'),
            ('Electricity & Internet', 120.00, 'expense', 'Utilities & Bills', '2026-10-10', 'Monthly utility bills'),
            ('Metro Subway Pass', 60.00, 'expense', 'Transportation', '2026-10-12', 'Monthly public transit card'),
            ('Dining with Friends', 74.25, 'expense', 'Food & Dining', '2026-10-20', 'Weekend dinner'),
            ('Books & Courses', 45.00, 'expense', 'Education', '2026-10-24', 'React & Python ebooks')
        ]
        cursor.executemany(
            'INSERT INTO transactions (title, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)',
            demo_transactions
        )

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully at:", DB_PATH)

