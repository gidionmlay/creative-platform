1. USERS (Core Table)

This is the center of everything.

Table: users

Fields:

id
full_name
email (unique)
phone
password_hash
role → (admin, client, student)
is_active
created_at
🔗 Relationships:
User → Projects (client)
User → Courses (student)
User → Requests
🧩 2. CLIENT BUSINESS SYSTEM
📦 Services
Table: services
id
name (Branding, Design, Video…)
description
price (optional)
created_at
🧾 Service Requests
Table: service_requests
id
user_id (client)
service_id
title
description
budget
status → (pending, approved, rejected)
created_at
📁 Projects
Table: projects
id
user_id (client)
service_id
title
description
status → (pending, active, review, completed)
start_date
created_at
📎 Project Files (Important for real system)
Table: project_files
id
project_id
file_url
uploaded_by (admin/user)
created_at
🎓 3. LEARNING SYSTEM
📚 Courses
Table: courses
id
title
description
thumbnail
status (published/draft)
created_at
🎥 Lessons
Table: lessons
id
course_id
title
video_url
order_index
created_at
🧑‍🎓 Enrollments
Table: enrollments
id
user_id (student)
course_id
progress (0–100)
completed (boolean)
created_at
📝 Assignments
Table: assignments
id
course_id
title
description
deadline
📤 Submissions
Table: submissions
id
assignment_id
user_id
file_url
status (submitted/reviewed)
created_at
🏆 Certificates
Table: certificates
id
user_id
course_id
issued_at
🔔 4. ACTIVITY / NOTIFICATIONS SYSTEM (Optional but powerful)
Table: notifications
id
user_id
message
is_read
created_at
📊 5. ANALYTICS (Simple version for now)

You don’t need a table yet—calculate from:

users count
projects count
enrollments
🔗 STEP 3 — RELATIONSHIPS (IMPORTANT)

Think like this:

A User
can request many services
can have many projects
can enroll in many courses
A Course
has many lessons
has many students
A Project
belongs to a client
has files
🧭 STEP 4 — HOW THIS MAPS TO YOUR DASHBOARDS
Admin Dashboard:
users → manage users
projects → manage work
courses → manage learning
Client Dashboard:
service_requests → submit
projects → track progress
Student Dashboard:
enrollments → progress
lessons → learning
submissions → assignments
⚠️ COMMON MISTAKES (AVOID THESE)

❌ Separate tables for each role (bad design)
✔ Use ONE users table + role field

❌ Mixing projects & requests
✔ Keep them separate

❌ No linking between systems
✔ Always use foreign keys

🚀 STEP 5 — SIMPLE ER STRUCTURE (MENTAL MODEL)
User
 ├── Service Requests
 ├── Projects
 ├── Enrollments
       └── Courses
            └── Lessons
            └── Assignments
                 └── Submissions