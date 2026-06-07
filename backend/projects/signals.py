from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Project, ProjectMessage, ProjectFile, ProjectTimeline
from requests.models import Request
from notifications.models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification(user, title, message, notif_type='system'):
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=notif_type
    )
    
    channel_layer = get_channel_layer()
    group_name = f"user_{user.id}"
    
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_notification",
            "data": {
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "type": notification.type,
                "created_at": notification.created_at.isoformat(),
            }
        }
    )

@receiver(pre_save, sender=Project)
def project_status_changed(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Project.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                display_status = instance.status.replace('_', ' ').title()
                
                # Timeline entry
                ProjectTimeline.objects.create(
                    project=instance,
                    action=f"Project status changed to {display_status}",
                    metadata={'old_status': old_instance.status, 'new_status': instance.status}
                )
                
                # Notification to client
                title = f"Project {display_status}"
                message = f"Your project '{instance.title}' status is now {display_status}."
                send_notification(instance.client, title, message, 'request_update')
                
        except Project.DoesNotExist:
            pass

@receiver(post_save, sender=ProjectMessage)
def project_message_created(sender, instance, created, **kwargs):
    if created:
        ProjectTimeline.objects.create(
            project=instance.project,
            action=f"New message from {instance.sender.username}",
            actor=instance.sender
        )
        
        # Notify the other party
        if instance.sender == instance.project.client:
            # Notify admins (simplification: you might want to notify specific assigned admin, but here we just notify the client when admin sends)
            pass
        else:
            # Admin sent message, notify client
            send_notification(
                instance.project.client, 
                "New Project Message", 
                f"You have a new message on project '{instance.project.title}'.", 
                'system'
            )

@receiver(post_save, sender=ProjectFile)
def project_file_uploaded(sender, instance, created, **kwargs):
    if created:
        ProjectTimeline.objects.create(
            project=instance.project,
            action=f"File uploaded: {instance.file.name}",
            actor=instance.uploaded_by,
            metadata={'file_type': instance.file_type}
        )
        
        # Notify client if admin uploaded a deliverable or revision
        if instance.uploaded_by != instance.project.client:
            if instance.file_type in ['DELIVERABLE', 'REVISION']:
                send_notification(
                    instance.project.client,
                    "New File Delivery",
                    f"A new {instance.get_file_type_display().lower()} has been uploaded for '{instance.project.title}'.",
                    'system'
                )

# We will connect the Request approval logic in the views or a signal in the requests app, but we can also listen to Request pre_save here if needed.
