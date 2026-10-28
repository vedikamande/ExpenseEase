import unittest
import os
import json
import tempfile
import sys

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import database
from app import app

class ExpenseEaseTestCase(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.temp_db_path = tempfile.mkstemp()
        database.DB_PATH = self.temp_db_path
        database.init_db()
        self.client = app.test_client()

    def tearDown(self):
        os.close(self.db_fd)
        if os.path.exists(self.temp_db_path):
            os.remove(self.temp_db_path)

    def test_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['database'], 'connected')

    def test_get_categories(self):
        res = self.client.get('/api/categories')
        self.assertEqual(res.status_code, 200)
        categories = res.get_json()
        self.assertGreater(len(categories), 0)

    def test_create_and_get_transaction(self):
        # Create an expense
        payload = {
            'title': 'Test Groceries',
            'amount': 55.40,
            'type': 'expense',
            'category': 'Food & Dining',
            'date': '2026-10-25',
            'notes': 'Unit test note'
        }
        res = self.client.post('/api/transactions', json=payload)
        self.assertEqual(res.status_code, 201)
        created = res.get_json()
        self.assertEqual(created['title'], 'Test Groceries')
        self.assertEqual(created['amount'], 55.40)
        self.assertEqual(created['type'], 'expense')

        # Retrieve created transaction
        get_res = self.client.get(f"/api/transactions/{created['id']}")
        self.assertEqual(get_res.status_code, 200)
        retrieved = get_res.get_json()
        self.assertEqual(retrieved['id'], created['id'])

    def test_invalid_transaction_creation(self):
        # Negative amount
        res = self.client.post('/api/transactions', json={
            'title': 'Bad Amount',
            'amount': -10,
            'type': 'expense',
            'category': 'Food & Dining'
        })
        self.assertEqual(res.status_code, 400)

        # Invalid type
        res = self.client.post('/api/transactions', json={
            'title': 'Bad Type',
            'amount': 100,
            'type': 'invalid_type',
            'category': 'Food & Dining'
        })
        self.assertEqual(res.status_code, 400)

    def test_update_and_delete_transaction(self):
        # Create
        res = self.client.post('/api/transactions', json={
            'title': 'To be updated',
            'amount': 100.0,
            'type': 'income',
            'category': 'Salary',
            'date': '2026-10-01'
        })
        tx_id = res.get_json()['id']

        # Update
        update_res = self.client.put(f'/api/transactions/{tx_id}', json={
            'title': 'Updated Title',
            'amount': 150.0
        })
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.get_json()['title'], 'Updated Title')
        self.assertEqual(update_res.get_json()['amount'], 150.0)

        # Delete
        delete_res = self.client.delete(f'/api/transactions/{tx_id}')
        self.assertEqual(delete_res.status_code, 200)

        # Confirm 404
        check_res = self.client.get(f'/api/transactions/{tx_id}')
        self.assertEqual(check_res.status_code, 404)

    def test_summary_calculation(self):
        res = self.client.get('/api/summary')
        self.assertEqual(res.status_code, 200)
        summary = res.get_json()
        self.assertIn('total_income', summary)
        self.assertIn('total_expenses', summary)
        self.assertIn('net_balance', summary)
        self.assertIn('category_breakdown', summary)
        self.assertIn('monthly_trend', summary)

if __name__ == '__main__':
    unittest.main()

