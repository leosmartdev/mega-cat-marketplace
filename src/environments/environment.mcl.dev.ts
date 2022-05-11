const appUrl = 'https://localhost:4200';

export const environment = {
  production: false,
  metamaskForwarderOrigin: `${appUrl}/connect-wallet`,
  firebase: {
    projectId: 'mega-cat-labs-329521',
    appId: '1:807719898434:web:749a0337777fe9d4294cdb',
    storageBucket: 'mega-cat-labs-329521.appspot.com',
    apiKey: 'AIzaSyBHPgFaj57NK3N85jKCoJ0ubNKBdS6fh5o',
    authDomain: 'mega-cat-labs-329521.firebaseapp.com',
    messagingSenderId: '807719898434',
    measurementId: 'G-TWNZKYK227'
  },
  apiUrl: 'http://localhost:8080',
  bloxApiUrl: 'http://localhost:3000',
  app: 'MCL',
  polygonChain: 'MUMBAI',
  ethereumChain: 'RINKEBY'
};
