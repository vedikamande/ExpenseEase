import os
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from database import init_db, get_db_connection

app = Flask(__name__)

# Handle CORS: Use flask_cors if available, or custom headers
try:
    from flask_cors import CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
except ImportError:
    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

# Handle preflight OPTIONS requests
@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        res = jsonify({'status': 'ok'})
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return res, 200

# ----------------- Health Check -----------------
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        conn.execute('SELECT 1')
        conn.close()
        return jsonify({
            'status': 'healthy',
            'service': 'ExpenseEase API',
            'database': 'connected',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

# ----------------- Categories API -----------------
@app.route('/api/categories', methods=['GET'])
def get_categories():
    type_filter = request.args.get('type')
    conn = get_db_connection()
    if type_filter:
        categories = conn.execute(
            'SELECT * FROM categories WHERE type = ? ORDER BY name ASC',
            (type_filter,)
        ).fetchall()
    else:
        categories = conn.execute(
            'SELECT * FROM categories ORDER BY type ASC, name ASC'
        ).fetchall()
    conn.close()
    return jsonify([dict(c) for c in categories]), 200

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    cat_type = data.get('type', '').strip().lower()
    color = data.get('color', '#6366f1').strip()
    icon = data.get('icon', 'Tag').strip()

    if not name or cat_type not in ('income', 'expense'):
        return jsonify({'error': 'Name and valid type (income/expense) are required'}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
            (name, cat_type, color, icon)
        )
        conn.commit()
        cat_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': cat_id, 'name': name, 'type': cat_type, 'color': color, 'icon': icon}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': 'Category already exists or invalid data'}), 400

# ----------------- Transactions API -----------------
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    tx_type = request.args.get('type')
    category = request.args.get('category')
    search = request.args.get('search', '').strip()
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    sort_by = request.args.get('sort_by', 'date')
    order = request.args.get('order', 'desc').lower()

    valid_sort_cols = {'date': 'date', 'amount': 'amount', 'title': 'title', 'id': 'id'}
    sort_col = valid_sort_cols.get(sort_by, 'date')
    sort_order = 'ASC' if order == 'asc' else 'DESC'

    query = 'SELECT * FROM transactions WHERE 1=1'
    params = []

    if tx_type and tx_type.lower() in ('income', 'expense'):
        query += ' AND type = ?'
        params.append(tx_type.lower())

    if category and category.lower() != 'all':
        query += ' AND category = ?'
        params.append(category)

    if search:
        query += ' AND (title LIKE ? OR notes LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%'])

    if start_date:
        query += ' AND date >= ?'
        params.append(start_date)

    if end_date:
        query += ' AND date <= ?'
        params.append(end_date)

    query += f' ORDER BY {sort_col} {sort_order}, id DESC'

    conn = get_db_connection()
    transactions = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify([dict(t) for t in transactions]), 200

@app.route('/api/transactions/<int:tx_id>', methods=['GET'])
def get_transaction(tx_id):
    conn = get_db_connection()
    tx = conn.execute('SELECT * FROM transactions WHERE id = ?', (tx_id,)).fetchone()
    conn.close()
    if tx is None:
        return jsonify({'error': 'Transaction not found'}), 404
    return jsonify(dict(tx)), 200

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    amount = data.get('amount')
    tx_type = data.get('type', '').strip().lower()
    category = data.get('category', '').strip()
    date_str = data.get('date', '').strip()
    notes = data.get('notes', '').strip()

    errors = []
    if not title:
        errors.append('Title is required')
    try:
        amount = float(amount)
        if amount <= 0:
            errors.append('Amount must be greater than 0')
    except (ValueError, TypeError):
        errors.append('Valid numeric amount is required')

    if tx_type not in ('income', 'expense'):
        errors.append("Type must be 'income' or 'expense'")

    if not category:
        errors.append('Category is required')

    if not date_str:
        date_str = datetime.today().strftime('%Y-%m-%d')
    else:
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            errors.append('Date must be in YYYY-MM-DD format')

    if errors:
        return jsonify({'errors': errors}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO transactions (title, amount, type, category, date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (title, amount, tx_type, category, date_str, notes))
    conn.commit()
    new_id = cursor.lastrowid
    new_tx = conn.execute('SELECT * FROM transactions WHERE id = ?', (new_id,)).fetchone()
    conn.close()

    return jsonify(dict(new_tx)), 201

@app.route('/api/transactions/<int:tx_id>', methods=['PUT'])
def update_transaction(tx_id):
    conn = get_db_connection()
    existing = conn.execute('SELECT * FROM transactions WHERE id = ?', (tx_id,)).fetchone()
    if existing is None:
        conn.close()
        return jsonify({'error': 'Transaction not found'}), 404

    data = request.get_json() or {}
    title = data.get('title', existing['title']).strip()
    amount = data.get('amount', existing['amount'])
    tx_type = data.get('type', existing['type']).strip().lower()
    category = data.get('category', existing['category']).strip()
    date_str = data.get('date', existing['date']).strip()
    notes = data.get('notes', existing['notes'])

    errors = []
    if not title:
        errors.append('Title cannot be empty')
    try:
        amount = float(amount)
        if amount <= 0:
            errors.append('Amount must be greater than 0')
    except (ValueError, TypeError):
        errors.append('Valid numeric amount is required')

    if tx_type not in ('income', 'expense'):
        errors.append("Type must be 'income' or 'expense'")

    if not category:
        errors.append('Category cannot be empty')

    try:
        datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        errors.append('Date must be in YYYY-MM-DD format')

    if errors:
        conn.close()
        return jsonify({'errors': errors}), 400

    conn.execute('''
        UPDATE transactions
        SET title = ?, amount = ?, type = ?, category = ?, date = ?, notes = ?
        WHERE id = ?
    ''', (title, amount, tx_type, category, date_str, notes, tx_id))
    conn.commit()
    updated = conn.execute('SELECT * FROM transactions WHERE id = ?', (tx_id,)).fetchone()
    conn.close()

    return jsonify(dict(updated)), 200

@app.route('/api/transactions/<int:tx_id>', methods=['DELETE'])
def delete_transaction(tx_id):
    conn = get_db_connection()
    existing = conn.execute('SELECT * FROM transactions WHERE id = ?', (tx_id,)).fetchone()
    if existing is None:
        conn.close()
        return jsonify({'error': 'Transaction not found'}), 404

    conn.execute('DELETE FROM transactions WHERE id = ?', (tx_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Transaction deleted successfully', 'id': tx_id}), 200

# ----------------- Analytics & Summary API -----------------
@app.route('/api/summary', methods=['GET'])
def get_summary():
    conn = get_db_connection()

    # Totals
    income_row = conn.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income'"
    ).fetchone()
    expense_row = conn.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense'"
    ).fetchone()

    total_income = float(income_row[0])
    total_expense = float(expense_row[0])
    net_balance = total_income - total_expense
    savings_rate = round(((total_income - total_expense) / total_income * 100), 1) if total_income > 0 else 0.0

    # Expense Category breakdown
    cat_rows = conn.execute('''
        SELECT t.category, COALESCE(c.color, '#6366f1') as color,
               SUM(t.amount) as total, COUNT(t.id) as count
        FROM transactions t
        LEFT JOIN categories c ON t.category = c.name
        WHERE t.type = 'expense'
        GROUP BY t.category
        ORDER BY total DESC
    ''').fetchall()

    category_breakdown = []
    for r in cat_rows:
        total = float(r['total'])
        pct = round((total / total_expense * 100), 1) if total_expense > 0 else 0
        category_breakdown.append({
            'category': r['category'],
            'total': total,
            'count': r['count'],
            'percentage': pct,
            'color': r['color']
        })

    # Monthly Trends (last 6 months)
    monthly_rows = conn.execute('''
        SELECT strftime('%Y-%m', date) as month,
               COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
               COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
        FROM transactions
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month ASC
        LIMIT 6
    ''').fetchall()

    monthly_trend = [
        {
            'month': r['month'],
            'income': float(r['income']),
            'expense': float(r['expense']),
            'balance': float(r['income']) - float(r['expense'])
        }
        for r in monthly_rows
    ]

    # Transaction count
    count_row = conn.execute('SELECT COUNT(*) FROM transactions').fetchone()
    tx_count = count_row[0]

    conn.close()

    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expense,
        'net_balance': net_balance,
        'savings_rate': savings_rate,
        'total_transactions': tx_count,
        'category_breakdown': category_breakdown,
        'monthly_trend': monthly_trend
    }), 200

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"Starting ExpenseEase backend server on http://localhost:{port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)
