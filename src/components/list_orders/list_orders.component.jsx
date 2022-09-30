import React, { PureComponent } from 'react';
import { useHistory } from "react-router-dom";
import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Drawer from '@mui/material/Drawer';

import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import CachedIcon from '@mui/icons-material/Cached';

import config from '../../stores/config';

const queryString = require('query-string');

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#000',
    color: '#fff',
    marginTop: 0,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    borderRadius: 5
  },
}));

export class CardItemList extends PureComponent{
  _isMounted = false;
  
  constructor(props) {
    super(props);
    
    this.state = { 
      openTooltip: false,
      is_load: false
    };
  }
  
  componentWillUnmount(){
    this._isMounted = false;
  }
  
  componentDidMount(){
    this._isMounted = true;
  }
  
  finishOrder(id){
    if(confirm("Точно завершить заказ ?")) {
      this.props.actionOrder(id, 3)
    } else {
      
    }
  }
  
  cancelOrder(id){
    if(confirm("Отменить заказ ?")) {
      this.props.actionOrder(id, 2)
    } else {
      
    }
  }

  checkFakeOrder(order_id){

    this.setState({
      is_load: true
    })

    setTimeout( () => {
      this.setState({
        is_load: false
      })
    }, 5000 )

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords
        
      let data1 = {
        token: localStorage.getItem('token'),
        order_id: order_id,
        lat: latitude,
        lon: longitude,
      };
      
      fetch('https://jacochef.ru/api/site/driver.php', {
        method: 'POST',
        headers: {
          'Content-Type':'application/x-www-form-urlencoded'},
        body: queryString.stringify({
          type: 'checkFakeOrder', 
          data: JSON.stringify( data1 )
        })
      }).then(res => res.json()).then(json => {
        console.log( 'res1', json )

        if( json['st'] === false ){
          alert(json['text']);
        }else{
          alert('Успешно')
        }

        setTimeout( () => {
          this.setState({
            is_load: false
          })
        }, 500 )
      })
      .catch(err => { 
        console.log( err )
      });
    }, error, {
      // высокая точность
      enableHighAccuracy: true
    })

    function error({ message }) {
      alert('Не удалось определить местоположение');
      
      return;
    }
  }

  fakeOrder(order_id){
    if(confirm("Клиент точно не вышел на свзяь ?")) {
      this.checkFakeOrder(order_id)
    } else {
      
    }
  }
  
  render(){
    const item = this.props.item;
    
    const width = '100%';
    
    return(
      <div className='container'>
            
          <Backdrop open={this.state.is_load} style={{ zIndex: 99 }}>
            <CircularProgress color="inherit" />
          </Backdrop>

        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 10 }}>
          <Typography style={{ fontSize: 20, color: '#000' }} component="span">{item.id_text}</Typography>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
          
          { parseInt(item.count_other) == 0 ? null :
            <Typography className='textBold typeItems typeItemsBlue' style={{ marginRight: 5 }} component="span">Роллы</Typography>
          }

          { parseInt(item.count_pasta) == 0 ? null :
            <Typography className='textBold typeItems typeItemsPurpur' style={{ marginRight: 5 }} component="span">Паста x{item.count_pasta}</Typography>
          }
          
          { parseInt(item.count_pizza) == 0 ? null :
            <Typography className='textBold typeItems typeItemsRed' style={{ marginLeft: 5, marginRight: 5 }} component="span">Пицца x{item.count_pizza}</Typography>
          }
          
          { parseInt(item.count_drink) == 0 ? null :
            <HtmlTooltip
              style={{ marginTop: 0 }}
              open={this.state.openTooltip}
              onClose={ () => { this.setState({ openTooltip: false }) } }
              title={
                <React.Fragment>
                  { item.drink_list.map( (drink, k) =>
                    <Typography key={k} className="text" style={{paddingBottom: 5, paddingTop: 2, color: '#fff'}}>{drink.names}</Typography>
                  ) }
                </React.Fragment>
              }
            >
              <Typography onClick={ () => { this.setState({ openTooltip: true }) } } className='textBold typeItems typeItemsGreen' style={{ marginLeft: 5, marginRight: 5 }} component="span">Напиток x{item.count_drink}</Typography>
            </HtmlTooltip>
          }
          
        </div>
        
        
        <div style={{ display: 'flex', flexDirection: 'column', width: width, paddingBottom: 15 }}>
          
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Адрес: </Typography>
            <Typography style={{ fontSize: 20, color: '#000' }} component="span">{item.addr}</Typography>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            
            { item.pd.length == 0 || parseInt(item.pd) == 0 ? null :
              <>
                <Typography className='textBold' component="span" style={{ paddingRight: 5 }}>Пд:</Typography>
                <Typography className='text' component="span"  style={{ paddingRight: 5 }}>{item.pd},</Typography>
              </>
            }
            
            { item.et.length == 0 || parseInt(item.et) == 0 ? null :
              <>
                <Typography className='textBold' component="span" style={{ paddingRight: 5 }}>Эт: </Typography>
                <Typography className='text' component="span" style={{ paddingRight: 5 }}>{item.et},</Typography>
              </>
            }
            
            { item.kv.length == 0 || parseInt(item.kv) == 0 ? null :
              <>
                <Typography className='textBold' component="span" style={{ paddingRight: 5 }}>Кв:</Typography>
                <Typography className='text' component="span" style={{ paddingRight: 5 }}>{item.kv}</Typography>
              </>
            }
          </div>
          
          { parseInt(item.fake_dom) == 0 ?
            <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Домофон не работает</Typography>
              :
            null
          }
          
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 5, paddingTop: 10 }}>
            <Typography className='textBold' style={{ paddingRight: 5 }}>Ко времени: </Typography>
            <Typography className='text'>{item.need_time}</Typography>  
          </div>
          
          { parseInt(item.status_order) !== 1 ? null :
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography className='textBold' style={{ paddingRight: 5 }}>Начнут готовить: </Typography>
              <Typography className='text'>{item.time_start_order}</Typography>
            </div>
          }
          
          { parseInt(item.status_order) !== 6 ? null :
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography className='textBold' style={{ paddingRight: 5 }}>Отдали: </Typography>
              <Typography className='text'>{item.close_date_time_order}</Typography>
            </div>
          }
          
          { parseInt(item.status_order) == 6 ? null :
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography className='textBold' style={{ paddingRight: 5 }}>Осталось: </Typography>
              <Typography className='text'>{item.to_time}</Typography>
            </div>
          }
          
        </div>
        
        { item.comment.length == 0 ? null :
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 5, width: width }}>
            <Typography className='textBold' style={{ paddingRight: 5 }}>Коммент: </Typography>
            <Typography className='text'>{item.comment}</Typography>
          </div>
        }
        
        { parseInt(item.is_delete) == 0 ? null :
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 5, width: width }}>
            <Typography className='textBold' style={{ paddingRight: 5 }}>Причина удаления: </Typography>
            <Typography className='text'>{item.delete_reason}</Typography>
          </div>
        }
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 5, width: width }}>
          <Typography className='textBold' style={{ paddingRight: 5 }}>Сумма: </Typography>
          
          { parseInt(item.online_pay) == 1 ?
            <Typography style={{fontSize: 15, color: '#fc2847', fontWeight: 'bold' }}>Оплачено</Typography>
              :
            <Typography className='text'>{item.sum_order}р.</Typography>
          }
        </div>
        
        { parseInt( item.sdacha ) == 0 || parseInt(item.online_pay) == 1 ? null :
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 5, width: width }}>
            <Typography className='textBold' style={{ paddingRight: 5 }}>Сдача с: </Typography>
            <Typography className='text'>{item.sdacha}р. ( {item.sum_sdacha}р. )</Typography>
          </div>
        }
        
        { parseInt(item.is_get) == 0 ?
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 0, width: width, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
            <a className='bntAction typeItemsGray' style={{ width: '100%', marginBottom: 10 }} href={"tel:"+item.number}>{item.number}</a>
            <Button className='bntAction typeItemsGreen' style={{ width: '100%' }} onClick={this.props.actionOrder.bind(this, item.id, 1)}>Взять</Button>
          </div>
            :
          parseInt(item.is_get) == 1 && parseInt(item.is_my) == 1 ?
            <div style={{ display: 'flex', flexDirection: 'column', width: width, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
              
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: width }}>
                { parseInt(item.status_order) == 6 ? null :
                  <Button className='bntAction typeItemsRed' style={{ width: '40%', marginRight: 5 }} onClick={this.cancelOrder.bind(this, item.id)}>Отменить</Button>
                }
                <a className='bntAction' style={{ width: parseInt(item.status_order) != 6 ? '60%' : '100%', marginLeft: 5, backgroundColor: '#bababa' }} href={"tel:"+item.number}>{item.number}</a>
              </div>
              
              { parseInt(item.status_order) == 6 ? null :
                <Button className='bntAction typeItemsGreen' style={{ width: width, marginTop: 20 }} onClick={this.finishOrder.bind(this, item.id)}>Завершить</Button>
              }

              { parseInt(item.status_order) == 6 ? null :
                <Button className='bntAction typeItemsYellow' style={{ width: width, marginTop: 20 }} onClick={this.fakeOrder.bind(this, item.id)}>Клиент не вышел на связь</Button>
              }
            </div>
              :
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 0, width: width, alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
              <Button className='bntAction typeItemsGray' style={{ width: '100%', textAlign: 'center' }}>{item.driver_name}</Button>
              <a className='bntAction typeItemsGray' style={{ width: '100%', textAlign: 'center', marginTop: 20, color: '#000' }} href={"tel:"+item.driver_login}>{item.driver_login}</a>
            </div>
        }
        
        
      </div>
    )
  }
}

class ListOrders_ extends React.Component {
  timerId = null;
  timerId2 = null;
  _isMounted = false;
  
  constructor(props) {
    super(props);
        
    this.state = {
      history: this.props.history,
      module_name: '',
      is_load: false,
      
      del_orders: [],

      orders: [],
      
      is_open: false,
      
      type: { id: 1, text: 'Активные' },
      
      types: [
        { id: 1, text: 'Активные' }, //готовятся и готовы
        { id: 3, text: 'Предзаказы' }, //более часа
        { id: 2, text: 'Мои отмеченные' }, //мои
        { id: 5, text: 'У других курьеров' }, 
        { id: 6, text: 'Мои завершенные' }, //мои завершенеы
      ],
      
      driver_need_gps: false,
      limit: ''
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
    
    setTimeout( () => {
      this.getOrders();
    }, 100 )
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
      is_map: 0
    };
    
    let res = await this.getData('get_orders_v6', data);
    
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
        
        //преды
        if( type == 3 ){
          orders = res.pred_orders;
        }
        
        //мои завершенные
        if( type == 6 ){
          orders = res.my_finish;
        }
        
        this.setState({
          driver_need_gps: res.driver_need_gps,
          del_orders: res.arr_del_list,
          orders: orders,
          is_load: false,
          limit: res.limit
        })
      }, 300 )
    }
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
      this.getOrders(true, this.state.type.id)
    }
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
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={ () => { this.setState({ is_open: true }) } }>{this.state.type.text}</Button>
          
          <Button style={{ marginRight: 3 }} onClick={this.getOrders.bind(this, true, this.state.type.id)}><CachedIcon /></Button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
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
        
        <Grid container spacing={3}>
          
          { this.state.orders.map( (item, key) =>
            <Grid item xs={12} sm={3} key={key}>
              <CardItemList item={item} actionOrder={this.actionOrder.bind(this)} />
            </Grid>
          ) }
        </Grid>
      </>
    )
  }
}

export function ListOrders () {
  let history = useHistory();
  
  return (
    <ListOrders_ history={history} />
  );
}