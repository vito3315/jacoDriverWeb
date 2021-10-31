import React from 'react';
import { useHistory } from "react-router-dom";

import { makeStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import Stack from '@mui/material/Stack';
import ruLocale from "date-fns/locale/ru";

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

class Price_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      classes: this.props.classes,
      history: this.props.history,
      
      is_load: false,
      
      date: new Date(),
      
      allCount: 0,
      bankCount: 0,
      cashCount: 0,
      bankSum: 0,
      cashSum: 0,
      myPrice: 0,
      sdacha: 0
    };
  }
  
  async componentDidMount(){
    
    console.log( window.location.protocol )
    
    if((window.location.protocol == 'http:' || window.location.protocol == 'http') && window.location.hostname != 'localhost'){
      
      console.log( 'goTo', 'https://jacodriver.ru/'+window.location.pathname )
      
      window.location.href = 'https://jacodriver.ru/'+window.location.pathname;
    }
    
    this.getPrice();  
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
   
  changeDate(date){
    this.setState({
      date: date
    })
    
    setTimeout( () => {
      this.getPrice();
    }, 300 )
  }
  
  async getPrice(){
    
    let date = new Date(this.state.date);
    
    let fullDate = date.getFullYear() + '-';
    fullDate += date.getMonth()+1 + '-';
    fullDate += date.getDate();
    
    let data = {
      token: localStorage.getItem('token'),
      date: fullDate
    };
    
    let res = await this.getData('getMyPrice', data);
    
    console.log( 'load res', res )
    
    this.setState({
      allCount: res.count ?? 0,
      bankCount: res.count_bank ?? 0,
      cashCount: res.count_cash ?? 0,
      bankSum: res.sum_bank ?? 0,
      cashSum: res.sum_cash ?? 0,
      myPrice: res.my_price ?? 0,
      sdacha: res.sdacha ?? 0
    })
    
  }
  
  render(){
    return (
      <>
        <Backdrop className={this.state.classes.backdrop} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3} style={{ marginTop: 10 }}>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
              <Stack spacing={3}>
                <MobileDatePicker
                  label="Дата"
                  
                  allowSameDateSelection={true}
                  showTodayButton={true}
                  startText={this.props.startText}
                  endText={this.props.endText}
                  value={this.props.value}
                  inputFormat="yyyy-MM-dd"
                  
                  value={this.state.date}
                  onChange={(newValue) => { this.changeDate(newValue) }}
                  renderInput={(params) => <TextField {...params} />}
                />
                
              </Stack>
            </LocalizationProvider>
            
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10 }}>
              <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Cумма нала:</Typography>
              <Typography style={{ fontSize: 20, color: '#000' }} component="span">{this.state.cashSum}р.</Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Cумма безнала:</Typography>
              <Typography style={{ fontSize: 20, color: '#000' }} component="span">{this.state.bankSum}р.</Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Заработал:</Typography>
              <Typography style={{ fontSize: 20, color: '#000' }} component="span">{this.state.myPrice}р.</Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 10 }}>
              <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Сдача:</Typography>
              <Typography style={{ fontSize: 20, color: '#000' }} component="span">{this.state.sdacha}р.</Typography>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Количество по налу:</Typography>
              <Typography style={{ fontSize: 20, color: '#000' }} component="span">{this.state.cashCount}</Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Количество по безналу:</Typography>
              <Typography style={{ fontSize: 20, color: '#000' }} component="span">{this.state.bankCount}</Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Завершенных заказов:</Typography>
              <Typography style={{ fontSize: 20, color: '#000' }} component="span">{this.state.allCount}</Typography>
            </div>
            
            
          </Grid>
          
          
          
        </Grid>
      </>
    )
  }
}

export function Price() {
  const classes = useStyles();
  let history = useHistory();
  
  return (
    <Price_ classes={classes} history={history} />
  );
}