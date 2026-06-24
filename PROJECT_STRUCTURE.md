# Project Structure

```
/home/gidion/Desktop/G DESIGN/
├── .gitignore
├── .vscode/
│   └── settings.json
├── README.md
├── audit.txt
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── requirements.txt              NOT DETECTED (missing)
│   ├── error.html                    Django debug error page
│   ├── error_full.txt                Error dump
│   ├── parse_html_error.py           Error parser utility
│   ├── verify_flow.py                Integration test script
│   ├── test_analytics_api.py         Analytics API test
│   ├── test_analytics_error.py       Analytics debug test
│   ├── test_users_api.py             Users API test
│   ├── core/                         Django project configuration
│   │   ├── __init__.py
│   │   ├── settings.py               Django settings (Django 6.0.4)
│   │   ├── urls.py                   Root URL configuration
│   │   ├── wsgi.py                   WSGI entry point
│   │   ├── asgi.py                   ASGI entry point (Channels)
│   │   ├── authentication.py         Custom BearerTokenAuthentication
│   │   ├── permissions.py            Role-based permission classes
│   │   ├── auth_views.py             Login/Register/Profile views
│   │   ├── analytics_views.py        Admin analytics dashboard views
│   │   ├── analytics_urls.py         Analytics URL routes
│   │   └── utils.py                  Response helpers
│   ├── accounts/                     User profiles & admin user management
│   │   ├── models.py                 Profile model
│   │   ├── views.py                  Admin user CRUD views
│   │   ├── urls.py                   User management routes
│   │   ├── admin.py                  Django admin registration
│   │   ├── apps.py                   App config
│   │   ├── tests.py
│   │   └── migrations/
│   ├── requests/                     Service request management
│   │   ├── models.py                 Request, RequestAttachment, Activity, Note
│   │   ├── views.py                  Create, list, approve, reject, status
│   │   ├── urls.py                   Client request routes
│   │   ├── admin_urls.py             Admin request routes
│   │   ├── serializers.py            Request serializers
│   │   ├── admin.py                  Django admin registration
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   ├── projects/                     Project workspace management
│   │   ├── models.py                 Project, Message, File, Timeline
│   │   ├── views.py                  Admin & client project views
│   │   ├── urls.py                   Client project routes
│   │   ├── admin_urls.py             Admin project routes
│   │   ├── serializers.py            Project serializers
│   │   ├── signals.py                Auto timeline + notifications
│   │   ├── apps.py
│   │   └── migrations/
│   ├── courses/                      Learning management system
│   │   ├── models.py                 Course, Enrollment, Module, Lesson, Progress
│   │   ├── views.py                  Public & admin course views
│   │   ├── urls.py                   Public course routes
│   │   ├── student_urls.py           Student course routes
│   │   ├── admin_urls.py             Admin course management
│   │   ├── serializers.py            Course serializers
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   ├── services/                     Services catalog
│   │   ├── models.py                 Category, Service, Feature, Gallery
│   │   ├── views.py                  Public & admin service views
│   │   ├── urls.py                   Public service routes
│   │   ├── admin_urls.py             Admin service management
│   │   ├── serializers.py            Service serializers
│   │   ├── admin.py                  Django admin (tabular inlines)
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   ├── media_library/                Central media asset management
│   │   ├── models.py                 MediaAsset (auto-thumbnails)
│   │   ├── views.py                  Admin media CRUD
│   │   ├── admin_urls.py             Media routes
│   │   ├── serializers.py            MediaAsset serializer
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   ├── notifications/                Real-time WebSocket notifications
│   │   ├── models.py                 Notification model
│   │   ├── views.py                  List & mark read
│   │   ├── urls.py                   Notification routes
│   │   ├── serializers.py            Notification serializer
│   │   ├── signals.py                Auto-create on request status change
│   │   ├── consumers.py              AsyncWebSocket consumer
│   │   ├── routing.py                WebSocket URL routing
│   │   ├── middleware.py             Token auth for WebSockets
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   ├── cms/                          Homepage content management
│   │   ├── models.py                 HomepageSection, HomepageMedia
│   │   ├── views.py                  Public & admin CMS views
│   │   ├── urls.py                   Public CMS routes
│   │   ├── admin_urls.py             Admin CMS management
│   │   ├── serializers.py            CMS serializers
│   │   ├── admin.py                  Django admin (inline media)
│   │   ├── apps.py
│   │   ├── tests.py
│   │   └── migrations/
│   ├── media/                        Uploaded media files
│   │   ├── cms/homepage/
│   │   ├── general/
│   │   ├── medium/
│   │   ├── project_files/
│   │   ├── request_attachments/
│   │   ├── services/
│   │   └── thumbnails/
│   └── venv/                         Python virtual environment
└── frontend/
    ├── config/
    │   └── .env.example              SMTP configuration template
    ├── docs/
    │   └── README.md
    └── src/
        ├── api/                      API client modules
        │   ├── api.js                Core API (auth, requests, users)
        │   ├── services.js           Services API
        │   ├── projects.js           Projects API
        │   ├── courses.js            Courses API
        │   ├── student.js            Student API
        │   ├── media.js              Media library API
        │   ├── cms.homepage.js       Homepage CMS API
        │   └── adminCourses.js       Admin courses API
        ├── assets/
        │   ├── css/
        │   │   ├── base.css          Base styles
        │   │   ├── components.css    Component styles
        │   │   ├── layout.css        Layout styles
        │   │   ├── pages.css         Page-specific styles
        │   │   └── vendor/           Third-party CSS (bootsrap, swiper, AOS, etc.)
        │   ├── js/
        │   │   ├── core/
        │   │   │   ├── app.js        Main app (carousels, animations, UI)
        │   │   │   ├── auth.js       Token management, login state
        │   │   │   ├── config.js     App configuration
        │   │   │   └── dashboard-guard.js  Dashboard error handling
        │   │   ├── modules/          Dashboard-specific JS
        │   │   │   ├── admin.js
        │   │   │   ├── client.js
        │   │   │   ├── dashboard.js
        │   │   │   ├── services.js
        │   │   │   ├── requests.js
        │   │   │   ├── projects.js
        │   │   │   ├── student.js
        │   │   │   ├── cms.homepage.js
        │   │   │   └── admin/        Admin sub-modules
        │   │   │       ├── activity.js
        │   │   │       ├── analytics.js
        │   │   │       ├── charts.js
        │   │   │       ├── cms.homepage.js
        │   │   │       ├── cms.media.js
        │   │   │       ├── cms.services.js
        │   │   │       ├── course-builder.js
        │   │   │       ├── dashboard.js
        │   │   │       ├── kpis.js
        │   │   │       ├── projects.js
        │   │   │       ├── requests.js
        │   │   │       └── users.js
        │   │   ├── client/           Client-specific JS
        │   │   │   ├── projects.js
        │   │   │   └── requests.js
        │   │   ├── student/          Student-specific JS
        │   │   │   ├── course-detail.js
        │   │   │   └── student.js
        │   │   ├── utils/
        │   │   │   └── socket.js     WebSocket client utility
        │   │   └── vendor/           Third-party JS (jQuery, Bootstrap, Swiper, GSAP, etc.)
        │   ├── images/               Backgrounds, icons, logos, portfolio
        │   └── fonts/                Font Awesome, Icomoon
        ├── components/               HTML partials
        │   ├── buttons/
        │   ├── cards/
        │   ├── footer/
        │   ├── forms/
        │   ├── header/
        │   └── sidebar/
        ├── layouts/                  HTML layouts
        │   ├── dashboard-layout.html
        │   └── main-layout.html
        ├── pages/
        │   ├── auth/
        │   │   ├── login.html
        │   │   └── register.html
        │   ├── dashboards/
        │   │   ├── admin/
        │   │   │   ├── index.html          Admin dashboard
        │   │   │   ├── courses.html        Course management
        │   │   │   └── course-builder.html Course builder
        │   │   ├── client/
        │   │   │   └── index.html          Client dashboard
        │   │   └── student/
        │   │       ├── index.html          Student dashboard
        │   │       └── course-detail.html  Course detail
        │   └── public/
        │       ├── index.html              Public homepage
        │       ├── about.html              About page
        │       ├── contact.html            Contact page
        │       ├── services.html           Services listing
        │       └── request-service.html    Service request form
        └── utils/
            └── helpers.js            Helper utilities
```

## Django Apps Overview

| App | Purpose | Models | API Prefix |
|-----|---------|--------|------------|
| accounts | User profiles, admin user management | Profile | `/api/v1/admin/users/` |
| requests | Service request submission & lifecycle | Request, RequestAttachment, RequestActivity, RequestNote | `/api/v1/requests/`, `/api/v1/admin/requests/` |
| projects | Project workspace (messages, files, timeline) | Project, ProjectMessage, ProjectFile, ProjectTimeline | `/api/v1/projects/`, `/api/v1/admin/projects/` |
| courses | Learning management system | Course, Enrollment, Module, Lesson, LessonProgress | `/api/v1/courses/`, `/api/v1/student/`, `/api/v1/admin/courses/` |
| services | Services catalog | ServiceCategory, Service, ServiceFeature, ServiceGallery | `/api/v1/services/`, `/api/v1/admin/services/` |
| media_library | Central media asset management | MediaAsset | `/api/v1/admin/media/` |
| notifications | Real-time WebSocket notifications | Notification | `/api/v1/notifications/`, `ws://` |
| cms | Homepage content management | HomepageSection, HomepageMedia | `/api/v1/content/homepage/`, `/api/v1/admin/content/homepage/` |
