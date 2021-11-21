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
      
      is_load: false,
      
      data: [],
      dates: [],
      
      mounth: [],
      thisMounth: '',
      
      isOpen: false
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
   
  async getGraph(day = ''){
    
    if( day == '' ){
      let date = new Date();
    
      let fullDate = date.getFullYear() + '-';
      fullDate += date.getMonth()+1;
      
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
      isOpen: false
    })
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
        
        
        <Grid container spacing={3} style={{ marginTop: 10 }}>
          
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      style={ {width: 150, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
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
                      style={ {width: 150, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
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
                        <TableCell key={cellIndex} style={cellIndex == 0 ? {width: 150, height: 30} : {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'}}>
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