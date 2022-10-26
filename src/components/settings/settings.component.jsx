import React from 'react';

import Grid from '@mui/material/Grid';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';

import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';

import { ChromePicker } from 'react-color';

import config from '../../stores/config';

const queryString = require('query-string');

class Settings_ extends React.Component {
  click = false;
  
  constructor(props) {
    super(props);
        
    this.state = {      
      is_load: false,
      
      groupTypeTime: 'norm',
      color: 'blue',
      centered_map: false,
      update_interval: 0,
      update_interval_list: [],
      type_show_del: 'max'
    };
  }
  
  componentDidMount(){
    if((window.location.protocol == 'http:' || window.location.protocol == 'http') && window.location.hostname != 'localhost'){
      window.location.href = 'https://jacodriver.ru/'+window.location.pathname;
    }
    
    this.getSettings();  
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
      alert('Плохая связь с интернетом или ошибка на сервере')
      console.log( err )
    });
  }
   
  async getSettings(){
    let data = {
      token: localStorage.getItem('token'),
    };
    
    let res = await this.getData('getMySetting', data);
    
    this.setState({
      groupTypeTime: res.type_data_map,
      type_show_del: res.type_show_del,
      centered_map: parseInt(res.action_centered_map) == 1 ? true : false,
      update_interval_list: res.update_interval_list,
      update_interval: res.update_interval ? parseInt(res.update_interval) : 30
    })
    
    if( res.color ){
      this.setState({
        color: res.color
      })
    }
  }
  
  async saveMySetting(){
    if( this.click ){
      return;
    }else{
      this.click = true;
    }
    
    this.setState({
      is_load: true
    })
    
    let data = {
      token: localStorage.getItem('token'),
      typeMap: this.state.groupTypeTime,
      color: this.state.color,
      centered_map: this.state.centered_map ? 1 : 0,
      update_interval: this.state.update_interval,
      type_show_del: this.state.type_show_del
    };
    
    let res = await this.getData('saveMySetting', data);
    
    setTimeout( () => {
      this.setState({
        is_load: false
      })
      
      this.click = false;
    }, 300 )
  }
  
  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 999 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <Grid container spacing={3}>
          <Grid item xs={12} style={{ marginTop: 10 }}>
            
            <FormControl component="fieldset">
              <FormLabel component="legend">Формат данных на карте</FormLabel>
              <RadioGroup
                aria-label="gender"
                name="radio-buttons-group"
                value={this.state.groupTypeTime}
                onChange={ (event, data) => { 
                  this.setState({
                    groupTypeTime: data
                  }) 
                } }
              >
                <FormControlLabel value="norm" control={<Radio />} label="Обычный (об заказ - время оформления, пред - промежуток времени)" />
                <FormControlLabel value="full" control={<Radio />} label="Полный (промежуток времени)" />
                <FormControlLabel value="min" control={<Radio />} label="Сокращенный (только оставшееся время)" />
              </RadioGroup>
            </FormControl>
            
          </Grid>

          <Grid item xs={12} style={{ marginTop: 10 }}>
            
            <FormControl component="fieldset">
              <FormLabel component="legend">Отмененные заказы</FormLabel>
              <RadioGroup
                aria-label="gender"
                name="radio-buttons-group"
                value={this.state.type_show_del}
                onChange={ (event, data) => { 
                  this.setState({
                    type_show_del: data
                  }) 
                } }
              >
                <FormControlLabel value="full" control={<Radio />} label="Показывать весь день" />
                <FormControlLabel value="min" control={<Radio />} label="30 минут" />
                <FormControlLabel value="max" control={<Radio />} label="2 часа" />
              </RadioGroup>
            </FormControl>
            
          </Grid>
          
          <Grid item xs={12} style={{ marginTop: 10 }}>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.state.centered_map} onClick={ (event) => { this.setState({ centered_map: event.target.checked }) } } />} label="При действии с карточкой на карте, центрировать карту" />
            </FormGroup>
          </Grid>
          
          <Grid item xs={12} style={{ marginTop: 10 }}>
            
            <FormControl component="fieldset">
              <FormLabel component="legend">Частота обновления заказов</FormLabel>
              <RadioGroup
                aria-label="gender"
                name="radio-buttons-group1"
                value={this.state.update_interval}
                onChange={ (event, data) => { 
                  this.setState({
                    update_interval: data
                  }) 
                } }
              >
                
                {this.state.update_interval_list.map( (item, key) =>
                  <FormControlLabel key={key} value={item.id} control={<Radio />} label={item.name} />
                )}
              </RadioGroup>
            </FormControl>
            
          </Grid>
          
          <Grid item xs={12} style={{ marginTop: 10 }}>
            <ChromePicker 
              style={{ width: '100%' }}
              color={ this.state.color }
              onChangeComplete={ (color) => { this.setState({ color: color.hex }) } }
            />
          </Grid>
          
          <Grid item xs={12} style={{ marginTop: 10 }}>
            <Button onClick={this.saveMySetting.bind(this)} color="primary" style={{ width: '100%' }}>Сохранить</Button>
          </Grid>
          
        </Grid>
      </>
    )
  }
}

export function Settings() {
  return (
    <Settings_ />
  );
}