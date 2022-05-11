const appUrl = 'https://localhost:4200';

export const environment = {
  production: false,
  metamaskForwarderOrigin: `${appUrl}/connect-wallet`,
  firebase: {
    apiKey: 'AIzaSyBxeLjMPKW2NstB8kpUpUqEmMH6YoyHIwI',
    authDomain: 'bookcoin-a71ee.firebaseapp.com',
    projectId: 'bookcoin-a71ee',
    storageBucket: 'bookcoin-a71ee.appspot.com',
    messagingSenderId: '1046246987553',
    appId: '1:1046246987553:web:8376b1a91a608039725060',
    measurementId: 'G-V4SF1H3WBZ'
  },
  apiUrl: 'http://localhost:8080',
  bloxApiUrl: 'http://localhost:3000',
  app: 'BKCN',
  polygonChain: 'MUMBAI',
  ethereumChain: 'RINKEBY'
};
