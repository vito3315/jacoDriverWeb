import React from 'react';
import { useHistory } from "react-router-dom";

import { makeStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

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

const queryString = require('query-string');

const theme = createTheme({
  palette: {
    primary: {
      main: '#c03',
    }
  },
});

const useStyles = makeStyles({
  formControl: {
    //margin: theme.spacing(1),
    width: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  tableCel: {
    textAlign: 'center',
    borderRight: '1px solid #e5e5e5',
    padding: 15,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: "#e5e5e5",
    },
  },
  tableCelHead: {
    textAlign: 'center',
    padding: 15
  },
  customCel: {
    backgroundColor: "#bababa",
    textAlign: 'center',
    borderRight: '1px solid #e5e5e5',
    padding: 15,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: "#e5e5e5",
    },
  },
  timePicker: {
    width: '100%'
  }
});

class Settings_ extends React.Component {
  click = false;
  
  constructor(props) {
    super(props);
        
    this.state = {
      classes: this.props.classes,
      history: this.props.history,
      
      is_load: false,
      
      groupTypeTime: 'norm',
      color: 'blue',
      centered_map: false,
    };
  }
  
  componentDidMount(){
    if((window.location.protocol == 'http:' || window.location.protocol == 'http') && window.location.hostname != 'localhost'){
      window.location.href = 'https://jacodriver.ru/'+window.location.pathname;
    }
    
    this.getSettings();  
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
      centered_map: parseInt(res.action_centered_map) == 1 ? true : true
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
      centered_map: this.state.centered_map ? 1 : 0
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
        <Backdrop className={this.state.classes.backdrop} open={this.state.is_load}>
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
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.state.centered_map} onClick={ (event) => { this.setState({ centered_map: event.target.checked }) } } />} label="При действии с карточкой на карте, центрировать карту" />
            </FormGroup>
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
  const classes = useStyles();
  let history = useHistory();
  
  return (
    <Settings_ classes={classes} history={history} />
  );
}