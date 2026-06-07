from django.contrib import admin
from .models import Request, RequestAttachment


class RequestAttachmentInline(admin.TabularInline):
    model = RequestAttachment
    extra = 0
    readonly_fields = ('file', 'uploaded_at')


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'service', 'status', 'budget', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'client__username', 'client__email', 'description')
    inlines = [RequestAttachmentInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(RequestAttachment)
class RequestAttachmentAdmin(admin.ModelAdmin):
    list_display = ('request', 'file', 'uploaded_at')
    list_filter = ('uploaded_at',)
