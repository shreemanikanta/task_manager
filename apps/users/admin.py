from django.contrib import admin
from apps.users.models import AppUser

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    ordering = ("email",)
    list_display = [
        "uuid",
        "email",
        "first_name",
        "last_name",
    ]
    readonly_fields = ["email", "password"]
