from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.task_list_create, name='task_list_create'),
    path('tasks/<int:pk>/', views.task_detail_update_delete, name='task_detail_update_delete'),
    path('stats/', views.task_stats, name='task_stats'),
    path('health/', views.health_check, name='health_check'),
]
