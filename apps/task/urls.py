from django.urls import path
from apps.task.views import TaskAPIView, tasks_page

urlpatterns = [
    # List all tasks or create a new task
    path("tasks/", TaskAPIView.as_view(), name="tasks-list-create"),

    # Retrieve, update or delete a single task by ID
    path("tasks/<str:pk>/", TaskAPIView.as_view(), name="tasks-detail-update-delete"),

    path("tasks_page/", tasks_page, name="tasks-page"),
]
