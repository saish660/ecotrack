from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("accounts", views.accounts, name="accounts"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("signup", views.signup, name="signup"),
    path("survey", views.survey, name="survey"),
    path("get_user_data", views.get_user_data, name="get_user_data"),
    path("get_achievements", views.get_achievements, name="get_achievements"),
    path("save_habit", views.save_habit, name="save_habit"),
    path("update_habit", views.update_habit, name="update_habit"),
    path("delete_habit", views.delete_habit, name="delete_habit"),
    path("submit_questionnaire", views.submit_questionnaire, name="submit_questionnaire"),
    path("get_suggestions", views.get_suggestions, name="get_suggestions")

]