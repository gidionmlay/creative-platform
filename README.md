# G DESIGN

A full-stack design agency management platform with multi-role dashboards for admins, clients, and students. Built with Django 6.0 + vanilla JavaScript frontend.

## System Overview

- **Role-based access**: Admin, Client, and Student dashboards
- **Service Catalog**: Browse and request design services
- **Project Workspace**: Client-admin collaboration with messaging, file sharing, revision requests
- **Learning Management**: Course catalog, enrollment, lesson progress tracking
- **CMS**: Homepage content management with media library
- **Real-time Notifications**: WebSocket-powered updates via Django Channels
- **Admin Analytics**: KPIs, user growth, request flow, recent activity

## Quick Start

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (serve with any HTTP server)
# Open frontend/src/pages/public/index.html in browser
```

## Architecture

```
backend/         Django 6.0.4 project (8 apps)
  accounts/      User profiles, admin user management
  requests/      Service request submission & approval
  projects/      Project workspace (messages, files, timeline)
  courses/       Learning management system
  services/      Services catalog with categories & features
  media_library/ Central media asset management
  notifications/ Real-time WebSocket notifications
  cms/           Homepage content management

frontend/        Vanilla HTML/CSS/JS multi-page app
  src/pages/     Public pages + role dashboards
  src/api/       API client modules
  src/assets/    CSS, JS, images, fonts
```

## Tech Stack

- **Backend**: Python, Django 6.0.4, Django REST Framework, Django Channels
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, jQuery, Bootstrap 5
- **Database**: SQLite (development), PostgreSQL-ready
- **Real-time**: WebSockets via Django Channels + Daphne ASGI
- **Auth**: Token-based authentication (DRF TokenAuthentication)
