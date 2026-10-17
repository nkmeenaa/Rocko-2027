from django.urls import path

from . import views

urlpatterns = [
    path("", views.register_team, name="register_team"),
    path("members/", views.member_details, name="member_details"),
]
