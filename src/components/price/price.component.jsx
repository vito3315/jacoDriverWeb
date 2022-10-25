import React from 'react';
import { useHistory } from "react-router-dom";

import { makeStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import TextField from '@mui/material/TextField';
//import AdapterDateFns from '@mui/lab/AdapterDateFns';
//import LocalizationProvider from '@mui/lab/LocalizationProvider';
//import MobileDatePicker from '@mui/lab/MobileDatePicker';
import Stack from '@mui/material/Stack';
import ruLocale from "date-fns/locale/ru";

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';


import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import config from '../../stores/config';

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

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

class Price_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      classes: this.props.classes,
      history: this.props.history,
      
      is_load: false,
      
      date: formatDate(new Date()),
      
      allCount: 0,
      bankCount: 0,
      cashCount: 0,
      bankSum: 0,
      cashSum: 0,
      myPrice: 0,
      sdacha: 0,
      
      myCash: 0,
      
      giveList: [],
      full_give: 0
    };
  }
  
  async componentDidMount(){
    /*if((window.location.protocol == 'http:' || window.location.protocol == 'http') && window.location.hostname != 'localhost'){
      window.location.href = 'https://jacodriver.ru/'+window.location.pathname;
    }*/
    
    this.getPrice();  
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
   
  changeDate(date){
    this.setState({
      date: formatDate(date)
    })
    
    setTimeout( () => {
      this.getPrice();
    }, 300 )
  }
  
  async getPrice(){
    
    let date = new Date(this.state.date);
    
    let day = date.getDate();
    day = parseInt(day) > 9 ? day : '0'+day;
    
    let month = date.getMonth()+1;
    month = parseInt(month) > 9 ? month : '0'+month;

    let fullDate = date.getFullYear() + '-';
    fullDate += month + '-';
    fullDate += day;
    
    
    let data = {
      token: localStorage.getItem('token'),
      date: fullDate
    };
    
    let res = await this.getData('getMyPrice_v2', data);
    
    this.setState({
      allCount: res.stat.count ?? 0,
      bankCount: res.stat.count_bank ?? 0,
      cashCount: res.stat.count_cash ?? 0,
      bankSum: res.stat.sum_bank ?? 0,
      cashSum: res.stat.sum_cash ?? 0,
      myPrice: res.stat.my_price ?? 0,
      sdacha: res.stat.sdacha ?? 0,
      
      myCash: res.stat.my_cash ?? 0,
      giveList: res.give_hist ?? [],
      full_give: res.stat.full_give ?? 0
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
              <DatePicker
                multiple={false}
                mask="____-__-__"
                inputFormat="yyyy-MM-dd"
                label={"Дата"}
                value={formatDate(this.state.date)}
                onChange={(newValue) => { this.changeDate(newValue) }}
                renderInput={(params) => <TextField variant="outlined" size={'small'} color='primary' style={{ width: '100%' }} {...params} />}
              />
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
            
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 10 }}>
              <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000', paddingRight: 5 }} component="span">Налички:</Typography>
              <Typography style={{ fontSize: 20, color: '#000' }} component="span">{this.state.myCash}р.</Typography>
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
          
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3} style={{ marginTop: 10 }}>
            <Paper sx={{ width: '100%' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Время</TableCell>
                      <TableCell>Сданная сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    { this.state.giveList.map( (rowData, index) =>
                      <TableRow hover key={index}>
                        <TableCell>{rowData.time}</TableCell>
                        <TableCell>{rowData.give} р.</TableCell>
                      </TableRow>
                    ) }
                  </TableBody>
                  
                  <TableFooter>
                    <TableRow>
                      <TableCell>Итого</TableCell>
                      <TableCell>{this.state.full_give} р.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Осталось</TableCell>
                      <TableCell>{this.state.myCash} р.</TableCell>
                    </TableRow>
                  </TableFooter>
                  
                </Table>
              </TableContainer>
              
            </Paper>
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