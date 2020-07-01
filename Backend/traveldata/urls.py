from django.urls import path
from . import views

urlpatterns = [
    path('',views.index,name='index'),
    path('site',views.site,name='site'),
    path('transport',views.transport,name='transport')

]