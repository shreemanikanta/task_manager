from django.contrib import admin
from apps.task.models import Task

# Register your models here.
@admin.register(Task)
class AppUserAdmin(admin.ModelAdmin):
    list_display = [
        "uuid",
        "title",
        "user",
        "status",
        "deadline",
        "is_complete",
    ]
   