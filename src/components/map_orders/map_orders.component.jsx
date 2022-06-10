import React from 'react';
import { useHistory } from "react-router-dom";

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Drawer from '@mui/material/Drawer';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { CardItemList } from '../list_orders/';

import CachedIcon from '@mui/icons-material/Cached';
import Typography from '@mui/material/Typography';

import config from '../../stores/config';

const queryString = require('query-string');

class MapOrders_ extends React.Component {
  timerId = null;
  timerId2 = null;
  _isMounted = false;
  map = null;
  
  constructor(props) {
    super(props);
        
    this.state = {
      history: this.props.history,
      module_name: '',
      is_load: false,
      
      del_orders: [],

      orders: [],
      home: null,
      
      is_open: false,
      is_open_order: false,
      showItems: [],
      
      type: { id: 1, text: 'Активные' },
      
      types: [
        { id: 1, text: 'Активные' }, //готовятся и готовы
        { id: 2, text: 'Мои отмеченные' }, //мои
        { id: 5, text: 'У других курьеров' }, 
      ],
      
      rotate: true,
      driver_need_gps: false,
      limit: '',

      is_open_home: false
    };
  }
  
  componentWillUnmount(){
    this._isMounted = false;
    clearInterval(this.timerId);
    clearInterval(this.timerId2);
  }
  
  async componentDidMount(){
    this._isMounted = true;
    
    if((window.location.protocol == 'http:' || window.location.protocol == 'http') && window.location.hostname != 'localhost'){
      window.location.href = 'https://jacodriver.ru/'+window.location.pathname;
    }
    
    if( localStorage.getItem('token') && localStorage.getItem('token').length > 0 ){
      
    }else{
      this.state.history.push("/auth");
      window.location.reload();
    }
    
    navigator.geolocation.getCurrentPosition(success, error, {
      // высокая точность
      enableHighAccuracy: true
    })
    
    function success({ coords }) {
      // получаем широту и долготу
      const { latitude, longitude } = coords
      const position = [latitude, longitude]
      console.log(position) // [широта, долгота]
    }
    
    function error({ message }) {
      console.log(message) // при отказе в доступе получаем PositionError: User denied Geolocation
    }
    
    this.getOrders(false, this.state.type.id);
    this.save_position();
    
    this.timerId2 = setInterval(() => {
      if( this._isMounted ){
        this.save_position();
      }else{
        clearInterval(this.timerId2);
      }
    }, 1000 * 60 * 2);
  }
  
  getData = (method, data = {}) => {
    return fetch(config.urlApi, {
      method: 'POST',
      headers: {
        'Content-Type':'application/x-www-form-urlencoded'},
      body: queryString.stringify({
        type: method, 
        data: JSON.stringify( data )
      })
    }).then(res => res.json()).then(json => {
      return json;
    })
    .catch(err => { 
      //alert('Плохая связь с интернетом или ошибка на сервере')
      console.log( err )
    });
  }
  
  async save_position(){
    navigator.geolocation.getCurrentPosition(success, error, {
      // высокая точность
      enableHighAccuracy: true
    })
    
    function success({ coords }) {
      const { latitude, longitude } = coords
      
      let data1 = {
        token: localStorage.getItem('token'),
        lat: latitude,
        lon: longitude,
      };
      
      fetch('https://jacochef.ru/api/site/driver.php', {
        method: 'POST',
        headers: {
          'Content-Type':'application/x-www-form-urlencoded'},
        body: queryString.stringify({
          type: 'savePosition', 
          data: JSON.stringify( data1 )
        })
      }).then(res => res.json()).then(json => {
        console.log( 'res1', json )
      })
      .catch(err => { 
        console.log( err )
      });
    }
    
    function error({ message }) {
      console.log(message) // при отказе в доступе получаем PositionError: User denied Geolocation
    }
  }
  
  async getOrders(is_load = true, type = 1){
    if( is_load ){
      this.setState({
        is_load: true,
        is_open: false,
      })
    }
    
    let typeInfo = this.state.types.find( (item) => parseInt(item.id) == parseInt(type) );
    
    this.setState({
      type: typeInfo,
    })
    
    let data = {
      token: localStorage.getItem('token'),
      type: type,
      is_map: 1
    };
    
    let res = await this.getData('get_orders_v5', data);
    
    if( res === false ){
      
    }else{
      
      if( (!this.timerId || this.timerId == 0) && res.update_interval != 0 ){
        this.timerId = setInterval(() => {
          if( this._isMounted ){
            this.getOrders(false, this.state.type.id);
          }else{
            clearInterval(this.timerId);
          }
        }, 1000 * parseInt(res.update_interval));
      }
      
      setTimeout( () => {
        let orders = [];
        
        //активные
        if( type == 1 ){
          orders = res.free_orders;
        }
        
        //Мои отмеченные
        if( type == 2 ){
          orders = res.my_orders;
        }
        
        //У других курьеров
        if( type == 5 ){
          orders = res.other_orders;
        }
        
        this.setState({
          driver_need_gps: res.driver_need_gps,
          del_orders: res.arr_del_list,
          orders: orders,
          home: res.home,
          is_load: false,
          limit: res.limit
        })
        
        let objectManager = new ymaps.ObjectManager();
        
        if( !this.map ){
          ymaps.ready(() => {
            this.map = new ymaps.Map('map', {
              center: [res.home.latitude, res.home.longitude],
              //center: [55.76, 37.64],
              zoom: 11
            }, {
              searchControlProvider: 'yandex#search'
            })
            
            let json = {
              "type": "FeatureCollection",
              "features": []
            };
                    
            json.features.push({
              type: "Feature",
              id: -1,
              options: {
                preset: 'islands#blackDotIcon', 
                iconColor: 'black'
              },
              geometry: {
                type: "Point",
                coordinates: [res.home.latitude, res.home.longitude]
              },
            })

            orders.map( function(item){
            
              json.features.push({
                type: "Feature",
                id: item.id,
                options: {
                  preset: parseInt(item.status_order) == 6 ? 'islands#blueCircleDotIconWithCaption' : 'islands#circleDotIcon', 
                  iconColor: item.point_color ? item.point_color : item.color
                },
                properties: {
                  iconCaption: item.point_text,
                  //iconCaption: parseInt(item.status_order) == 6 ? item.close_time_ : parseInt(item.is_pred) == 1 ? item.need_time : parseInt(item.is_my) == 1 ? item.time_start_mini : '',
                },
                geometry: {
                  type: "Point",
                  coordinates: [item.xy.latitude, item.xy.longitude]
                },
              })
              
            } )
            
            objectManager.add(json);
            this.map.geoObjects.add(objectManager);
            
            
          });
        }else{
          
          let json = {
            "type": "FeatureCollection",
            "features": []
          };
                  
          //дом
          json.features.push({
            type: "Feature",
            id: -1,
            options: {
              preset: 'islands#blackDotIcon', 
              iconColor: 'black'
            },
            geometry: {
              type: "Point",
              coordinates: [res.home.latitude, res.home.longitude]
            },
          })
          
          
          orders.map( function(item){
            
            json.features.push({
              type: "Feature",
              id: item.id,
              options: {
                preset: parseInt(item.status_order) == 6 ? 'islands#blueCircleDotIconWithCaption' : 'islands#circleDotIcon', 
                iconColor: item.point_color ? item.point_color : item.color
              },
              properties: {
                iconCaption: item.point_text,
                //iconCaption: parseInt(item.status_order) == 6 ? item.close_time_ : parseInt(item.is_pred) == 1 ? item.need_time : parseInt(item.is_my) == 1 ? item.time_start_mini : '',
              },
              geometry: {
                type: "Point",
                coordinates: [item.xy.latitude, item.xy.longitude]
              },
            })
            
          } )
          
          this.map.geoObjects.removeAll()
          
          objectManager.add(json);
          this.map.geoObjects.add(objectManager);
          
          
        }
        
        objectManager.objects.events.add(['click'], (e) => {
          let order_id = e.get('objectId');

          console.log( 'order_id', order_id )

          if( order_id == -1 || order_id == '-1' ){
            this.setState({ is_open_home: true })
          }else{
            let order = this.state.orders.find( (item) => parseInt(item.id) == parseInt(order_id) );
            
            if( order ){
              this.showOrder(order);
            }
          }
        });
        
      }, 300 )
    }
  }
  
  async actionOrder(id, type){
    //1 - get / 2 - close / 3 - finish
    
    navigator.geolocation.getCurrentPosition(success, error, {
      // высокая точность
      enableHighAccuracy: true
    })
    
    function success({ coords }) {
      
    }
    
    function error({ message }) {
      if( parseInt(this.state.driver_need_gps) == 1 ){
        alert('Чтобы осуществлять доставку заказов, надо разрешить определение местоположения');
        
        return;
      }
    }
    
    this.setState({
      is_load: true
    })
    
    this.setState({
      is_open_order: false,
      showItems: []
    })
    
    if( parseInt(type) == 3 ){
      navigator.geolocation.getCurrentPosition(success, error, {
        // высокая точность
        enableHighAccuracy: true
      })
      
      function success({ coords }) {
        const { latitude, longitude } = coords
        
        let data1 = {
          token: localStorage.getItem('token'),
          order_id: id,
          lat: latitude,
          lon: longitude,
        };
        
        fetch('https://jacochef.ru/api/site/driver.php', {
          method: 'POST',
          headers: {
            'Content-Type':'application/x-www-form-urlencoded'},
          body: queryString.stringify({
            type: 'checkPosition', 
            data: JSON.stringify( data1 )
          })
        }).then(res => res.json()).then(json => {
          console.log( 'res1', json )
        })
        .catch(err => { 
          console.log( err )
        });
      }
      
      function error({ message }) {
        console.log(message) // при отказе в доступе получаем PositionError: User denied Geolocation
        alert('Не удалось опеределить местоположение')
      }
    }
    
    let data = {
      token: localStorage.getItem('token'),
      id: id,
      type: type,
      appToken: localStorage.getItem('appToken') && localStorage.getItem('appToken').length > 0 ? localStorage.getItem('appToken') : ''
    };
    
    let res = await this.getData('actionOrder', data);
    
    if( res['st'] == false ){
      
      alert(res['text'])
      
      this.setState({ 
        is_load: false
      })
    }else{
      
      if( parseInt(res.action_centered_map) == 1 ){
        this.map.setCenter([this.state.home.latitude, this.state.home.longitude], 11);
      }
      
      this.getOrders(true, this.state.type.id)
    }
  }
  
  showOrder(order){
    let orders = this.state.orders;
    
    orders = orders.filter( (item) => item.xy.latitude == order.xy.latitude && item.xy.longitude == order.xy.longitude );
    
    this.setState({
      is_open_order: true,
      showItems: orders
    })
  }
  
  stateHome(){
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords
        
      let data1 = {
        token: localStorage.getItem('token'),
        lat: latitude,
        lon: longitude,
      };
      
      fetch('https://jacochef.ru/api/site/driver.php', {
        method: 'POST',
        headers: {
          'Content-Type':'application/x-www-form-urlencoded'},
        body: queryString.stringify({
          type: 'checkPositionHome', 
          data: JSON.stringify( data1 )
        })
      }).then(res => res.json()).then(json => {
        console.log( 'res1', json )

        this.closeSS();
      })
      .catch(err => { 
        console.log( err )
      });
    }, error, {
      // высокая точность
      enableHighAccuracy: true
    })
    
    function success({ coords }){
      
    }
    
    function error({ message }) {
      if( parseInt(this.state.driver_need_gps) == 1 ){
        alert('Чтобы отметиться на точке, надо разрешить определение местоположения');
        
        return;
      }
    }
  }

  closeSS(){
    this.setState({ is_open_home: false })
  }

  async is_show_del_orders(){

    let idList = [];

    this.state.del_orders.map( (item, key) => {
      idList.push(item.id)
    } )

    let data = {
      token: localStorage.getItem('token'),
      idList: idList
    };
    
    let res = await this.getData('check_close_orders', data);

    this.setState({
      del_orders: []
    })
  }

  render(){
    return (
      <>
        <Backdrop open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '90%', left: '5%', bottom: 50, backgroundColor: '#000', opacity: 0.5, borderRadius: 60 }}>
          <Button style={{ marginLeft: 38, color: this.state.type.id == 1 ? 'green' : '#fff', fontWeight: 'bold' }} onClick={ this.getOrders.bind(this, true, 1) }>Активные</Button>
          <Button style={{ color: this.state.type.id == 2 ? 'green' : '#fff', fontWeight: 'bold' }} onClick={ this.getOrders.bind(this, true, 2) }>Мои</Button>
          <Button style={{ color: this.state.type.id == 5 ? 'green' : '#fff', fontWeight: 'bold' }} onClick={ this.getOrders.bind(this, true, 5) }>У других</Button>
          
          <Button style={{ marginRight: 3 }} onClick={this.getOrders.bind(this, true, this.state.type.id)}><CachedIcon style={{ color: '#fff' }} /></Button>
        </div>
        
        <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', left: 0, bottom: 90 }}>
          <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }} component="span">{this.state.limit}</Typography>
        </div>
        
        <React.Fragment>
          <Drawer
            anchor={'bottom'}
            open={ this.state.del_orders.length > 0 ? true : false }
            onClose={ this.is_show_del_orders.bind(this) }
          >
            <Typography style={{ fontSize: 20, paddingTop: 10, paddingBottom: 10, color: '#000', textAlign: 'center', fontWeight: 'bold' }} component="h6">Удаленные заказы</Typography>

            <div style={{ height: 300, width: '100%', overflow: 'auto', padding: 20, paddingTop: 10 }}>
              { this.state.del_orders.map( (item, key) =>
                <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography style={{ fontSize: 15, color: '#000' }} component="span">Удаленный заказ #{item.id}</Typography>
                  <Typography style={{ fontSize: 15, paddingBottom: 20, color: '#000' }} component="span">Адрес: {item.addr}</Typography>
                </div>
              )}
            </div>
            
            <Button onClick={this.is_show_del_orders.bind(this)}>Хорошо</Button>
          </Drawer>
        </React.Fragment>
        
        <React.Fragment>
          <Drawer
            anchor={'bottom'}
            open={this.state.is_open}
            onClose={ () => { this.setState({ is_open: false }) } }
          >
            { this.state.types.map( (item, key) =>
              <Button key={key} onClick={this.getOrders.bind(this, true, item.id)}>{item.text}</Button>
            ) }
          </Drawer>
        </React.Fragment>
        
        <React.Fragment>
          <Drawer
            anchor={'bottom'}
            open={this.state.is_open_order}
            onClose={ () => { this.setState({ is_open_order: false, showItems: [] }) } }
          >
            { this.state.showItems.map( (item, key) =>
              <CardItemList key={key} item={item} actionOrder={this.actionOrder.bind(this)} />
            )}
          </Drawer>
        </React.Fragment>

        <React.Fragment>
          <Drawer
            anchor={'bottom'}
            open={this.state.is_open_home}
            onClose={ () => { this.setState({ is_open_home: false }) } }
          >
            <Button className='bntAction typeItemsGreen' style={{ width: '100%', margin: '50px 0px' }} onClick={this.stateHome.bind(this)}>Отметиться на точке</Button>
          </Drawer>
        </React.Fragment>
        
        <Grid style={{zIndex: 9, margin: -16}}>
          <div id="map" name="map" style={{ width: '100%', height: 700, paddingTop: 10 }} />
        </Grid>
      </>
    )
  }
}

export function MapOrders () {
  let history = useHistory();
  
  return (
    <MapOrders_ history={history} />
  );
}