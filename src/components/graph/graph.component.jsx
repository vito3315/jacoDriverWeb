import React from 'react';
import { useHistory } from "react-router-dom";

import { makeStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Button from '@mui/material/Button';

import Drawer from '@mui/material/Drawer';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Typography from '@mui/material/Typography';
import TextareaAutosize from '@mui/material/TextareaAutosize';

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

class Graph_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      classes: this.props.classes,
      history: this.props.history,
      
      thisDate: '',
      
      is_load: false,
      
      data: [],
      dates: [],
      
      mounth: [],
      thisMounth: '',
      
      errs: {
        orders: [],
        err_cum: []
      },
      
      showErrOrders: false,
      isOpen: false,
      
      showErrOrder: null,
      showErrOrderCum: null,
      
      textErr1: '',
      textErr2: ''
    };
  }
  
  async componentDidMount(){
    if((window.location.protocol == 'http:' || window.location.protocol == 'http') && window.location.hostname != 'localhost'){
      
      console.log( 'goTo', 'https://jacodriver.ru/'+window.location.pathname )
      
      window.location.href = 'https://jacodriver.ru/'+window.location.pathname;
    }
    
    this.getGraph();
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
   
  async getGraph(day = ''){
    
    if( day == '' ){
      let date = new Date();
    
      let month = date.getMonth()+1;
      month = parseInt(month) > 9 ? month : '0'+month;

      let fullDate = date.getFullYear() + '-';
      fullDate += month;
      
      day = fullDate;
    }
    
    
    let data = {
      token: localStorage.getItem('token'),
      date: day
    };
    
    let res = await this.getData('getMyGraph', data);
    
    this.setState({ 
      data: res['users'],
      dates: res['all_dates'], 
      mounth: res['mounth'],
      thisMounth: res['mounth'].find( (item) => item.day == day )['mounth'],
      isOpen: false,
      
      thisDate: day,
      errs: res['errs'],
    })
  }
  
  async false_err(err){
    
    if( !this.click ){
      this.click = true;
    }
    
    let data = {
      token: await AsyncStorage.getItem('token'),
      text: this.state.textErr1,
      err_id: err.id,
      row_id: err.row_id
    };
    
    let res = await this.getData('save_false_cash_orders', data);
    
    if( res['st'] == false ){
      alert(res.text);
    }else{
      this.setState({ 
        showErrOrders: false, 
        showErrOrder: null,
        showErrOrderCum: null
      })
      
      this.getGraph(this.state.thisDate)
    }
    
    setTimeout( () => {
      this.click = false;
    }, 300 )
  }
  
  async false_err_1(err){
    if( !this.click ){
      this.click = true;
    }
    
    let data = {
      token: await AsyncStorage.getItem('token'),
      text: this.state.textErr2,
      id: err.id
    };
    
    let res = await this.getData('save_false_cash_cum', data);
    
    if( res['st'] == false ){
      alert(res.text);
    }else{
      this.setState({ 
        showErrOrders: false, 
        showErrOrder: null,
        showErrOrderCum: null
      })
      
      this.getGraph(this.state.thisDate)
    }
    
    setTimeout( () => {
      this.click = false;
    }, 300 )
  }
  
  render(){
    return (
      <>
        <Backdrop open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Button onClick={ () => { this.setState({ isOpen: true }) } }>{this.state.thisMounth}</Button>
        </div>
        
        <Dialog
          open={this.state.showErrOrders}
          onClose={ () => { this.setState({ showErrOrders: false, showErrOrder: null, showErrOrderCum: null }) } }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            { !this.state.showErrOrder ? null :
              <>
                <Typography style={{ color: '#000', fontSize: 15 }}>Ошибка по заказу №{this.state.showErrOrder.order_id}</Typography>
              
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Дата заказа: </Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrder.date_time_order}</Typography>  
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибка заказа: </Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrder.order_desc}</Typography>  
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Позиция: </Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrder.item_name}</Typography>  
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибка: </Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrder.pr_name}</Typography>  
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Сумма: </Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrder.my_price}</Typography>  
                </div>
                
                { this.state.showErrOrder.imgs.length == 0 ? null :
                  <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                    <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Фото</Typography>
                  </div>
                }
                
                { this.state.showErrOrder.imgs.map( (item, key) =>
                  <img
                    key={key}
                    style={{ width: '100%', height: 'auto' }}
                    //resizeMode="cover"
                    src={"https://jacochef.ru/src/img/err_orders/uploads/"+item}
                  />
                ) }
                
                { !this.state.showErrOrder.new_text_1 || this.state.showErrOrder.new_text_1.length == 0 ? 
                  parseInt(this.state.showErrOrder.is_edit) == 0 ? null :
                  <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                    <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                    <TextareaAutosize
                      style={{ width: '100%', minHeight: 50 }}
                      value={this.state.textErr1}
                      onChange={ (event) => { this.setState({ textErr1: event.target.value }) } }
                    />
                    
                    <Button
                      onClick={this.false_err.bind(this, this.state.showErrOrder)}
                      style={{ color: '#fff', marginTop: 10, width: '100%', backgroundColor: '#c03' }}
                    >
                      Обжаловать
                    </Button>
                  </div>
                    :
                  <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                    <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                    <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrder.new_text_1}</Typography>  
                  </div>
                }
                
                { !this.state.showErrOrder.new_text_2 || this.state.showErrOrder.new_text_2.length == 0 ? null :
                  <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                    <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ответ обжалования:</Typography>
                    <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrder.new_text_2}</Typography>  
                  </div>
                }
              </>
            }
            
            { !this.state.showErrOrderCum ? null :
              <>
                <Typography style={{ color: '#000', fontSize: 15 }}>Ошибка №{this.state.showErrOrderCum.id}</Typography>
              
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Дата время ошибки: </Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrderCum.date_time_fine}</Typography>  
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибка: </Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrderCum.fine_name}</Typography>  
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Сумма: </Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrderCum.price}</Typography>  
                </div>
                
                { this.state.showErrOrderCum.imgs.length == 0 ? null :
                  <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                    <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Фото</Typography>
                  </div>
                }
                
                { this.state.showErrOrderCum.imgs.map( (item, key) =>
                  <img
                    key={key}
                    style={{ width: '100%', height: 'auto' }}
                    src={"https://jacochef.ru/src/img/fine_err/uploads/"+item}
                  />
                ) }
                
                { !this.state.showErrOrderCum.text_one || this.state.showErrOrderCum.text_one.length == 0 ? 
                  parseInt(this.state.showErrOrderCum.is_edit) == 0 ? null :
                  <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                    <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                    <TextareaAutosize
                      style={{ width: '100%', minHeight: 50 }}
                      value={this.state.textErr2}
                      onChange={ (event) => { this.setState({ textErr2: event.target.value }) } }
                    />
                    
                    <Button
                      onClick={this.false_err_1.bind(this, this.state.showErrOrderCum)}
                      style={{ color: '#fff', marginTop: 10, width: '100%', backgroundColor: '#c03' }}
                    >
                      Обжаловать
                    </Button>
                  </div>
                    :
                  <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                    <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                    <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrderCum.text_one}</Typography>  
                  </div>
                }
                
                { !this.state.showErrOrderCum.text_two || this.state.showErrOrder.text_two.length == 0 ? null :
                  <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                    <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ответ обжалования:</Typography>
                    <Typography style={{ fontSize: 15, color: '#000' }}>{this.state.showErrOrderCum.text_two}</Typography>  
                  </div>
                }
              </>
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => { this.setState({ showErrOrders: false, showErrOrder: null, showErrOrderCum: null }) } } color="primary">Закрыть</Button>
          </DialogActions>
        </Dialog>
        
        
        <React.Fragment>
          <Drawer
            anchor={'bottom'}
            open={this.state.isOpen}
            onClose={ () => { this.setState({ isOpen: false }) } }
          >
            { this.state.mounth.map( (item, key) =>
              <Button key={key} onClick={this.getGraph.bind(this, item.day)}>{item.mounth}</Button>
            ) }
          </Drawer>
        </React.Fragment>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 600 }} id="tableGraph">
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={ {width: 200, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
                      >
                        
                      </TableCell>
                      
                      {this.state.dates.map((cellData, cellIndex) => 
                        <TableCell
                          key={cellIndex}
                          style={ {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
                        >
                          {cellData.day}
                        </TableCell>
                      )}
                    </TableRow>
                    
                    <TableRow>
                      <TableCell
                        style={ {width: 200, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
                      >
                        Сотрудник
                      </TableCell>
                      
                      {this.state.dates.map((cellData, cellIndex) => 
                        <TableCell
                          key={cellIndex}
                          style={ {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
                        >
                          {cellData.dow}
                        </TableCell>
                      )}
                    </TableRow>
                    
                  </TableHead>
                  <TableBody>
                    { this.state.data.map( (rowData, index) =>
                      <TableRow hover key={index}>
                        { rowData.map( (cellData, cellIndex) =>
                          <TableCell key={cellIndex} style={cellIndex == 0 ? {width: 200, height: 30} : {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'}}>
                            {cellIndex == 0 ? cellData.user_name : cellData.min == '0' ? '' : cellData.hours}
                          </TableCell>
                        ) }
                      </TableRow>
                    ) }
                    
                    
                    
                  </TableBody>
                </Table>
              </TableContainer>
              
            </Paper>
          </Grid>  
        </Grid>
        
        <Grid container spacing={3} style={{ paddingTop: 20 }}>
          <Grid item xs={12}>
            
            <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибки по заказам</Typography>
            
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Заказ</TableCell>
                      <TableCell>Дата заказа</TableCell>
                      <TableCell>Ошибка</TableCell>
                      <TableCell>Довоз</TableCell>
                      <TableCell>Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    { this.state.errs.orders.map( (rowData, index) =>
                      <TableRow hover key={index} onClick={ () => { this.setState({ showErrOrders: true, showErrOrder: rowData }) } }>
                        <TableCell>{rowData.order_id}</TableCell>
                        <TableCell>{rowData.date_time_order}</TableCell>
                        <TableCell>{rowData.pr_name}</TableCell>
                        <TableCell>{parseInt(rowData['new_order_id']) > 0 ? '+' : ' '}</TableCell>
                        <TableCell>{rowData.my_price+' р.'}</TableCell>
                      </TableRow>
                    ) }
                  </TableBody>
                </Table>
              </TableContainer>
              
            </Paper>
          </Grid> 
          
          
          
          <Grid item xs={12} style={{ paddingTop: 20 }}>
            
          <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибки по камерам</Typography>
            
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Дата время совершения ошибки</TableCell>
                      <TableCell>Ошибка</TableCell>
                      <TableCell>Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    { this.state.errs.err_cum.map( (rowData, index) =>
                      <TableRow hover key={index} onClick={ () => { this.setState({ showErrOrders: true, showErrOrderCum: rowData }) } }>
                        <TableCell>{rowData.id}</TableCell>
                        <TableCell>{rowData.date_time_fine}</TableCell>
                        <TableCell>{rowData.fine_name}</TableCell>
                        <TableCell>{rowData.price+' р.'}</TableCell>
                      </TableRow>
                    ) }
                  </TableBody>
                </Table>
              </TableContainer>
              
            </Paper>
          </Grid> 
          
           
        </Grid>
      </>
    )
  }
}

export function Graph() {
  const classes = useStyles();
  let history = useHistory();
  
  return (
    <Graph_ classes={classes} history={history} />
  );
}