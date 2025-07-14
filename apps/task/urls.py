from django.urls import path
from apps.task.views import TaskAPIView, tasks_page, GenerateSummaryView

urlpatterns = [
    path("tasks/", TaskAPIView.as_view(), name="tasks-list-create"),
    path("tasks/<str:pk>/", TaskAPIView.as_view(), name="tasks-detail-update-delete"),
    path("tasks_page/", tasks_page, name="tasks-page"),
    path("generate_summary/", GenerateSummaryView.as_view(), name="generate_summary"),
]
