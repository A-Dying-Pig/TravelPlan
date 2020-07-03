from django.urls import path
from . import views

urlpatterns = [
    path('',views.index,name='index'),
    path('site',views.site,name='site'),
    path('transport',views.transport,name='transport'),
    path('api/removesite',views.remove_site,name="remove_site"),
    path('api/newsite',views.new_site,name="new_site"),

]