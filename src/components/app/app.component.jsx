import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import CssBaseline from '@mui/material/CssBaseline';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuIcon from '@mui/icons-material/Menu';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { NavLink as Link, Switch, Route, Redirect } from 'react-router-dom';

import { useHistory } from "react-router-dom";

import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import routes from '../../../server/routes';

const queryString = require('query-string');

const theme = createTheme({
    palette: {
      primary: {
        main: '#c03',
      },
      def: {
        main: '#353b48',
        secondary: '#fff'
      },
    },
});

const drawerWidth = 300;

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(4),
    width: '100%',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
});


class Header extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      classes: this.props.classes,
      history: this.props.history,
      
      module: 'header',
      title: '',
      
      open: false,
      menu: [],
      full_menu: [],
      
      left: false,
      
      phone_man: '',
      phone_center: '',
      phone_dir: ''
    };
  }
  
  async componentDidMount(){
    
    console.log( window.location.protocol )
    
    if(window.location.protocol == 'http:' || window.location.protocol == 'http'){
      
      console.log( 'goTo', 'https://jacodriver.ru/'+window.location.pathname )
      
      window.location.href = 'https://jacodriver.ru/'+window.location.pathname;
    }
    
    let thisUri = window.location.pathname;
    
    if( /*thisUri == '/' || thisUri == ''*/ false ){
      this.state.history.push("/list_orders");
      window.location.reload();
    }else{
      let find_route = routes.find( (item) => thisUri.includes(item.path) );
    
      this.setState({
        title: find_route.title
      })
      
      window.document.title = find_route.title;
      
      let data = {
        token: localStorage.getItem('token')
      };
      
      let res = await this.getData('getPointInfo', data);
      
      console.log( res )
      
      if( res ){
        this.setState({
          phone_man: res.phone_man,
          phone_center: res.phone_new,
          phone_dir: res.phone_upr
        })
      }
    }
    
    
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
  
  handleDrawerOpen(){
    this.setState({
      open: true
    })
  }
  
  handleDrawerClose(){
    this.setState({
      open: false
    })
  }
  
  logOut(){
    localStorage.removeItem('token');
    this.state.history.push("/auth");
    location.reload();
  }
  
  goTo(title){
    this.setState({
      title: title
    })
    
    window.document.title = title;
  }
  
  render(){
    return (
      <>
        <AppBar className={clsx(this.state.classes.appBar, this.state.open && this.state.classes.appBarShift)}>
          <Toolbar className={this.state.classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerOpen.bind(this)}
              className={clsx(this.state.classes.menuButton, this.state.open && this.state.classes.menuButtonHidden)}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" id="GlobalHeader" color="inherit" noWrap className={this.state.classes.title}>{this.state.title}</Typography>
            
          </Toolbar>
        </AppBar>
        
        
        <React.Fragment >
          <SwipeableDrawer
            anchor={'left'}
            open={ this.state.open }
            onClose={ () => { this.setState({ open: false }) } }
            onOpen={ () => { this.setState({ open: true }) } }
          >
            <List style={{ width: '100%' }}>
              
              <ListItem button onClick={this.goTo.bind(this, 'Список заказов')}>
                <Link to={"/list_orders"}>
                  <ListItemText primary={ 'Список заказов' } />
                </Link>
              </ListItem>
              <ListItem button onClick={this.goTo.bind(this, 'Карта заказов')}>
                <Link to={"/map_orders"}>
                  <ListItemText primary={ 'Карта заказов' } />
                </Link>
              </ListItem>
              <ListItem button onClick={this.goTo.bind(this, 'Расчет')}>
                <Link to={"/price"}>
                  <ListItemText primary={ 'Расчет' } />
                </Link>
              </ListItem>
              <ListItem button onClick={this.goTo.bind(this, 'График работы')}>
                <Link to={"/graph"}>
                  <ListItemText primary={ 'График работы' } />
                </Link>
              </ListItem>
              
              
              <ListItem button>
                <a href={"tel:"+this.state.phone_dir}>
                  <ListItemText primary={ 'Директор' } />
                </a>
              </ListItem>
              <ListItem button>
                <a href={"tel:"+this.state.phone_man}>
                  <ListItemText primary={ 'Менеджер' } />
                </a>
              </ListItem>
              <ListItem button>
                <a href={"tel:"+this.state.phone_center}>
                  <ListItemText primary={ 'Контакт-центр' } />
                </a>
              </ListItem>
              
              
              <ListItem button onClick={this.logOut.bind(this)}>
                <ListItemText primary={ 'Выйти' } />
              </ListItem>
              
            </List>
          </SwipeableDrawer>
        </React.Fragment>
      </>
    )
  }
}

function Status({ code, children }) {
  return (
    <Route
      render={({ staticContext }) => {
        if (staticContext) staticContext.status = code;
        return children;
      }}
    />
  );
}

export function NotFound() {
  return (
    <Status code={404}>
        <Grid container className="Contact mainContainer MuiGrid-spacing-xs-3" style={{ marginTop: 64 }}>
            <Grid item xs={12}>
                <Typography variant="h5" component="h1">404 Страница не найдена</Typography>
            </Grid>
            
        </Grid>
    </Status>
  );
}

export function App () {
    const classes = useStyles();
    let history = useHistory();
    
    console.log( history.location.protocol )
    
    if(history.location.protocol == 'http:' || history.location.protocol == 'http'){
      
      console.log( 'goTo', 'https://jacodriver.ru/'+history.location.pathname )
      
      history.location.href = 'https://jacodriver.ru/'+history.location.pathname;
    }
    
    let check_header = true;
    
    if( 
      history.location.pathname == '/auth/' || 
      history.location.pathname == '/auth' || 
      history.location.pathname == '/registration/' ||
      history.location.pathname == '/registration'
    ){
      check_header = false;
    }
    
    return (
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          { !check_header ? null :
            <>
              <CssBaseline />
              <Header classes={classes} history={history} />
            </>
          }
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth={false} className={classes.container}>
        
              <Switch>
                { routes.map( (item, key) =>
                  <Route
                    key={key}
                    path={item.path}
                    exact={ item.exact }
                    component={ item.component }
                  />
                ) }
                
                <Route
                  component={ () =>
                    <Status code={404}>
                      <Grid container className="Contact mainContainer MuiGrid-spacing-xs-3" style={{ marginTop: 64 }}>
                        <Grid item xs={12}>
                          <Typography variant="h5" component="h1">404 Страница не найдена</Typography>
                        </Grid>
                      </Grid>
                    </Status>
                  }
                />
              </Switch>
        
            </Container>
          </main>
        </div>
      </ThemeProvider>
    );
}