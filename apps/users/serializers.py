from rest_framework import serializers
from apps.users.models import AppUser
from django.contrib.auth import hashers
import re
from apps.users.messages import (
    ALREADY_EMAIL_EXIST,
    PASSWORD_CRITERIA_NOT_MET,
)
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterSerializer(serializers.ModelSerializer):
    """
    Register Serializer
    """

    email = serializers.CharField(required=False)

    class Meta:
        model = AppUser
        fields = [
            "first_name",
            "last_name",
            "password",
            "email",
        ]

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        regex = "^(?=.*[A-Z])(?=.*[\W_]).{8,}$"

        if email is not None:
            if AppUser.objects.filter(email=email).exists():
                raise serializers.ValidationError(ALREADY_EMAIL_EXIST)
        if not re.match(regex, password):
            raise serializers.ValidationError(PASSWORD_CRITERIA_NOT_MET)

        return attrs

    def save(self, **kwargs):
        """
        Override save
        """
        user = super(RegisterSerializer, self).save(**kwargs)
        user.password = hashers.make_password(self.data["password"])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    """
    Login Serializer
    """

    email = serializers.EmailField(max_length=100)
    password = serializers.CharField(max_length=100)

    class Meta:
        fields = ["email", "password",]

class UserLoginSerializer(serializers.ModelSerializer):
    """
    User Login Serializer
    """

    id = serializers.CharField(source="uuid", read_only=True)
    tokens = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AppUser
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "tokens",
        ]

    def get_tokens(self, obj):
        """
        Get a list of tokens
        """
        refresh = RefreshToken.for_user(obj)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }