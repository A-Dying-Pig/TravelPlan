from django.shortcuts import render
from django.http import HttpResponse
import json

from .models import Transport,Site
# Create your views here.

def index(request):
    return render(request,'travel.html')

def site(request):
    site_list = Site.objects.all()
    if not site_list:
        site_list = []
    return HttpResponse(json.dumps(site_list), content_type="application/json")

def transport(request):
    transport_list = Transport.objects.all()
    if not transport_list:
        transport_list = []
    return HttpResponse(json.dumps(transport_list), content_type="application/json")
