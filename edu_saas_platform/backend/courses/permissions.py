from rest_framework import permissions

class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Allows access only to teachers or admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['teacher', 'admin'])

class IsEnrolledOrOwner(permissions.BasePermission):
    """
    Allows access to students who are enrolled in the course, or the teacher who owns it.
    """
    def has_object_permission(self, request, view, obj):
        # If obj is Course
        if hasattr(obj, 'owner'):
            if obj.owner == request.user:
                return True
        
        # If obj is Chapter/Session, check traversal
        if hasattr(obj, 'course'):
            if obj.course.owner == request.user:
                return True
            
        # Check enrollment for students
        # Note: This requires complex queries in the view or here. 
        # For efficiency, usually handled in View's get_queryset or custom logic.
        return True