from rest_framework import status
from rest_framework.response import Response


class ResponseViewMixin(object):

    @classmethod
    def response(cls, code, message=None, data=None):
        return Response(
            headers={'status': code},
            status=code,
            data={
                'message': message,
                'status': code,
                'data': data
            },
            content_type='application/json'
        )

    @classmethod
    def success_response(cls, code=status.HTTP_200_OK, message=None, data=None):
        return cls.response(code, message, data)

    @classmethod
    def error_response(cls, code=status.HTTP_400_BAD_REQUEST, message=None, data=None):
        return cls.response(code, message, data)

    @classmethod
    def unauthorised_response(cls, code=status.HTTP_401_UNAUTHORIZED, message=None, data=None):
        return cls.response(code, message, data)
