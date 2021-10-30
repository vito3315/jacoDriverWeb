import React, { PureComponent } from 'react';
import { useHistory } from "react-router-dom";

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Drawer from '@mui/material/Drawer';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { CardItemList } from '../list_orders/';

import CachedIcon from '@mui/icons-material/Cached';

const queryString = require('query-string');

class MapOrders_ extends React.Component {
  timerId = null;
  _isMounted = false;
  map = null;
  
  constructor(props) {
    super(props);
        
    this.state = {
      history: this.props.history,
      module_name: '',
      is_load: false,
      
      orders: [],
      home: null,
      
      is_open: false,
      is_open_order: false,
      openOrder: null,
      
      type: { id: -1, text: 'Все заказы' },
      
      types: [
        { id: -1, text: 'Все заказы' },
        { id: 1, text: 'Отмеченные' },
        { id: 2, text: 'Свободные' },
        { id: 3, text: 'В очереди' },
        { id: 4, text: 'Мои завешенные' },
        { id: 5, text: 'У других курьеров' }, 
      ],
    };
  }
  
  componentWillUnmount(){
    this._isMounted = false;
    clearInterval(this.timerId);
  }
  
  async componentDidMount(){
    this._isMounted = true;
    
    
    
    
    
    if( localStorage.getItem('token') && localStorage.getItem('token').length > 0 ){
      
    }else{
      this.state.history.push("/Auth");
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
    
    //document.title = data.module_info.name;
    
    this.timerId = setInterval(() => {
      if( this._isMounted ){
        this.getOrders(false, this.state.type.id);
      }else{
        clearInterval(this.timerId);
      }
    }, 1000 * 30);
    
    setTimeout( () => {
      this.getOrders();
    }, 100 )
  }
  
  getData = (method, data = {}) => {
    return fetch('https://jacochef.ru/api/site/driver.php', {
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
      console.log( err )
    });
  }
  
  async getOrders(is_load = true, type = -1){
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
      type: type
    };
    
    let res = await this.getData('get_orders_new', data);
    
    if( res === false ){
      
    }else{
      setTimeout( () => {
        this.setState({
          orders: res.orders,
          home: res.home,
          is_load: false
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
            
            //дом
            let myGeoObject = new ymaps.GeoObject({
              geometry: {
                type: "Point",
                coordinates: [res.home.latitude, res.home.longitude]
              },
            }, {
              preset: 'islands#blackDotIcon', 
              iconColor: 'black'
            })
            
            this.map.geoObjects.add(myGeoObject);
            
            
            
            let json = {
              "type": "FeatureCollection",
              "features": []
            };
                    
            res.orders.map( function(item){
              
              json.features.push({
                type: "Feature",
                id: item.id,
                options: {
                  preset: 'islands#circleDotIcon', 
                  iconColor: parseInt(item.is_get) == 0 ? parseInt(item.status_order) > 1 ? '#3caa3c' : '#bababa' : parseInt(item.is_my) == 1 ? '#2c75ff' : item.color
                },
                properties: {
                  iconCaption: parseInt(item.is_pred) == 1 ? item.need_time : ''
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
          
          //дом
          let myGeoObject = new ymaps.GeoObject({
            geometry: {
              type: "Point",
              coordinates: [res.home.latitude, res.home.longitude]
            },
          }, {
            preset: 'islands#blackDotIcon', 
            iconColor: 'black'
          })
          
          this.map.geoObjects.add(myGeoObject);
          
          
          
          let json = {
            "type": "FeatureCollection",
            "features": []
          };
                  
          res.orders.map( function(item){
            
            json.features.push({
              type: "Feature",
              id: item.id,
              options: {
                preset: 'islands#circleDotIcon', 
                iconColor: parseInt(item.is_get) == 0 ? parseInt(item.status_order) > 1 ? '#3caa3c' : '#bababa' : parseInt(item.is_my) == 1 ? '#2c75ff' : item.color
              },
              properties: {
                iconCaption: parseInt(item.is_pred) == 1 ? item.need_time : ''
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
          let order = this.state.orders.find( (item) => parseInt(item.id) == parseInt(order_id) );
          
          this.showOrder(order);
        });
        
      }, 1000 )
    }
  }
  
  async actionOrder(id, type){
    //1 - get / 2 - close / 3 - finish
    this.setState({
      is_load: true
    })
    
    if( parseInt(type) == 3 || true ){
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
      }
    }
    
    let data = {
      token: localStorage.getItem('token'),
      id: id,
      type: type
    };
    
    let res = await this.getData('actionOrder', data);
    
    if( res['st'] == false ){
      this.setState({ 
        showErr: true,
        textErr: res['text'],
        is_load: false
      })
    }else{
      this.getOrders(true, this.state.type.id)
    }
  }
  
  showOrder(order){
    this.setState({
      is_open_order: true,
      openOrder: order
    })
  }
  
  render(){
    
    /*<YMaps>
              <Map style={{ width: window.screen.width+60, height: window.screen.height-40 }} defaultState={{ center: [this.state.home.latitude, this.state.home.longitude], zoom: 11 }}>
                
                <TrafficControl options={{ position: {
                  top: 60
                }  }} />
                <ZoomControl options={{ float: 'right' }} />
                
                <Placemark 
                  geometry={[this.state.home.latitude, this.state.home.longitude]} 
                  options={{ preset: 'islands#blackDotIcon', iconColor: 'black' }} />
                
                {this.state.orders.map( (item, key) =>
                  <Placemark 
                    key={key} 
                    onClick={this.showOrder.bind(this, item)}
                    geometry={[item.xy.latitude, item.xy.longitude]} 
                    properties={{ 
                      iconCaption: parseInt(item.is_pred) == 1 ? item.need_time : ''
                    }} 
                    options={{ 
                      preset: 'islands#circleDotIcon', 
                      iconColor: parseInt(item.is_get) == 0 ? parseInt(item.status_order) > 1 ? '#3caa3c' : '#bababa' : parseInt(item.is_my) == 1 ? '#2c75ff' : item.color
                    }} />  
                )}
              </Map>
            </YMaps>*/
    
    return (
      <>
        <Backdrop open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', left: 0 }}>
          <Button style={{ marginLeft: 38 }} onClick={ () => { this.setState({ is_open: true }) } }>{this.state.type.text}</Button>
          
          <Button style={{ marginRight: 3 }} onClick={this.getOrders.bind(this, true, this.state.type.id)}><CachedIcon /></Button>
        </div>
        
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
            onClose={ () => { this.setState({ is_open_order: false, openOrder: null }) } }
          >
            { !this.state.openOrder ? null :
              <CardItemList item={this.state.openOrder} actionOrder={this.actionOrder.bind(this)} />
            }
          </Drawer>
        </React.Fragment>
        
        <Grid style={{zIndex: 9, margin: -16}}>
          
          
          <div id="map" name="map" style={{ width: window.screen.width+60, height: window.screen.height-40 }} />
                    
          
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