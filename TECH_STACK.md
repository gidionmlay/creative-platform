# Technology Stack

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.x | Programming language |
| Django | 6.0.4 | Web framework |
| Django REST Framework | latest | REST API framework |
| Django Channels | latest | WebSocket/ASGI support |
| Daphne | latest | ASGI server for Channels |
| SQLite | 3.x | Database engine (development) |
| Token Authentication | DRF | API authentication |
| Pillow | latest | Image processing (thumbnails) |
| django-cors-headers | latest | CORS management |

## Frontend

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling |
| Vanilla JavaScript (ES6+) | Application logic |
| jQuery | DOM manipulation, AJAX |
| Bootstrap 5 | Responsive layout framework |
| Swiper.js | Carousels and sliders |
| GSAP (ScrollTrigger, SplitText) | Animations |
| AOS (Animate on Scroll) | Scroll animations |
| Odometer | Animated number counters |
| Magnific Popup | Lightbox modals |
| Nice Select | Styled select elements |
| jQuery Marquee | Scrolling text |
| Font Awesome 6 (Pro) | Icons |
| Icomoon | Custom icons |
| Chart.js | Admin dashboard charts (used in admin analytics) |

## Real-time Communication

| Technology | Purpose |
|------------|---------|
| Django Channels | WebSocket framework |
| Daphne | ASGI HTTP/WebSocket server |
| InMemoryChannelLayer | Channel backend (dev) |

## Infrastructure & Configuration

| Component | Details |
|-----------|---------|
| Database | SQLite3 (`db.sqlite3`) |
| ASGI Server | Daphne (via `core.asgi.application`) |
| WSGI Server | Standard Django WSGI |
| Media Storage | Local filesystem (`backend/media/`) |
| CORS | All origins allowed (`CORS_ALLOW_ALL_ORIGINS = True`) |
| Auth Header | `Authorization: Token <key>` |

## Missing / Not Detected

- **requirements.txt**: Not found in the repository. Dependencies exist only in the virtual environment.
- **package.json / npm**: Frontend is vanilla HTML/JS/CSS with no bundler.
- **Redis**: Not configured. Channel layer uses InMemoryChannelLayer.
- **PostgreSQL**: Not configured. Using SQLite.
- **Docker**: No Docker configuration found.
- **CI/CD**: No CI/CD configuration found.
- **Environment variables (.env)**: Not present. Only `.env.example` template exists.

/home/gidion/Desktop/G DESIGN/frontend/src/assets/images/company-img/work-1.jpg

/home/gidion/Desktop/G DESIGN/frontend/src/assets/images/company-img/work-2.jpg

