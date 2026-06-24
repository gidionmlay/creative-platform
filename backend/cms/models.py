from django.db import models


class HomepageSection(models.Model):
    section_key = models.CharField(max_length=100, unique=True)
    section_name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.section_name

    class Meta:
        ordering = ['section_key']


class HomepageMedia(models.Model):
    section = models.ForeignKey(
        HomepageSection, on_delete=models.CASCADE,
        related_name='media'
    )
    image = models.ImageField(upload_to='cms/homepage/', null=True, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.section.section_key} - {self.alt_text or 'Image ' + str(self.sort_order)}"

    class Meta:
        ordering = ['section__section_key', 'sort_order']
        verbose_name_plural = 'Homepage media'


class TeamMember(models.Model):
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200, blank=True)
    photo = models.ImageField(upload_to='cms/team/', null=True, blank=True)
    facebook_url = models.URLField(max_length=500, blank=True)
    twitter_url = models.URLField(max_length=500, blank=True)
    instagram_url = models.URLField(max_length=500, blank=True)
    linkedin_url = models.URLField(max_length=500, blank=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['sort_order']
        verbose_name_plural = 'Team members'


class ServiceBentoCard(models.Model):
    title = models.CharField(max_length=200, unique=True)
    image = models.ImageField(upload_to='cms/services/bento/', null=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    link_anchor = models.CharField(max_length=100, blank=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['sort_order']
        verbose_name_plural = 'Service bento cards'


class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50)
    email = models.EmailField(max_length=254, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.phone}"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Contact messages'
