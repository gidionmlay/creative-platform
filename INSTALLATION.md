# Installation Guide

This guide explains how to install and run the G DESIGN platform on a new machine running Windows 10 or Windows 11.

---

## Required Software

1. **Python 3.10+** — Download from [python.org](https://python.org)
   - During installation, check **"Add Python to PATH"**
2. **Git** (optional) — Download from [git-scm.com](https://git-scm.com)
3. **VS Code** (optional) — Download from [code.visualstudio.com](https://code.visualstudio.com)

---

## Step 1: Get the Project

**Option A — Download ZIP:**
1. Download the project ZIP file
2. Extract to a folder (e.g., `C:\G DESIGN`)

**Option B — Clone with Git:**
```bash
git clone <repository-url> "C:\G DESIGN"
cd "C:\G DESIGN"
```

---

## Step 2: Create a Virtual Environment

Open **Command Prompt** or **PowerShell** in the project folder:

```bash
cd backend
python -m venv venv
```

---

## Step 3: Activate the Virtual Environment

**Command Prompt:**
```bash
venv\Scripts\activate
```

**PowerShell:**
```bash
venv\Scripts\Activate.ps1
```

You should see `(venv)` appear at the beginning of the command line.

---

## Step 4: Install Dependencies

```bash
pip install django djangorestframework djangorestframework-authtoken django-cors-headers channels daphne pillow
```

> **Note**: The project does not include a `requirements.txt` file. The above command installs all required packages.

---

## Step 5: Run Database Migrations

```bash
python manage.py migrate
```

This creates the SQLite database and all required tables.

---

## Step 6: Create a Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

Follow the prompts:
- Enter a **username** (e.g., `admin`)
- Enter an **email address** (e.g., `admin@example.com`)
- Enter a **password** (e.g., `admin123`)

---

## Step 7: Start the Backend Server

```bash
python manage.py runserver
```

You should see output similar to:
```
Starting ASGI/Daphne version X.X.X development server...
Starting server at http://127.0.0.1:8000/
```

> **Important**: Keep this terminal window open while using the application.

---

## Step 8: Open the Frontend

The frontend consists of static HTML files. You can open them directly in a browser:

1. Open **File Explorer**
2. Navigate to the project folder
3. Go to `frontend/src/pages/public/`
4. Double-click `index.html`

Alternatively, use VS Code's **Live Server** extension for a better experience:
1. Install the "Live Server" extension in VS Code
2. Right-click `frontend/src/pages/public/index.html`
3. Select **"Open with Live Server"**

---

## Step 9: Login

1. Open `frontend/src/pages/auth/login.html` in your browser
2. Enter the superuser credentials you created in Step 6
3. You will be redirected to the admin dashboard

---

## Default URLs

| Page | URL |
|------|-----|
| Public Homepage | `frontend/src/pages/public/index.html` |
| Login | `frontend/src/pages/auth/login.html` |
| Admin Dashboard | `frontend/src/pages/dashboards/admin/index.html` |
| Django Admin | `http://127.0.0.1:8000/admin/` |
| API Base | `http://127.0.0.1:8000/api/v1/` |

---

## Troubleshooting

**"pip is not recognized"**
- Python was not added to PATH. Reinstall Python and check "Add Python to PATH".

**"venv is not installed"**
- Run: `python -m ensurepip --upgrade`

**Database errors**
- Delete `backend/db.sqlite3` and re-run `python manage.py migrate`

**Port already in use**
- Use a different port: `python manage.py runserver 8080`

**CORS errors in browser**
- The backend allows all origins in development. No action needed.
