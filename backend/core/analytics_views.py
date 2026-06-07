from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth, TruncWeek, TruncQuarter, TruncYear
from courses.models import Course, Enrollment
from requests.models import Request
from accounts.models import Profile
from core.permissions import IsAdminUserRole

class AdminAnalyticsOverviewView(generics.GenericAPIView):
    """Admin analytics overview"""
    permission_classes = [IsAdminUserRole]

    def get(self, request, *args, **kwargs):
        total_users = User.objects.count()
        profiles = Profile.objects.all()
        total_students = profiles.filter(role='student').count()
        total_clients = profiles.filter(role='client').count()
        total_admins = profiles.filter(role='admin').count()

        total_enrollments = Enrollment.objects.count()
        active_learners = Enrollment.objects.filter(status='active').values('user').distinct().count()

        total_requests = Request.objects.count()
        pending_requests = Request.objects.filter(status='pending').count()
        approved_requests = Request.objects.filter(status='approved').count()
        rejected_requests = Request.objects.filter(status='rejected').count()

        published_courses = Course.objects.filter(status='published').count()

        # Calculate completion average
        enrollments = Enrollment.objects.all()
        avg_completion = sum(e.progress for e in enrollments) / total_enrollments if total_enrollments > 0 else 0

        # Calculate Monthly Growth (dummy logic based on last 30 days vs prev 30 days for users)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        sixty_days_ago = timezone.now() - timedelta(days=60)
        
        users_last_30 = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        users_prev_30 = User.objects.filter(date_joined__gte=sixty_days_ago, date_joined__lt=thirty_days_ago).count()
        
        monthly_growth = 0
        if users_prev_30 > 0:
            monthly_growth = ((users_last_30 - users_prev_30) / users_prev_30) * 100
        elif users_last_30 > 0:
            monthly_growth = 100.0

        return Response({
            "total_users": total_users,
            "total_students": total_students,
            "total_clients": total_clients,
            "total_admins": total_admins,
            "total_enrollments": total_enrollments,
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "approved_requests": approved_requests,
            "rejected_requests": rejected_requests,
            "published_courses": published_courses,
            "active_students": active_learners,
            "completion_rate": round(avg_completion, 1),
            "monthly_growth": round(monthly_growth, 1)
        })

class AdminUserGrowthAnalyticsView(generics.GenericAPIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, *args, **kwargs):
        range_param = request.query_params.get('range', 'monthly')
        
        if range_param == 'weekly':
            trunc_func = TruncWeek('date_joined')
        elif range_param == 'quarterly':
            trunc_func = TruncQuarter('date_joined')
        elif range_param == 'yearly':
            trunc_func = TruncYear('date_joined')
        else:
            trunc_func = TruncMonth('date_joined')

        qs = User.objects.annotate(period=trunc_func).values('period').annotate(count=Count('id')).order_by('period')
        
        labels = []
        data = []
        for item in qs:
            if item['period']:
                if range_param == 'monthly':
                    labels.append(item['period'].strftime('%b %Y'))
                elif range_param == 'weekly':
                    labels.append(item['period'].strftime('Week %W, %Y'))
                else:
                    labels.append(item['period'].strftime('%Y-%m-%d'))
                data.append(item['count'])

        return Response({
            "range": range_param,
            "labels": labels,
            "data": data
        })

class AdminRequestFlowAnalyticsView(generics.GenericAPIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, *args, **kwargs):
        range_param = request.query_params.get('range', 'monthly')
        
        if range_param == 'weekly':
            trunc_func = TruncWeek('created_at')
        elif range_param == 'quarterly':
            trunc_func = TruncQuarter('created_at')
        elif range_param == 'yearly':
            trunc_func = TruncYear('created_at')
        else:
            trunc_func = TruncMonth('created_at')

        qs = Request.objects.annotate(period=trunc_func).values('period').annotate(count=Count('id')).order_by('period')
        
        labels = []
        data = []
        for item in qs:
            if item['period']:
                if range_param == 'monthly':
                    labels.append(item['period'].strftime('%b %Y'))
                elif range_param == 'weekly':
                    labels.append(item['period'].strftime('Week %W, %Y'))
                else:
                    labels.append(item['period'].strftime('%Y-%m-%d'))
                data.append(item['count'])

        return Response({
            "range": range_param,
            "labels": labels,
            "data": data
        })

class AdminRecentActivityView(generics.GenericAPIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, *args, **kwargs):
        activities = []

        # 1. New Registrations
        recent_users = User.objects.order_by('-date_joined')[:5]
        for u in recent_users:
            activities.append({
                "type": "registration",
                "message": f"New user registered: {u.username}",
                "created_at": u.date_joined
            })

        # 2. Enrollments
        recent_enrollments = Enrollment.objects.order_by('-enrolled_at')[:5]
        for e in recent_enrollments:
            activities.append({
                "type": "enrollment",
                "message": f"{e.user.username} enrolled in {e.course.title}",
                "created_at": e.enrolled_at
            })

        # 3. Requests
        recent_requests = Request.objects.order_by('-created_at')[:5]
        for r in recent_requests:
            activities.append({
                "type": "request",
                "message": f"New request submitted by {r.client.username}",
                "created_at": r.created_at
            })

        # Sort combined list by created_at desc
        activities.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Limit to 15
        activities = activities[:15]

        # Format datetimes
        for a in activities:
            a["created_at"] = a["created_at"].isoformat()

        return Response(activities)
