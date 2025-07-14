from django.db import models
from django.conf import settings
from django.utils import timezone
from utilities.models import TimeStampModel
import uuid
# Create your models here.

class Task(TimeStampModel):
    """
    Task Model
    Represents a task assigned to a user with attributes such as title, description, deadline, and completion status.
    """
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    deadline = models.DateTimeField()
    is_complete = models.BooleanField(default=False)


    @property
    def status(self):
        if self.is_complete:
            return "Completed"
        elif self.deadline < timezone.now():
            return "Missed"
        else:
            return "Upcoming"

    def __str__(self):
        return self.title
