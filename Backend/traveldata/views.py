from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from django.forms.models import model_to_dict
import json

from .models import Transport,Site
# Create your views here.

def index(request):
    return render(request,'travel.html')

def site(request):
    s_list = []
    site_list = Site.objects.all()
    for s in site_list:
        s_list.append(model_to_dict(s))
    return HttpResponse(json.dumps(s_list), content_type="application/json")

def transport(request):
    t_list = []
    transport_list = Transport.objects.all()
    for t in transport_list:
        t_list.append(model_to_dict(t))
    return HttpResponse(json.dumps(t_list), content_type="application/json")

def remove_site(request):
    data = json.loads(request.body.decode('utf-8'))
    the_site = Site.objects.get(id = data['id'])
    the_site.delete()
    return JsonResponse({'msg':'success'})


def new_site(request):
    data = json.loads(request.body.decode('utf-8'))
    print(data)
    #same data
    same_record = Site.objects.filter(site_name=data['name'],
                            site_address=data['address'],
                            start_time=data['start_time'],
                            end_time=data['end_time'],
                            lng = data['lng'],
                            lat = data['lat'])
    # existing  data   
    existing_data = Site.objects.all()
    print("same data:")
    print(same_record)
    if same_record.exists():
        print("same record!")
        return JsonResponse({'msg':'error:same record exists'})

    print("existing data:")
    print(existing_data)
    if existing_data.exists():
        print("comparing existing records")
        # check whether time is proper
        for st in existing_data:
            if data['start_time'] > st.start_time and data['start_time'] <st.end_time:
                return JsonResponse({'msg':'error:time already occupied'})
            if data['end_time']  > st.start_time and data['end_time'] < st.end_time:
                return JsonResponse({'msg':'error:time already occupied'})

    print("inserting a new record")
    insert_result = Site.objects.create(site_name=data['name'],
                            site_address=data['address'],
                            start_time=data['start_time'],
                            end_time=data['end_time'],
                            lng = data['lng'],
                            lat = data['lat'],
                            info= data['info'])
    print("insert result")
    r = model_to_dict(insert_result)
    print(r)
    return JsonResponse({'msg':'success','result':r})

