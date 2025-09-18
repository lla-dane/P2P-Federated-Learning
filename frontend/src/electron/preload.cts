const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
  subscribeStatistics: (callback: (statistics: any) => void) => {
    callback({});
  },
  getStatistics: () => {
    return {};
  },
});
