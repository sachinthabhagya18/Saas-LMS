from django.contrib import admin
from .models import Course, Chapter, Session, Enrollment, Assignment, Submission

class SessionInline(admin.StackedInline):
    model = Session
    extra = 1

class ChapterInline(admin.StackedInline):
    model = Chapter
    inlines = [SessionInline]
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'price', 'published', 'created_at')
    list_filter = ('published', 'course_type', 'is_free')
    search_fields = ('title', 'description', 'owner__username')
    prepopulated_fields = {'slug': ('title',)}
    # inlines = [ChapterInline] # Note: nested inlines require 3rd party package or custom logic, usually separate inlines

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    inlines = [SessionInline]

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'chapter', 'media_type', 'order')
    list_filter = ('media_type', 'chapter__course')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'status', 'enrolled_at')
    list_filter = ('status', 'course')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'due_date')

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'submitted_at', 'grade')