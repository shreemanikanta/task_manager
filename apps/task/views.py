from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from apps.task.models import Task
from apps.task.serializers import TaskSerializer
from utilities.mixins import ResponseViewMixin 

# Create your views here.
class TaskAPIView(APIView, ResponseViewMixin):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            try:
                task = Task.objects.get(uuid=pk, user=request.user)
            except Task.DoesNotExist:
                return self.error_response(message="Task not found.")
            serializer = TaskSerializer(task)
            return self.success_response(message="Successfully fetched", data=serializer.data)
        else:
            tasks = Task.objects.filter(user=request.user)
            serializer = TaskSerializer(tasks, many=True)
            return self.success_response(message="Successfully fetched", data=serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return self.success_response(code=201, data=serializer.data, message="Task created successfully.")
        return self.error_response(data=serializer.errors, message="Invalid task data.")

    def patch(self, request, pk=None):
        try:
            task = Task.objects.get(uuid=pk, user=request.user)
        except Task.DoesNotExist:
            return self.error_response(message="Task not found.")
        
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return self.success_response(data=serializer.data, message="Task updated successfully.")
        return self.error_response(data=serializer.errors, message="Invalid task data.")

    def delete(self, request, pk=None):
        try:
            task = Task.objects.get(uuid=pk, user=request.user)
        except Task.DoesNotExist:
            return self.error_response(message="Task not found.")
        
        task.delete()
        return self.success_response(message="Task deleted successfully.", code=200)
    

def tasks_page(request):
    """
    Render the tasks HTML template.
    """
    return render(request, "task/task.html")