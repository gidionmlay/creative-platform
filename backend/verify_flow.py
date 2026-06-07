import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth.models import User
from requests.models import Request
from services.models import Service
from projects.models import Project, ProjectMessage, ProjectFile, ProjectTimeline

def run_flow():
    # 1. Setup users and services
    admin_user, _ = User.objects.get_or_create(username='admin_test', email='admin@test.com')
    client_user, _ = User.objects.get_or_create(username='client_test', email='client@test.com')
    
    service, _ = Service.objects.get_or_create(title='Logo Design Test', base_price=100.00)
    
    # 2. Create Request
    req, _ = Request.objects.get_or_create(
        client=client_user,
        service=service,
        title='My Test Logo Request',
        description='I want a cool logo.',
        status='pending',
        quantity=1
    )
    
    print(f"[*] Request created: {req.id}")
    
    # 3. Simulate API Request Approval logic
    req.status = 'approved'
    req.save()
    
    project, created = Project.objects.get_or_create(
        request=req,
        defaults={
            'client': req.client,
            'service': req.service,
            'title': req.title,
            'description': req.description,
            'status': 'IN_PROGRESS',
            'due_date': req.delivery_date
        }
    )
    
    if created:
        ProjectTimeline.objects.create(
            project=project,
            action="Project created from approved request",
            actor=admin_user
        )
        print(f"[*] Project Workspace created automatically: {project.id}")
    else:
        print(f"[*] Project already existed: {project.id}")

    # 4. Add Messages
    msg = ProjectMessage.objects.create(
        project=project,
        sender=admin_user,
        message='Welcome to the project!'
    )
    print(f"[*] Admin message added. Timeline entries: {ProjectTimeline.objects.filter(project=project).count()}")
    
    # 5. Add Files
    from django.core.files.uploadedfile import SimpleUploadedFile
    dummy_file = SimpleUploadedFile("logo.png", b"file_content", content_type="image/png")
    
    p_file = ProjectFile.objects.create(
        project=project,
        uploaded_by=admin_user,
        file=dummy_file,
        file_type='DELIVERABLE',
        is_deliverable=True
    )
    print(f"[*] Deliverable file uploaded. Timeline entries: {ProjectTimeline.objects.filter(project=project).count()}")
    
    # 6. Change status
    project.status = 'CLIENT_REVIEW'
    project.save()
    print(f"[*] Project status changed to {project.status}. Timeline entries: {ProjectTimeline.objects.filter(project=project).count()}")
    
    project.status = 'COMPLETED'
    project.progress = 100
    project.save()
    ProjectTimeline.objects.create(
        project=project,
        action="Project approved by Client",
        actor=client_user
    )
    print(f"[*] Project Completed. Progress: {project.progress}%. Timeline entries: {ProjectTimeline.objects.filter(project=project).count()}")
    
    print("\nSUCCESS: Complete workflow verified!")

if __name__ == "__main__":
    run_flow()
