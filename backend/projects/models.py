from django.db import models
from django.contrib.auth.models import User
from requests.models import Request
from services.models import Service
import os

class Project(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('REVIEWED', 'Reviewed'),
        ('IN_PROGRESS', 'In Progress'),
        ('CLIENT_REVIEW', 'Client Review'),
        ('REVISION_REQUESTED', 'Revision Requested'),
        ('COMPLETED', 'Completed'),
        ('ARCHIVED', 'Archived'),
    )

    request = models.OneToOneField(Request, on_delete=models.CASCADE, related_name='project', null=True, blank=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    progress = models.IntegerField(default=0)  # 0 to 100
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.client.username}"

class ProjectMessage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_project_messages')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message by {self.sender.username} on {self.project.title}"

class ProjectFile(models.Model):
    FILE_TYPE_CHOICES = (
        ('REFERENCE', 'Reference'),
        ('WORK_FILE', 'Work File'),
        ('DELIVERABLE', 'Deliverable'),
        ('REVISION', 'Revision'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_project_files')
    file = models.FileField(upload_to='project_files/%Y/%m/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='REFERENCE')
    file_size = models.PositiveIntegerField(help_text="File size in bytes", default=0)
    is_deliverable = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.file.name} for {self.project.title}"
        
    def save(self, *args, **kwargs):
        if self.file and hasattr(self.file, 'size') and not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

class ProjectTimeline(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='timeline')
    action = models.CharField(max_length=255)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='project_actions')
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.project.title}"
