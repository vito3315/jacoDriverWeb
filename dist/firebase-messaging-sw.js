importScripts("https://www.gstatic.com/firebasejs/3.6.8/firebase-app.js"),importScripts("https://www.gstatic.com/firebasejs/3.6.8/firebase-messaging.js"),firebase.initializeApp({messagingSenderId:"macro-thinker-288611"});const messaging=firebase.messaging();messaging.setBackgroundMessageHandler((function(e){if(void 0!==e.data.time){var t=new Date(1e3*e.data.time),a=new Date;if(t<a)return null;var i=Math.round((t.getTime()-a.getTime())/1e3);e.data.body="Начало через "+Math.round(i/60)+" минут, в "+t.getHours()+":"+(t.getMinutes()>9?t.getMinutes():"0"+t.getMinutes())}return e.data.data=e.data,self.registration.showNotification(e.data.title,e.data)}));