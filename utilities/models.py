from django.db import models


class TimeStampModel(models.Model):
    """
    Abstract Model for storing timestamps
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
