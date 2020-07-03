from django.db import models

# Create your models here.

class Site(models.Model):
    site_name = models.CharField(max_length = 256)
    site_address = models.CharField(max_length = 256)
    start_time = models.BigIntegerField()
    end_time = models.BigIntegerField()
    lng = models.FloatField()
    lat = models.FloatField()
    info = models.CharField(max_length = 1024)


class Transport(models.Model):
    from_site = models.ForeignKey(Site,related_name = 'from_site_id',on_delete= models.CASCADE)
    to_site = models.ForeignKey(Site,related_name = 'to_site_id',on_delete = models.CASCADE)
    route = models.CharField(max_length = 256)
    time = models.IntegerField()