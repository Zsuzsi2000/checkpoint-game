// import { CapacitorConfig } from '@capacitor/cli';
//
// const config: CapacitorConfig = {
//   appId: 'io.ionic.starter',
//   appName: 'UniversitySport',
//   webDir: 'www',
//   bundledWebRuntime: false
// };
//
// export default config;


import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.checkpointgame.app',
  appName: 'Checkpoint game',
  webDir: 'src',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;

