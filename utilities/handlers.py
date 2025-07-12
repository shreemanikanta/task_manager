from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.exceptions import NotAuthenticated
from rest_framework.views import set_rollback

from utilities.mixins import ResponseViewMixin
from django.conf import settings


def exception_handler(exc, context):
    import traceback
    print(traceback.format_exc())
    if isinstance(exc, Http404):
        exc = exceptions.NotFound()
    elif isinstance(exc, PermissionDenied):
        exc = exceptions.PermissionDenied()
    elif isinstance(exc, NotAuthenticated):
        exc = exceptions.NotAuthenticated()

    if isinstance(exc, exceptions.APIException):
        headers = {}
        if getattr(exc, "auth_header", None):
            headers["WWW-Authenticate"] = exc.auth_header
        if getattr(exc, "wait", None):
            headers["Retry-After"] = "%d" % exc.wait

        if isinstance(exc.detail, (list, dict)):
            data = exc.detail
            message = None
        else:
            data = None
            message = exc.detail

        set_rollback()
        return ResponseViewMixin().error_response(
            data=data, code=exc.status_code, message=message
        )

    message = "Something went wrong"
    if settings.DEBUG == 'True':
        message += f': {exc}'
    return ResponseViewMixin().error_response(
            code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message=message,
        )
