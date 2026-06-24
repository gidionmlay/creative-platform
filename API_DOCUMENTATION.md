# API Documentation

**Base URL**: `http://127.0.0.1:8000/api/v1`  
**Auth**: `Authorization: Token <token_key>` (obtained from login)  
**Format**: JSON  
**Default Permission**: `IsAuthenticated` (most endpoints require login)

---

## Authentication

### POST /api/v1/auth/login/
Authenticates a user and returns an auth token.

**Request Body:**
```json
{
  "identifier": "username_or_email",
  "password": "password"
}
```
**Response (200):**
```json
{
  "key": "token_string",
  "user_id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "profile_role": "client"
}
```
**Purpose**: Login by email or username. Returns token + user info for role-based routing.

---

### POST /api/v1/auth/register/
Creates a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secure_password",
  "password2": "secure_password",
  "role": "client"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Welcome, johndoe!",
  "data": { "username": "johndoe", "email": "john@example.com", "role": "client" }
}
```
**Purpose**: Register a new user with optional role.

---

### GET /api/v1/auth/me/
Returns the current authenticated user's profile.

**Headers**: `Authorization: Token <key>`  
**Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "client"
}
```
**Purpose**: Get current user profile.

---

## Services (Public)

### GET /api/v1/services/categories/
List all service categories.

**Auth**: None  
**Response (200):** Array of `ServiceCategory` objects.

**Purpose**: List all categories.

---

### GET /api/v1/services/
List active services.

**Query Params**: `?category=<id>` `?featured=true` `?search=<term>`  
**Auth**: None  
**Response (200):** Paginated array of `Service` objects.

**Purpose**: Browse the services catalog. Filters available for category, featured status, and text search.

---

### GET /api/v1/services/<slug>/
Get a single service by its slug.

**Auth**: None  
**Response (200):** Full `Service` detail with nested features, gallery, and category.

**Purpose**: View service details.

---

## Client Requests

### POST /api/v1/requests/
Create a new service request with file attachments.

**Headers**: `Authorization: Token <key>` (Content-Type: multipart/form-data for file upload)  
**Request (multipart/form-data):**
```
service: <service_id>
title: "Project Title"
description: "Project description"
budget: 500000
quantity: 1
attachments: [files]
```
**Response (201):** Created `Request` detail.

**Purpose**: Submit a service request with optional file attachments.

---

### GET /api/v1/requests/my/
List the current user's requests.

**Query Params**: `?status=<filter>`  
**Headers**: `Authorization: Token <key>`  
**Response (200):** Paginated array of user's requests.

**Purpose**: View personal request history.

---

## Admin Requests

### GET /api/v1/admin/requests/
List all requests (admin).

**Query Params**: `?status=<filter>` `?service=<id>`  
**Auth**: Admin role  
**Response (200):** Paginated list of all requests.

**Purpose**: Admin dashboard for managing all requests.

---

### GET /api/v1/admin/requests/<id>/
Get detailed view of a single request.

**Auth**: Admin role  
**Response (200):** Full request detail with attachments, timeline, notes, service details.

**Purpose**: Review request details.

---

### PATCH /api/v1/admin/requests/<id>/approve/
Approve a pending request. Auto-creates a Project workspace.

**Auth**: Admin role  
**Response (200):** Success confirmation. Creates `Project` + timeline entries + notification.

**Purpose**: Approve request and automatically generate project workspace.

---

### PATCH /api/v1/admin/requests/<id>/reject/
Reject a request.

**Request Body:**
```json
{ "admin_note": "Reason for rejection (required)" }
```
**Auth**: Admin role  
**Response (200):** Success confirmation.

**Purpose**: Reject with required admin note.

---

### PATCH /api/v1/admin/requests/<id>/status/
Update request status with validated transitions.

**Request Body:**
```json
{ "status": "under_review", "admin_note": "Optional note" }
```
**Auth**: Admin role  

**Valid transitions:**
- pending → under_review, approved, rejected
- under_review → approved, rejected, waiting_client
- approved → in_progress, rejected, waiting_client
- in_progress → waiting_client, revision, completed
- waiting_client → in_progress, cancelled
- revision → in_progress, completed

**Purpose**: Advance request through its lifecycle.

---

### POST /api/v1/admin/requests/<id>/notes/
Add an internal note to a request.

**Request Body:**
```json
{ "note": "Internal note text" }
```
**Auth**: Admin role  
**Response (201):** Created note.

**Purpose**: Add internal admin notes.

---

## Client Projects

### GET /api/v1/projects/my/
List the current client's projects.

**Auth**: Client role  
**Response (200):** Array of client's projects.

**Purpose**: Client dashboard project listing.

---

### GET /api/v1/projects/<id>/
Get project detail (client's own project only).

**Auth**: Client role  
**Response (200):** Full project detail with nested messages, files, and timeline.

**Purpose**: View project workspace.

---

### POST /api/v1/projects/<id>/messages/
Send a message in a project.

**Request Body:**
```json
{ "message": "Message text" }
```
**Auth**: Client role  
**Response (201):** Created message.

**Purpose**: Communicate within project workspace.

---

### POST /api/v1/projects/<id>/files/
Upload a file to a project (client uploads as REVISION type).

**Headers**: `Authorization: Token <key>` (multipart/form-data)  
**Auth**: Client role  
**Response (201):** Created file record.

**Purpose**: Upload reference files or revision requests.

---

### POST /api/v1/projects/<id>/revision/
Request a revision on a project. Sets status to `REVISION_REQUESTED`.

**Auth**: Client role  
**Response (200):** Status update confirmation.

**Purpose**: Request project revisions.

---

### POST /api/v1/projects/<id>/approve/
Approve project completion. Sets status to `COMPLETED`, progress to 100%.

**Auth**: Client role  
**Response (200):** Success confirmation.

**Purpose**: Mark project as completed.

---

### GET /api/v1/projects/<id>/timeline/
Get project timeline/activity log.

**Auth**: Client role  
**Response (200):** Array of timeline entries.

**Purpose**: View project activity history.

---

## Admin Projects

### GET /api/v1/admin/projects/
List all projects.

**Query Params**: `?status=<filter>`  
**Auth**: Admin role  
**Response (200):** Paginated list of all projects.

**Purpose**: Admin project management.

---

### POST /api/v1/admin/projects/
Create a project manually.

**Auth**: Admin role  
**Purpose**: Manually create project (also auto-created on request approval).

---

### GET /api/v1/admin/projects/<id>/
Get project detail (admin).

**Auth**: Admin role  
**Response (200):** Full project detail.

---

### PATCH /api/v1/admin/projects/<id>/status/
Update project status.

**Auth**: Admin role  

---

### PATCH /api/v1/admin/projects/<id>/progress/
Update project progress (0-100).

**Auth**: Admin role  

---

### POST /api/v1/admin/projects/<id>/messages/
Send a message as admin.

**Auth**: Admin role  

---

### POST /api/v1/admin/projects/<id>/files/
Upload a file (admin uploads DELIVERABLE or WORK_FILE type).

**Auth**: Admin role  

---

## Users (Admin)

### GET /api/v1/admin/users/analytics/
User analytics KPIs.

**Auth**: Admin role  
**Response (200):** KPIs: totals, growth chart data, role/status distribution.

**Purpose**: Admin analytics dashboard.

---

### GET /api/v1/admin/users/
Paginated, filterable user list.

**Query Params**: `?page=1` `?search=<term>` `?role=<role>` `?status=<status>`  
**Auth**: Admin role  

---

### GET /api/v1/admin/users/<id>/
Enriched user detail.

**Auth**: Admin role  
**Response (200):** User data with enrollments, requests, notifications.

---

### PATCH /api/v1/admin/users/<id>/suspend/
Suspend a user.

**Auth**: Admin role  

---

### PATCH /api/v1/admin/users/<id>/activate/
Activate a user.

**Auth**: Admin role  

---

### PATCH /api/v1/admin/users/<id>/role/
Change a user's role.

**Request Body:**
```json
{ "role": "admin" }
```
**Auth**: Admin role  

---

### DELETE /api/v1/admin/users/<id>/delete/
Soft delete (deactivate + block) a user.

**Auth**: Admin role  

---

### POST /api/v1/admin/users/<id>/reset-password/
Admin resets a user's password.

**Auth**: Admin role  

---

### GET /api/v1/admin/users/<id>/activity/
View user activity log.

**Auth**: Admin role  

---

## Courses

### GET /api/v1/courses/
List all published courses.

**Auth**: None  
**Response (200):** Array of courses.

---

### GET /api/v1/courses/<id>/
Course detail with nested modules and lessons.

**Auth**: None  
**Response (200):** Course with modules/lessons. Video URLs masked for non-enrolled users.

---

### POST /api/v1/courses/<id>/enroll/
Enroll in a course (student role).

**Auth**: Student role  
**Response (201):** Enrollment confirmation + notification.

---

### GET /api/v1/student/my-courses/
List enrolled courses for current student.

**Auth**: Student role  
**Response (200):** Array of enrollments with progress.

---

### POST /api/v1/student/lessons/<id>/complete/
Mark a lesson as completed. Recalculates course progress.

**Auth**: Student role  
**Response (200):** Progress update. Auto-completes course at 100%.

---

## Admin Courses

### GET/POST /api/v1/admin/courses/
List all courses (including drafts) or create a new course.

**Auth**: Admin role  

### GET/PATCH/DELETE /api/v1/admin/courses/<id>/
Course CRUD.

**Auth**: Admin role  

### GET/POST /api/v1/admin/courses/<id>/modules/
List or create modules within a course.

**Auth**: Admin role  

### GET/PATCH/DELETE /api/v1/admin/courses/modules/<id>/
Module CRUD.

**Auth**: Admin role  

### GET/POST /api/v1/admin/courses/modules/<id>/lessons/
List or create lessons within a module.

**Auth**: Admin role  

### GET/PATCH/DELETE /api/v1/admin/courses/lessons/<id>/
Lesson CRUD.

**Auth**: Admin role  

### PATCH /api/v1/admin/courses/modules/reorder/
Bulk reorder modules.

**Auth**: Admin role  

### PATCH /api/v1/admin/courses/lessons/reorder/
Bulk reorder lessons.

**Auth**: Admin role  

### GET /api/v1/admin/courses/enrollments/
List all enrollments.

**Query Params**: `?course_id=<id>` `?student_id=<id>`  
**Auth**: Admin role  

---

## Admin Services

### CRUD /api/v1/admin/services/
Full CRUD via ModelViewSet.

**Auth**: Admin role  
**Custom Actions:**
- `POST /<id>/gallery/` — Add gallery image
- `DELETE /<id>/gallery/<gallery_id>/` — Remove gallery image
- `POST /<id>/features/` — Add feature
- `DELETE /<id>/features/<feature_id>/` — Remove feature

---

### CRUD /api/v1/admin/services/categories/
Full CRUD for categories.

**Auth**: Admin role  

---

## Admin Media Library

### CRUD /api/v1/admin/media/
Full CRUD for media assets.

**Auth**: Admin role  
**Query Params**: `?folder=<name>` `?file_type=<type>` `?search=<term>`  
**Pagination**: 24 items per page  
**Note**: Checks usage in services before allowing deletion.

---

## CMS Homepage (Public)

### GET /api/v1/content/homepage/
List all homepage sections with their media.

**Auth**: None  
**Response (200):** Array of sections with nested media items.

**Purpose**: Public homepage rendering.

---

### GET /api/v1/content/homepage/<section_key>/
Get a single homepage section by key.

**Auth**: None  
**Purpose**: Render specific section.

---

## CMS Homepage (Admin)

### CRUD /api/v1/admin/content/homepage/sections/
Full CRUD for homepage sections.

**Auth**: Admin role  

### CRUD /api/v1/admin/content/homepage/media/
Full CRUD for homepage media (multipart uploads).

**Query Params**: `?section=<section_id>`  
**Auth**: Admin role  

---

## Notifications

### GET /api/v1/notifications/
List current user's notifications.

**Auth**: Authenticated  
**Response (200):** Array of notifications (newest first).

---

### PATCH /api/v1/notifications/<id>/read/
Mark a notification as read.

**Auth**: Authenticated  

---

## Analytics (Admin)

### GET /api/v1/admin/analytics/overview/
KPIs overview.

**Auth**: Admin role  
**Response:** Total users, students, clients, admins, enrollments, requests, courses published, completion rate, monthly growth.

---

### GET /api/v1/admin/analytics/user-growth/
User growth over time.

**Query Params**: `?range=weekly|monthly|quarterly|yearly`  
**Auth**: Admin role  

---

### GET /api/v1/admin/analytics/request-flow/
Request flow over time.

**Query Params**: `?range=weekly|monthly|quarterly|yearly`  
**Auth**: Admin role  

---

### GET /api/v1/admin/analytics/recent-activity/
Recent activity feed.

**Auth**: Admin role  
**Response:** Recent registrations, enrollments, requests (last 15).

---

## WebSocket

### ws://host/ws/notifications/?token=<auth_token>
Real-time notification WebSocket connection.

**Auth**: Token query parameter  
**Protocol**: 
- Connect with `?token=<your_auth_token>`
- Server sends JSON: `{ "type": "notification", "title": "...", "message": "...", ... }`
- Auto-disconnects anonymous users

**Purpose**: Real-time push notifications when request status changes, project updates occur.
