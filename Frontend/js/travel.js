
var mapWidth = '600px', mapHeight = '300px';
var default_city_zoom_level = 12
var default_site_zoom_level = 16

var app =  new Vue({
  el:'#app',
  data:{
    mapWidth:mapWidth,
    mapHeight:mapHeight,
    city:'',
    site: '',
    selected_site_info:null,
  },
  methods:{
    init_map:function(){
      this.map = new AMap.Map('map',{
        zoom: default_city_zoom_level,
        center: [116.397428, 39.90923],
      });
    },
    city_search:function(){
      this.site = ''
      this.selected_site_info = null
      if (this.city === '')
        return
      let vm = this;
      AMap.plugin('AMap.DistrictSearch', function () {
        var districtSearch = new AMap.DistrictSearch({
          // 关键字对应的行政区级别，country表示国家
          level: 'city',
          //  显示下级行政区级数，1表示返回下一级行政区
          subdistrict: 1
        })
        
        // 搜索所有省/直辖市信息\
        console.log(vm.city)
        districtSearch.search(vm.city, function(status, result) {
          // 查询成功时，result即为对应的行政区信息
          console.log(result)
          console.log(status)
          //get lat and long
          if (status !== 'complete'){
            vm.city = ''
            vm.$message.error('无效城市!');
            return
          }
          best_matched_city = result.districtList[0]
          city_lat = best_matched_city.center.lat
          city_lng = best_matched_city.center.lng
          let position = new AMap.LngLat(city_lng,city_lat)
          vm.map.setCenter(position)
          vm.map.setZoom(default_city_zoom_level)
        })
      })
    },
    site_search:function(keyword,cb){
      this.selected_site_info = null
      if(keyword === ''){
        cb([])
        return
      }
      let vm = this
      AMap.plugin('AMap.Autocomplete', function(){
        // 实例化Autocomplete
        var autoOptions = {
          //city 限定城市，默认全国
          city: '全国'
        }
        if (vm.city !== ''){
          autoOptions.city = vm.city
        }
        var autoComplete= new AMap.Autocomplete(autoOptions);
        autoComplete.search(keyword, function(status, result) {
          // 搜索成功时，result即是对应的匹配数据
          if (status !== 'complete'){
            vm.$message.error('无效地点!');
            cb([])
            return
          }
          console.log(result)
          if (result.tips.length === 1 && keyword === result.tips[0].name){
            vm.tip_select(result.tips[0])
          }
          site_tips = result.tips.map((val,index)=>{val.value = val.name; return val})
          cb(site_tips)
        })
      })

    },
    tip_select:function(item){
      this.selected_site_info = item
      console.log(item)
      site_lat = item.location.lat
      site_lng = item.location.lng
      let position = new AMap.LngLat(site_lng,site_lat)
      this.map.setCenter(position)
      this.map.setZoom(default_site_zoom_level)
    }

  },
  mounted:function(){
    this.init_map();
  },
});

