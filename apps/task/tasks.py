from celery import shared_task
from django.utils import timezone
from apps.task.models import Task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@shared_task
def check_and_notify_missed_tasks():
    """
    A Celery task to check for tasks that have missed their deadlines and notify users in real-time.
    """
    now = timezone.now()
    tasks_to_notify = Task.objects.filter(deadline__lt=now, is_complete=False)

    channel_layer = get_channel_layer()

    for task in tasks_to_notify:
        print(f"Task {task.title} is missed!")
        print(f'tasks_user_{task.user.uuid}')
        async_to_sync(channel_layer.group_send)(
            f"tasks_user_{task.user.uuid}",
            {
                "type": "send_task_update",
                "uuid": str(task.uuid),
                "status": "Missed",
            }
        )
