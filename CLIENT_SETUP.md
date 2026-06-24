# Client Setup Guide

This guide is for non-technical users. It explains how to run G DESIGN on your computer.

---

## Step 1: Start the Backend

1. Open the project folder
2. Double-click the file named `start-backend.bat` (if available)

**OR** follow these steps:

1. Press the **Windows Key** and type `cmd`, then press Enter
2. Type the following commands one by one (press Enter after each):

```bash
cd "C:\path\to\G DESIGN\backend"
venv\Scripts\activate
python manage.py runserver
```

3. A window will open showing messages. **Do not close this window.**

---

## Step 2: Open the Website

1. Open your browser (Chrome, Edge, or Firefox)
2. Go to the `frontend` folder in the project
3. Open `frontend/src/pages/auth/login.html`

**OR** open this file in the browser:
- Open File Explorer
- Navigate to the project folder
- Go to: `frontend/src/pages/auth/`
- Double-click `login.html`

---

## Step 3: Login

Use one of these accounts:

**Admin Account**
- Username: (the one you created during installation)
- Password: (the one you created during installation)

**What you can do as Admin:**
- View analytics dashboard
- Manage users
- Manage services
- Approve/reject requests
- Manage projects
- Manage courses
- Manage website content

**Client Account** (register a new one or use existing)
- Go to the login page
- Click "Register"
- Fill in your details
- Select "Client" as your role
- Login with your new account

**What you can do as Client:**
- Browse services
- Submit service requests
- Track project progress
- Send messages on projects
- Upload files
- Approve project completion

**Student Account** (register a new one or use existing)
- Register with "Student" role
- Browse courses
- Enroll in courses
- Watch lessons
- Track your progress

---

## Step 4: Using the System

### Browse Services
1. Go to `frontend/src/pages/public/services.html`
2. Browse available design services
3. Click a service to see details

### Submit a Request (Clients)
1. Login as a Client
2. You'll see your dashboard
3. Click "New Request" or go to `frontend/src/pages/public/request-service.html`
4. Fill in the form and submit

### Check Request Status
1. Login and go to your dashboard
2. Your requests are listed with their current status

### Work on Projects
1. After admin approves your request, a project is created
2. You can see it in your dashboard
3. Send messages, upload files, request changes

### Take Courses (Students)
1. Login as a Student
2. Go to the courses section
3. Enroll in a course
4. Start watching lessons

---

## Need Help?

Contact the system administrator if you encounter any issues.
