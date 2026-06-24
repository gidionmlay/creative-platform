from django.contrib import admin
from .models import HomepageSection, HomepageMedia


class HomepageMediaInline(admin.TabularInline):
    model = HomepageMedia
    extra = 1


@admin.register(HomepageSection)
class HomepageSectionAdmin(admin.ModelAdmin):
    list_display = ('section_name', 'section_key', 'media_count', 'updated_at')
    prepopulated_fields = {'section_key': ('section_name',)}
    inlines = [HomepageMediaInline]

    def media_count(self, obj):
        return obj.media.filter(is_active=True).count()
    media_count.short_description = 'Active Media'


@admin.register(HomepageMedia)
class HomepageMediaAdmin(admin.ModelAdmin):
    list_display = ('section', 'alt_text', 'sort_order', 'is_active', 'updated_at')
    list_filter = ('section', 'is_active')
