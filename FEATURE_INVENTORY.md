# Feature Inventory

Features are grouped by module. Every feature listed here is implemented and accessible in the codebase.

---

## Authentication

| Feature | Status | Details |
|---------|--------|---------|
| User Registration | Implemented | Register with username, email, password; optional role selection |
| User Login | Implemented | Login by email or username; returns token + user info |
| Role-based Routing | Implemented | Frontend redirects to correct dashboard based on profile role |
| Token Authentication | Implemented | Django REST Framework Token Authentication with `Token` keyword |
| Auto-logout on 401 | Implemented | Frontend redirects to login with `?expired=1` on 401 responses |
| Session Persistence | Implemented | Token stored in `localStorage` |

---

## Public Website

| Feature | Status | Details |
|---------|--------|---------|
| Homepage | Implemented | Public landing page with dynamic CMS content |
| About Page | Implemented | Company information page |
| Contact Page | Implemented | Contact form with validation |
| Services Listing | Implemented | Browse services catalog with category filter + search |
| Request Service Form | Implemented | Submit service request with file attachments |
| Course Catalog | Implemented | Browse published courses |

---

## Admin Dashboard

| Feature | Status | Details |
|---------|--------|---------|
| Analytics Overview | Implemented | KPIs: user counts, enrollments, requests, courses, completion rate, monthly growth |
| User Growth Chart | Implemented | User growth over time (weekly/monthly/quarterly/yearly) |
| Request Flow Chart | Implemented | Request volume over time |
| Recent Activity Feed | Implemented | Combined recent registrations, enrollments, requests |
| User Management | Implemented | List, detail, suspend, activate, change role, soft delete, reset password |
| User Analytics | Implemented | Individual user KPIs and activity |
| Request Management | Implemented | List, detail, approve, reject, status transitions, admin notes |
| Project Management | Implemented | List, detail, status, progress, send messages, upload files (deliverables/work files) |
| Service CMS | Implemented | CRUD for services, categories, features, gallery |
| Media Library | Implemented | Upload, manage, auto-thumbnail generation, delete with usage checks |
| Course Management | Implemented | CRUD for courses, modules, lessons, enrollments |
| Course Builder | Implemented | Reorder modules/lessons via drag-and-drop API |
| Homepage CMS | Implemented | Manage sections and media content for public homepage |
| Notifications | Implemented | Real-time WebSocket push on request/project updates |

---

## Client Dashboard

| Feature | Status | Details |
|---------|--------|---------|
| My Requests | Implemented | List own service requests with status filtering |
| Create Request | Implemented | Submit requests with file attachments |
| My Projects | Implemented | List own projects with progress |
| Project Workspace | Implemented | View project detail, send messages |
| File Upload | Implemented | Upload reference files and revisions |
| Request Revision | Implemented | Request project revision (sets status to REVISION_REQUESTED) |
| Approve Completion | Implemented | Mark project as completed |
| Project Timeline | Implemented | View activity log |
| Notifications | Implemented | Receive real-time notifications via WebSocket |

---

## Student Dashboard

| Feature | Status | Details |
|---------|--------|---------|
| Course Catalog | Implemented | Browse available courses |
| Course Detail | Implemented | View course with modules and lessons |
| Enroll in Course | Implemented | Self-enrollment with duplicate prevention |
| My Courses | Implemented | List enrolled courses with progress percentage |
| Lesson Viewing | Implemented | Watch lessons (video URLs masked for non-enrolled) |
| Mark Lesson Complete | Implemented | Track lesson completion |
| Auto-Progress Tracking | Implemented | Course progress auto-calculated from lesson completions |
| Auto-Complete Course | Implemented | Course auto-completes when progress reaches 100% |

---

## Services

| Feature | Status | Details |
|---------|--------|---------|
| Service Categories | Implemented | Categorize services with icons |
| Service CRUD | Implemented | Full admin CRUD with slug auto-generation |
| Service Features | Implemented | Key features/benefits per service |
| Service Gallery | Implemented | Gallery images per service |
| Thumbnail Support | Implemented | Direct upload or reference to MediaAsset |
| Featured Services | Implemented | Mark services as featured for highlighting |
| Discounted Pricing | Implemented | Base price + optional discounted price |
| Delivery Time | Implemented | Estimated delivery time per service |

---

## Courses (LMS)

| Feature | Status | Details |
|---------|--------|---------|
| Course CRUD | Implemented | Admin create/update/delete courses |
| Course Status | Implemented | Draft/published workflow |
| Module Management | Implemented | Modules with ordering within courses |
| Lesson Management | Implemented | Lessons with ordering within modules |
| Reorder Modules | Implemented | Bulk reorder via API |
| Reorder Lessons | Implemented | Bulk reorder via API |
| Video Lessons | Implemented | YouTube/video URL integration |
| Preview Lessons | Implemented | Flag lessons as preview (accessible without enrollment) |
| Enrollment Tracking | Implemented | Student enrollment with unique constraint |
| Lesson Progress | Implemented | Per-lesson completion tracking |
| Auto Progress | Implemented | Course progress auto-calculated |

---

## Media Library

| Feature | Status | Details |
|---------|--------|---------|
| File Upload | Implemented | Upload images, videos, PDFs, documents |
| Auto-Classification | Implemented | Auto-detect file type and MIME type |
| Auto-Thumbnails | Implemented | Generate 150x150 thumbnail + 600x600 medium for images |
| Validation | Implemented | Extension whitelist, file size limits per type |
| Folder Organization | Implemented | Organize by folder name |
| Public/Private Flag | Implemented | Mark media as public or private |
| Delete Protection | Implemented | Check usage in services before deletion |
| Pagination | Implemented | 24 items per page |

---

## Notifications

| Feature | Status | Details |
|---------|--------|---------|
| Database Notifications | Implemented | Persistent notification records |
| Real-time WebSocket | Implemented | Push notifications via Django Channels |
| Request Status Alerts | Implemented | Auto-notify on request status change |
| Project Update Alerts | Implemented | Auto-notify on project status/message/file changes |
| Mark as Read | Implemented | Read/unread tracking |

---

## Content Management (CMS)

| Feature | Status | Details |
|---------|--------|---------|
| Homepage Sections | Implemented | Dynamic sections with unique keys |
| Section Media | Implemented | Multiple images per section with ordering |
| Active/Inactive Toggle | Implemented | Control visibility per media item |
| Public API | Implemented | Public endpoints for homepage rendering |

---

## Admin Analytics

| Feature | Status | Details |
|---------|--------|---------|
| Overview KPIs | Implemented | Total users, students, clients, admins, enrollments, requests, courses |
| Monthly Growth | Implemented | Month-over-month user growth |
| User Growth Chart | Implemented | User registrations over time (filterable by range) |
| Request Flow Chart | Implemented | Requests over time (filterable by range) |
| Recent Activity | Implemented | Combined feed of recent system activity |

---

## Not Detected During Repository Scan

- Email sending (SMTP configured in `.env.example` but no actual email sending logic detected in code)
- File versioning
- Public blog/news module
- Payment integration
- Multi-language support
- Export/import functionality
- User-submitted reviews/ratings
