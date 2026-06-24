# Deployment Readiness Report

Generated from repository scan. Identifies issues that must be resolved before deploying to production.

---

## Critical Issues

### 1. SECRET_KEY Exposed in Source Code
- **File**: `backend/core/settings.py:23`
- **Issue**: Secret key is hardcoded: `django-insecure-p8*uv69#)x&ie1(6^x1@-22dsqa8g7t3$h&b^$rb8_86ydi)qg`
- **Risk**: High — anyone with access to the repo can derive session hashes, CSRF tokens, etc.
- **Fix**: Use environment variable: `SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')`

### 2. DEBUG Mode Enabled
- **File**: `backend/core/settings.py:26`
- **Issue**: `DEBUG = True`
- **Risk**: High — in production, debug pages expose stack traces, environment variables, and source code.
- **Fix**: Set `DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'`

### 3. CORS Allows All Origins
- **File**: `backend/core/settings.py:150`
- **Issue**: `CORS_ALLOW_ALL_ORIGINS = True`
- **Risk**: High — any website can make API requests to the backend.
- **Fix**: Set `CORS_ALLOWED_ORIGINS = ['https://yourdomain.com']`

### 4. No ALLOWED_HOSTS Configured
- **File**: `backend/core/settings.py:28`
- **Issue**: `ALLOWED_HOSTS = []`
- **Risk**: High — Django will refuse all requests in production with DEBUG=False.
- **Fix**: Set `ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')`

### 5. No requirements.txt
- **Issue**: The project is missing `requirements.txt`. Dependencies are only in the virtual environment.
- **Risk**: High — new deployments require manual package installation.
- **Fix**: Run `pip freeze > requirements.txt` in the virtual environment.

### 6. SQLite Database in Production
- **Issue**: Using `db.sqlite3` for the database.
- **Risk**: High — SQLite is unsuitable for production (no concurrent writes, limited scalability).
- **Fix**: Configure PostgreSQL with environment variables:
  ```python
  import os
  DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.postgresql',
          'NAME': os.environ.get('DB_NAME'),
          'USER': os.environ.get('DB_USER'),
          'PASSWORD': os.environ.get('DB_PASSWORD'),
          'HOST': os.environ.get('DB_HOST'),
          'PORT': os.environ.get('DB_PORT', '5432'),
      }
  }
  ```

---

## Warnings

### 7. InMemoryChannelLayer Used
- **File**: `backend/core/settings.py:93`
- **Issue**: `CHANNEL_LAYERS` uses `InMemoryChannelLayer`
- **Risk**: Medium — not suitable for multi-worker deployments. WebSocket state is lost on restart.
- **Fix**: Configure Redis as the channel layer backend.

### 8. No Static File Configuration
- **Issue**: `STATIC_ROOT` and `STATICFILES_DIRS` are not configured.
- **Risk**: Medium — static files (admin CSS/JS) won't be served in production.
- **Fix**: Add:
  ```python
  STATIC_ROOT = BASE_DIR / 'staticfiles'
  STATICFILES_DIRS = [BASE_DIR.parent / 'frontend' / 'src' / 'assets']
  ```
  Then run `python manage.py collectstatic`.

### 9. Media Files Served via Django in Development
- **File**: `backend/core/urls.py` (likely uses `static()` helper)
- **Risk**: Medium — Django is not designed to serve user-uploaded files in production.
- **Fix**: Configure a CDN or nginx/apache to serve the `backend/media/` directory.

### 10. No Environment Variable Management
- **Issue**: No `.env` file loading. All sensitive settings are hardcoded.
- **Risk**: Medium — credentials, secret key, and database config cannot be changed without code edits.
- **Fix**: Use `python-decouple` or `django-environ` to load from `.env`.

### 11. No HTTPS Configuration
- **Issue**: No SSL/HTTPS settings.
- **Risk**: Medium — tokens and passwords transmitted in plaintext.
- **Fix**: Use a reverse proxy (nginx, Caddy) with Let's Encrypt certificates.

### 12. Default CSRF & Session Cookie Settings
- **Issue**: Cookies are not marked as `secure` or `httponly`.
- **Risk**: Medium — vulnerable to XSS and man-in-the-middle attacks.
- **Fix**:
  ```python
  CSRF_COOKIE_SECURE = True
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_HTTPONLY = True
  SECURE_SSL_REDIRECT = True
  ```

### 13. Hardcoded API Base URL in Frontend
- **File**: `frontend/src/api/api.js:8`
- **Issue**: `const BASE_URL = "http://127.0.0.1:8000/api/v1";`
- **Risk**: Low (development) — but must be changed for production deployment.
- **Fix**: Use a configurable variable or build-time replacement.

---

## Recommendations

### 14. Add logging configuration
- **Recommendation**: Configure Django logging to write to files instead of console.

### 15. Set up a proper ASGI server
- **Recommendation**: For Channels WebSocket support in production, use Daphne behind nginx with process managers (supervisor/systemd).

### 16. Implement rate limiting
- **Recommendation**: Add `django-ratelimit` or `django-axes` to prevent brute-force login attempts.

### 17. Add database connection pooling
- **Recommendation**: Use `pgbouncer` or similar for PostgreSQL connection pooling.

### 18. Generate requirements.txt
- **Recommendation**: Run `pip freeze > requirements.txt` before deployment.

### 19. Create a start script
- **Recommendation**: Provide a production start script (e.g., using gunicorn/daphne).

### 20. Set up monitoring
- **Recommendation**: Add health check endpoints and error tracking (Sentry).

---

## Summary

| Priority | Open Issues |
|----------|-------------|
| **Critical (Must Fix)** | 6 |
| **Warning (Should Fix)** | 7 |
| **Recommendation** | 7 |

The project is in active development and is not yet ready for production deployment. The critical issues center on security (exposed SECRET_KEY, DEBUG mode, open CORS) and infrastructure (missing requirements.txt, SQLite). Resolving these is straightforward and should take approximately 1-2 hours.
