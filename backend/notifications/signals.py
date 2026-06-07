import json
from django.db.models.signals import pre_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from requests.models import Request
from .models import Notification

@receiver(pre_save, sender=Request)
def request_status_changed(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Request.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                display_status = instance.status.replace('_', ' ').title()
                title = f"Request {display_status}"
                message = f"Your request '{instance.title}' status changed to {display_status}."
                
                # Save notification to DB
                notification = Notification.objects.create(
                    user=instance.client,
                    title=title,
                    message=message,
                    type='request_update'
                )

                # Send via channel layer
                channel_layer = get_channel_layer()
                group_name = f"user_{instance.client.id}"
                
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
        except Request.DoesNotExist:
            pass
