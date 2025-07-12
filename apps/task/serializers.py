from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["uuid", "title", "description", "deadline", "is_complete", "status", "created_at", "updated_at"]

    def get_status(self, obj):
        return obj.status
