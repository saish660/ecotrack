from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("accounts", views.accounts, name="accounts"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("signup", views.signup, name="signup"),
    path("survey", views.survey, name="survey"),
]