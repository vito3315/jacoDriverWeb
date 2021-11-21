const { Auth } = require( '../src/components/auth' );
const { Reg } = require( '../src/components/registration' );

const { ListOrders } = require( '../src/components/list_orders' );
const { MapOrders } = require( '../src/components/map_orders' );
const { Price } = require( '../src/components/price' );
const { Graph } = require( '../src/components/graph' );
const { Settings } = require( '../src/components/settings' );

module.exports = [
    {
        path: '/',
        exact: true,
        component: ListOrders,
        title: 'Список заказов',
        code: 200
    },
    {
        path: '/auth',
        exact: true,
        component: Auth,
        title: 'Авторизация',
        code: 200
    },
    {
        path: '/registration',
        exact: true,
        component: Reg,
        title: 'Регистрация',
        code: 200
    },
    
    {
        path: '/list_orders',
        exact: true,
        component: ListOrders,
        title: 'Список заказов',
        code: 200
    },
    {
        path: '/map_orders',
        exact: true,
        component: MapOrders,
        title: 'Карта заказов',
        code: 200
    },
    {
        path: '/price',
        exact: true,
        component: Price,
        title: 'Расчет',
        code: 200
    },
    {
        path: '/graph',
        exact: true,
        component: Graph,
        title: 'График работы',
        code: 200
    },
    {
        path: '/settings',
        exact: true,
        component: Settings,
        title: 'Настройки',
        code: 200
    },
    
    
    
];