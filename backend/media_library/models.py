import os
import mimetypes
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

def upload_to_path(instance, filename):
    # Sanitize and place in subfolders
    folder = instance.folder or 'general'
    folder = folder.strip('/').strip('\\')
    return os.path.join(folder, filename)

class MediaAsset(models.Model):
    FILE_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('document', 'Document'),
        ('other', 'Other'),
    )

    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to=upload_to_path)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveIntegerField(blank=True, null=True) # in bytes
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_media')
    alt_text = models.CharField(max_length=255, blank=True)
    folder = models.CharField(max_length=50, default='general')
    is_public = models.BooleanField(default=True)
    
    # Pre-generated image variants
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True, max_length=500)
    medium = models.ImageField(upload_to='medium/', blank=True, null=True, max_length=500)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title or os.path.basename(self.file.name)

    def clean(self):
        super().clean()
        if not self.file:
            return

        # 1. Size check
        size = self.file.size
        # Get extension
        ext = os.path.splitext(self.file.name)[1].lower().strip('.')
        # Guess mime type
        mime, _ = mimetypes.guess_type(self.file.name)
        if not mime:
            if ext in ['jpg', 'jpeg', 'png', 'webp', 'svg']:
                mime = f"image/{ext}"
            elif ext in ['mp4', 'webm']:
                mime = f"video/{ext}"
            elif ext == 'pdf':
                mime = 'application/pdf'
            else:
                mime = 'application/octet-stream'

        # Auto-detect file type category
        if mime.startswith('image/') or ext in ['jpg', 'jpeg', 'png', 'webp', 'svg']:
            ftype = 'image'
        elif mime.startswith('video/') or ext in ['mp4', 'webm']:
            ftype = 'video'
        elif mime == 'application/pdf' or ext == 'pdf':
            ftype = 'pdf'
        elif mime.startswith('application/') or mime.startswith('text/'):
            ftype = 'document'
        else:
            ftype = 'other'

        # Set auto fields
        self.file_type = ftype
        self.mime_type = mime
        self.file_size = size
        if not self.title:
            self.title = os.path.splitext(os.path.basename(self.file.name))[0].replace('_', ' ').replace('-', ' ').title()

        # 2. Validation Limits
        # Images: 10MB
        if ftype == 'image' and size > 10 * 1024 * 1024:
            raise ValidationError("Image file size cannot exceed 10MB.")
        # Videos: 100MB
        if ftype == 'video' and size > 100 * 1024 * 1024:
            raise ValidationError("Video file size cannot exceed 100MB.")
        # PDF: 25MB
        if ftype == 'pdf' and size > 25 * 1024 * 1024:
            raise ValidationError("PDF file size cannot exceed 25MB.")

        # Allowable extensions/mimes validation
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'mp4', 'webm', 'pdf']
        if ext not in allowed_extensions:
            raise ValidationError(f"Unsupported file extension '.{ext}'. Allowed: {', '.join(allowed_extensions)}")

        if ftype == 'image' and ext not in ['jpg', 'jpeg', 'png', 'webp', 'svg']:
            raise ValidationError(f"Unsupported image extension '.{ext}'. Allowed: jpg, jpeg, png, webp, svg")
        if ftype == 'video' and ext not in ['mp4', 'webm']:
            raise ValidationError(f"Unsupported video extension '.{ext}'. Allowed: mp4, webm")
        if ftype == 'pdf' and ext != 'pdf':
            raise ValidationError(f"Unsupported document extension '.{ext}'. Allowed: pdf")

    def save(self, *args, **kwargs):
        # Trigger clean
        self.full_clean()
        
        # Generate variants if it's a new image (and not SVG) before saving
        if not self.pk and self.file_type == 'image' and self.mime_type != 'image/svg+xml' and self.file:
            try:
                self.file.seek(0)
                img = Image.open(self.file)
                
                fmt = img.format or 'JPEG'
                if img.mode in ('RGBA', 'LA') and fmt == 'JPEG':
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background

                # 1. Thumbnail (150x150 max)
                thumb_img = img.copy()
                thumb_img.thumbnail((150, 150))
                thumb_io = BytesIO()
                thumb_img.save(thumb_io, format=fmt, quality=80)
                thumb_file = ContentFile(thumb_io.getvalue())
                
                # 2. Medium (600x600 max)
                medium_img = img.copy()
                medium_img.thumbnail((600, 600))
                medium_io = BytesIO()
                medium_img.save(medium_io, format=fmt, quality=85)
                medium_file = ContentFile(medium_io.getvalue())

                base_name = os.path.basename(self.file.name)
                name_parts = os.path.splitext(base_name)
                thumb_name = f"{name_parts[0]}_thumb{name_parts[1]}"
                medium_name = f"{name_parts[0]}_medium{name_parts[1]}"

                self.thumbnail.save(thumb_name, thumb_file, save=False)
                self.medium.save(medium_name, medium_file, save=False)
            except Exception as e:
                print(f"Failed to generate image variants: {e}")
        
        super().save(*args, **kwargs)
