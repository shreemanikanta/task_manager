from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.task.models import Task
from apps.task.serializers import TaskSerializer
from utilities.mixins import ResponseViewMixin
from utilities.openrouter import generate_task_description


# Create your views here.
class TaskAPIView(APIView, ResponseViewMixin):
    """
    API view for managing user tasks.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        """
        Retrieve a single task by UUID or list all tasks for the authenticated user.
        """
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
        """
        Create a new task for the authenticated user.
        """
        data = request.data.copy()
        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return self.success_response(code=201, data=serializer.data, message="Task created successfully.")
        return self.error_response(data=serializer.errors, message="Invalid task data.")

    def patch(self, request, pk=None):
        """
        Partially update an existing task for the authenticated user.
        """
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
        """
        Delete an existing task for the authenticated user.
        """
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



class GenerateSummaryView(APIView, ResponseViewMixin):
    """
    API view to generate a task summary using OpenRouter AI.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Generate a task description summary based on the provided title.
        """
        title = request.data.get("title")
        if not title:
            return self.error_response(message="Title is required.")

        try:
            generated_summary = generate_task_description(title)
            return self.success_response(
                message="Summary generated successfully",
                data={"summary": generated_summary}
            )
        except Exception as e:
            return self.error_response(message=f"Failed to generate summary: {e}")
