# Database Architecture

**Database Engine**: SQLite3 (development)  
**Total Models**: 22 across 8 apps

---

## App: accounts

### Profile
Stores extended user information and role assignments.

| Field | Type | Constraints |
|-------|------|-------------|
| user | OneToOneField(User) | CASCADE, related_name='profile' |
| role | CharField(20) | choices: client, student, admin; default: client |
| status | CharField(20) | choices: active, pending, suspended, blocked; default: active |
| avatar | URLField(500) | null, blank |
| phone | CharField(30) | null, blank |
| bio | TextField | null, blank |
| last_seen | DateTimeField | null, blank |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

**Relationships**: `user -> User` (OneToOne)

---

## App: services

### ServiceCategory
Categorizes services.

| Field | Type | Constraints |
|-------|------|-------------|
| name | CharField(100) | |
| slug | SlugField(100) | unique, auto-populated |
| description | TextField | null, blank |
| icon | CharField(50) | null, blank |
| created_at | DateTimeField | auto_now_add |

### Service
A design service offered to clients.

| Field | Type | Constraints |
|-------|------|-------------|
| title | CharField(200) | |
| slug | SlugField(200) | unique, auto-populated |
| short_description | CharField(255) | |
| full_description | TextField | |
| thumbnail | ImageField | null, blank, upload: services/thumbnails/ |
| thumbnail_asset | ForeignKey(MediaAsset) | SET_NULL, null, blank |
| base_price | DecimalField(10,2) | |
| discounted_price | DecimalField(10,2) | null, blank |
| delivery_time | CharField(100) | |
| featured | BooleanField | default: False |
| active | BooleanField | default: True |
| category | ForeignKey(ServiceCategory) | CASCADE, related_name='services' |
| created_by | ForeignKey(User) | SET_NULL, null |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

### ServiceFeature
Features/benefits of a service.

| Field | Type | Constraints |
|-------|------|-------------|
| service | ForeignKey(Service) | CASCADE, related_name='features' |
| title | CharField(200) | |
| created_at | DateTimeField | auto_now_add |

### ServiceGallery
Gallery images for a service.

| Field | Type | Constraints |
|-------|------|-------------|
| service | ForeignKey(Service) | CASCADE, related_name='gallery' |
| image | ImageField | null, blank, upload: services/gallery/ |
| image_asset | ForeignKey(MediaAsset) | SET_NULL, null, blank |
| created_at | DateTimeField | auto_now_add |

---

## App: requests

### Request
A client's service request.

| Field | Type | Constraints |
|-------|------|-------------|
| client | ForeignKey(User) | CASCADE, related_name='requests' |
| service | ForeignKey(Service) | CASCADE, related_name='requests' |
| title | CharField(255) | |
| description | TextField | |
| budget | DecimalField(12,2) | null, blank |
| quantity | PositiveIntegerField | default: 1 |
| status | CharField(20) | choices: pending, under_review, approved, in_progress, waiting_client, revision, completed, rejected, cancelled; default: pending |
| delivery_date | DateField | null, blank |
| admin_note | TextField | blank |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

**Relationships**: `client -> User`, `service -> Service`

### RequestAttachment
Files attached to a request.

| Field | Type | Constraints |
|-------|------|-------------|
| request | ForeignKey(Request) | CASCADE, related_name='attachments' |
| file | FileField | upload: request_attachments/%Y/%m/ |
| uploaded_at | DateTimeField | auto_now_add |

### RequestActivity
Timeline entries for a request's lifecycle.

| Field | Type | Constraints |
|-------|------|-------------|
| request | ForeignKey(Request) | CASCADE, related_name='timeline' |
| actor | ForeignKey(User) | SET_NULL, null, blank |
| action | CharField(50) | |
| message | TextField | |
| created_at | DateTimeField | auto_now_add |

### RequestNote
Internal admin notes on a request.

| Field | Type | Constraints |
|-------|------|-------------|
| request | ForeignKey(Request) | CASCADE, related_name='notes' |
| user | ForeignKey(User) | SET_NULL, null, blank |
| note | TextField | |
| internal | BooleanField | default: True |
| created_at | DateTimeField | auto_now_add |

---

## App: projects

### Project
A project workspace created from an approved request.

| Field | Type | Constraints |
|-------|------|-------------|
| request | OneToOneField(Request) | CASCADE, null, blank, related_name='project' |
| client | ForeignKey(User) | CASCADE, related_name='projects' |
| service | ForeignKey(Service) | SET_NULL, null, related_name='projects' |
| title | CharField(255) | |
| description | TextField | |
| status | CharField(20) | choices: PENDING, REVIEWED, IN_PROGRESS, CLIENT_REVIEW, REVISION_REQUESTED, COMPLETED, ARCHIVED; default: PENDING |
| progress | IntegerField | default: 0 (0-100) |
| due_date | DateField | null, blank |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

**Relationships**: `request -> Request` (OneToOne), `client -> User`, `service -> Service`

### ProjectMessage
Messages within a project workspace.

| Field | Type | Constraints |
|-------|------|-------------|
| project | ForeignKey(Project) | CASCADE, related_name='messages' |
| sender | ForeignKey(User) | CASCADE, related_name='sent_project_messages' |
| message | TextField | |
| created_at | DateTimeField | auto_now_add |

### ProjectFile
Files uploaded to a project.

| Field | Type | Constraints |
|-------|------|-------------|
| project | ForeignKey(Project) | CASCADE, related_name='files' |
| uploaded_by | ForeignKey(User) | CASCADE, related_name='uploaded_project_files' |
| file | FileField | upload: project_files/%Y/%m/ |
| file_type | CharField(20) | choices: REFERENCE, WORK_FILE, DELIVERABLE, REVISION; default: REFERENCE |
| file_size | PositiveIntegerField | |
| is_deliverable | BooleanField | default: False |
| created_at | DateTimeField | auto_now_add |

### ProjectTimeline
Timeline of project events.

| Field | Type | Constraints |
|-------|------|-------------|
| project | ForeignKey(Project) | CASCADE, related_name='timeline' |
| action | CharField(255) | |
| actor | ForeignKey(User) | SET_NULL, null, blank |
| metadata | JSONField | null, blank |
| created_at | DateTimeField | auto_now_add |

---

## App: courses

### Course
A learning course.

| Field | Type | Constraints |
|-------|------|-------------|
| title | CharField(255) | |
| description | TextField | |
| thumbnail | URLField(500) | null, blank |
| price | DecimalField(10,2) | null, blank |
| status | CharField(20) | choices: draft, published; default: draft |
| created_at | DateTimeField | auto_now_add |

### Enrollment
Links a student to a course.

| Field | Type | Constraints |
|-------|------|-------------|
| user | ForeignKey(User) | CASCADE, related_name='enrollments' |
| course | ForeignKey(Course) | CASCADE, related_name='enrollments' |
| status | CharField(20) | choices: active, completed; default: active |
| progress | IntegerField | default: 0 |
| enrolled_at | DateTimeField | auto_now_add |
| **unique_together** | (user, course) | |

### Module
A module within a course.

| Field | Type | Constraints |
|-------|------|-------------|
| course | ForeignKey(Course) | CASCADE, related_name='modules' |
| title | CharField(255) | |
| order | PositiveIntegerField | default: 0 |

### Lesson
A lesson within a module.

| Field | Type | Constraints |
|-------|------|-------------|
| module | ForeignKey(Module) | CASCADE, related_name='lessons' |
| title | CharField(255) | |
| description | TextField | null, blank |
| video_url | URLField(500) | |
| duration | CharField(50) | e.g. "12:30" |
| order | PositiveIntegerField | default: 0 |
| is_preview | BooleanField | default: False |

### LessonProgress
Tracks a student's lesson completion.

| Field | Type | Constraints |
|-------|------|-------------|
| user | ForeignKey(User) | CASCADE, related_name='lesson_progress' |
| lesson | ForeignKey(Lesson) | CASCADE, related_name='progress_records' |
| is_completed | BooleanField | default: False |
| completed_at | DateTimeField | auto_now |
| **unique_together** | (user, lesson) | |

---

## App: media_library

### MediaAsset
Centralized media file management with auto-generated thumbnails.

| Field | Type | Constraints |
|-------|------|-------------|
| title | CharField(255) | blank |
| file | FileField | upload via upload_to_path |
| file_type | CharField(20) | choices: image, video, pdf, document, other |
| mime_type | CharField(100) | blank |
| file_size | PositiveIntegerField | null, blank |
| uploaded_by | ForeignKey(User) | SET_NULL, null, blank |
| alt_text | CharField(255) | blank |
| folder | CharField(50) | default: 'general' |
| is_public | BooleanField | default: True |
| thumbnail | ImageField | null, blank, 150x150 auto-generated |
| medium | ImageField | null, blank, 600x600 auto-generated |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

**Validation**: Supported extensions: jpg, jpeg, png, webp, svg, mp4, webm, pdf. Size limits: images 10MB, videos 100MB, PDFs 25MB.

---

## App: notifications

### Notification
System notifications for users.

| Field | Type | Constraints |
|-------|------|-------------|
| user | ForeignKey(User) | CASCADE, related_name='notifications' |
| title | CharField(255) | |
| message | TextField | |
| type | CharField(50) | choices: request_update, system; default: request_update |
| is_read | BooleanField | default: False |
| created_at | DateTimeField | auto_now_add |

---

## App: cms

### HomepageSection
A section of the public homepage.

| Field | Type | Constraints |
|-------|------|-------------|
| section_key | CharField(100) | unique |
| section_name | CharField(200) | |
| description | TextField | null, blank |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

### HomepageMedia
Media items within a homepage section.

| Field | Type | Constraints |
|-------|------|-------------|
| section | ForeignKey(HomepageSection) | CASCADE, related_name='media' |
| image | ImageField | null, blank, upload: cms/homepage/ |
| alt_text | CharField(255) | blank |
| sort_order | IntegerField | default: 0 |
| is_active | BooleanField | default: True |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

---

## Entity Relationship Overview

```
User
├── Profile (1:1) — role, status
├── uploaded_media -> MediaAsset[]
├── created_services -> Service[]
├── enrollments -> Enrollment[]
├── lesson_progress -> LessonProgress[]
└── notifications -> Notification[]

User (as client)
├── requests -> Request[]
│   ├── attachments -> RequestAttachment[]
│   ├── timeline -> RequestActivity[]
│   ├── notes -> RequestNote[]
│   └── project -> Project (1:1)
│       ├── messages -> ProjectMessage[]
│       ├── files -> ProjectFile[]
│       └── timeline -> ProjectTimeline[]
└── projects -> Project[]

User (as admin)
└── (manages everything via admin endpoints)

ServiceCategory
└── services -> Service[]
    ├── features -> ServiceFeature[]
    ├── gallery -> ServiceGallery[]
    ├── requests -> Request[]
    └── projects -> Project[]

Course
├── enrollments -> Enrollment[]
└── modules -> Module[]
    └── lessons -> Lesson[]
        └── progress_records -> LessonProgress[]

MediaAsset
├── services_thumbnails -> Service[]
└── services_galleries -> ServiceGallery[]

HomepageSection
└── media -> HomepageMedia[]
```

## Key Relationships

- **User → Profile**: One-to-one (auto-created via signal)
- **User → Request**: One-to-many (as client)
- **Request → Project**: One-to-one (auto-created on approval)
- **Service → Request**: One-to-many
- **Service → ServiceCategory**: Many-to-one
- **Project → ProjectMessage/ProjectFile/ProjectTimeline**: One-to-many
- **Course → Enrollment**: One-to-many
- **Course → Module → Lesson**: One-to-many chain
- **Lesson → LessonProgress**: One-to-many
- **User → Notification**: One-to-many
- **HomepageSection → HomepageMedia**: One-to-many
