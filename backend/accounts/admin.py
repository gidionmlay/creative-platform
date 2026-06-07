from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'status', 'phone', 'last_seen')
    list_filter = ('role', 'status')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    list_editable = ('role', 'status')

