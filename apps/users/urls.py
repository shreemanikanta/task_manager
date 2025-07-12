from django.urls import path
from apps.users.views import RegisterView, LoginView, LogoutView, register_page, login_page


urlpatterns = [
    path("register/", RegisterView.as_view(), name="user_registration"),
    path("login/", LoginView.as_view(), name="user_login"),
    path("logout/", LogoutView.as_view(), name="logout"),
     path("register_page/", register_page, name="register-page"),
     path("login_page/", login_page, name="login-page"),
]