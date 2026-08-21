import os
import re
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session

app = Flask(__name__)
app.secret_key = os.urandom(24)
DATABASE = 'inquiries.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                visa_type TEXT NOT NULL,
                country TEXT NOT NULL,
                education TEXT NOT NULL,
                experience TEXT NOT NULL,
                message TEXT,
                created_at TEXT NOT NULL
            )
        ''')
        conn.commit()

# Initialize the database on startup
init_db()

@app.route('/')
def index():
    # Render main index page
    # In a real app we might pass dynamic data like latest news or testimonials, but Jinja covers navbar/footer
    latest_news = [
        "Australian Immigration welcomes new immigrants under new subclass 491. Contact for eligibility.",
        "Express Entry and Provincial Nominee Program (PNP) details for 2024-2026 - Canada visa options are now open.",
        "UK Student Visa updates: New rules for international student dependents. Consult our advisors today."
    ]
    return render_template('index.html', latest_news=latest_news)

@app.route('/submit-inquiry', methods=['POST'])
def submit_inquiry():
    try:
        # Get form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form

        # Get and clean data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        visa_type = data.get('visa_type', '').strip()
        country = data.get('country', '').strip()
        education = data.get('education', '').strip()
        experience = data.get('experience', '').strip()
        message = data.get('message', '').strip()

        # ==========================================================
        # REQUIRED FIELD VALIDATION
        # ==========================================================

        if not all([
            name,
            email,
            phone,
            visa_type,
            country,
            education,
            experience
        ]):
            return jsonify({
                'success': False,
                'message': 'Please fill out all required fields.'
            }), 400


        # ==========================================================
        # NAME VALIDATION
        # Allows letters, spaces, dots, apostrophes and hyphens
        # ==========================================================

        if len(name) < 2:
            return jsonify({
                'success': False,
                'message': 'Please enter a valid full name.'
            }), 400

        if not re.fullmatch(r"[A-Za-zÀ-ÿ\s.'-]+", name):
            return jsonify({
                'success': False,
                'message': 'Name should contain only letters.'
            }), 400


        # ==========================================================
        # EMAIL VALIDATION
        # ==========================================================

        email_pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'

        if not re.fullmatch(email_pattern, email):
            return jsonify({
                'success': False,
                'message': 'Please enter a valid email address.'
            }), 400


        # ==========================================================
        # PHONE NUMBER VALIDATION
        # Allows:
        # +91 9876543210
        # 9876543210
        # 98765 43210
        # 98765-43210
        # ==========================================================

        cleaned_phone = re.sub(r'[\s()-]', '', phone)

        if cleaned_phone.startswith('+'):
            phone_digits = cleaned_phone[1:]
        else:
            phone_digits = cleaned_phone

        # Only digits after removing +, spaces, brackets and hyphens
        if not phone_digits.isdigit():
            return jsonify({
                'success': False,
                'message': 'Phone number can contain only numbers.'
            }), 400

        # Generic international phone validation
        if len(phone_digits) < 10 or len(phone_digits) > 10:
            return jsonify({
                'success': False,
                'message': 'Please enter a valid phone number.'
            }), 400


        # ==========================================================
        # MESSAGE LENGTH VALIDATION
        # ==========================================================

        if len(message) > 500:
            return jsonify({
                'success': False,
                'message': 'Message is too long. Maximum 500 characters allowed.'
            }), 400


        # ==========================================================
        # SAVE TO DATABASE
        # ==========================================================

        created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        with sqlite3.connect(DATABASE) as conn:

            conn.execute('''
                INSERT INTO inquiries
                (
                    name,
                    email,
                    phone,
                    visa_type,
                    country,
                    education,
                    experience,
                    message,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                name,
                email,
                phone,
                visa_type,
                country,
                education,
                experience,
                message,
                created_at
            ))

            conn.commit()


        # ==========================================================
        # SUCCESS RESPONSE
        # ==========================================================

        return jsonify({
            'success': True,
            'message': 'Thank you! We got your details. We will contact you soon.'
        })


    except Exception as e:

        print(f'Inquiry submission error: {str(e)}')

        return jsonify({
            'success': False,
            'message': 'Something went wrong. Please try again later.'
        }), 500


@app.route('/admin/inquiries')
def admin_inquiries():
    # Admin dashboard showing all submissions
    # For a real app, you'd want authentication, but for demonstration, let's keep it open or simple.
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM inquiries ORDER BY created_at DESC')
        inquiries = cursor.fetchall()
        conn.close()
        return render_template('admin.html', inquiries=inquiries)
    except Exception as e:
        return f"Database error: {str(e)}", 500

@app.route('/admin/inquiries/delete/<int:inquiry_id>', methods=['POST'])
def delete_inquiry(inquiry_id):
    try:
        with sqlite3.connect(DATABASE) as conn:
            conn.execute('DELETE FROM inquiries WHERE id = ?', (inquiry_id,))
            conn.commit()
        flash('Inquiry deleted successfully!', 'success')
    except Exception as e:
        flash(f'Error deleting inquiry: {str(e)}', 'error')
    return redirect(url_for('admin_inquiries'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
