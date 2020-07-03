
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
    dialog_visible:false,
    site_list:[],
    site_pin_map:{},
    transport_list:[],
    new_name:'',
    new_address:'',
    new_date_range:[],
    new_info:'',
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
    },
    add_planned_site_clicked:function(){
      this.dialog_visible = true
      this.new_name = this.selected_site_info.name
      this.new_address = this.selected_site_info.address
    },
    new_pin:function(site){
      console.log(site)
      site.pin = new AMap.Marker({
        position: new AMap.LngLat(site.lng, site.lat),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        title: site.name
      });
      // 将创建的点标记添加到已有的地图实例：
      this.map.add(site.pin);
    },
    delete_pin:function(site){
      this.map.remove(site.pin)
    },
    focus_on_site(site){
      let position = new AMap.LngLat(site.lng,site.lat)
      this.map.setCenter(position)
      this.map.setZoom(default_city_zoom_level)
    },
    site_list_add:function(site){
      this.new_pin(site)
      this.site_list.push(site)
      this.site_list.sort((a,b)=>{return a.start_time - b.start_time})
    },
    site_list_remove:function(index){
      this.delete_pin(this.site_list[index])
      this.site_list.splice(index,1)
    },
    getTime:function (ts) { 
      let now = new Date(ts)
      let year=now.getFullYear(); 
      let month=now.getMonth()+1; 
      let date=now.getDate(); 
      let hour=now.getHours(); 
      let minute=now.getMinutes(); 
      let second=now.getSeconds(); 
      return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    },
    new_planned_site:function(){
      this.dialog_visible = false
      let vm = this
      axios.post('api/newsite', {name:this.new_name,
                                  address:this.new_address,
                                  start_time:this.new_date_range[0].getTime(),
                                  end_time:this.new_date_range[1].getTime(),
                                  info:this.new_info,
                                  lng:this.selected_site_info.location.lng,
                                  lat:this.selected_site_info.location.lat})
                            .then(response=>{
                                if (response.data.msg ==='success') {
                                    //成功
                                    vm.$message({
                                        message: '添加旅行地点成功!',
                                        type: 'success'
                                    });
                                    new_site = response.data.result
                                    console.log(new_site)
                                    vm.site_list_add(new_site)
                                }
                                else{
                                  //失败
                                  vm.$message({
                                    message: '添加旅行地点失败：'+response.data.msg,
                                    type: 'error'
                                });
                                }
                            });
    },
    delete_site_click:function(index){
      let vm = this
      axios.post('api/removesite', {id:this.site_list[index].id})
      .then(response=>{
        if (response.data.msg ==='success') {
          //成功
          vm.$message({
              message: '删除旅行地点成功!',
              type: 'success'
          });
          vm.site_list_remove(index)
        }
        else{
        //失败
         vm.$message({
          message: '删除旅行地点失败：'+response.data.msg,
          type: 'error'
        });
        }
      });
    },
    load_existing_sites:function(){
      let vm = this
      axios.get('site').then(response => {
        existing_sites = response.data
        console.log(existing_sites)
        for (j = 0; j < existing_sites.length; j++){
          vm.site_list_add(existing_sites[j])
          vm.focus_on_site(existing_sites[j])
        }
      })
    }

  },
  mounted:function(){
    this.init_map();
    axios.defaults.xsrfHeaderName = "X-CSRFToken";
    console.log(document.querySelector('#csrf-token').innerHTML)
    axios.defaults.headers.common = {
      'X-CSRFToken':document.querySelector('#csrf-token').innerHTML,
        'X-Requested-With': 'XMLHttpRequest'
    };
    this.load_existing_sites()
  },
});

