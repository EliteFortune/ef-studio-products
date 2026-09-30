const { app, BrowserWindow, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('node:path');

let mainWindow;
let tray;
let localServer;

function trayImage(){
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect rx="8" width="32" height="32" fill="#6758e8"/><path d="M8 9h16v4H12v3h10v4H12v3h12v4H8z" fill="white"/></svg>';
  return nativeImage.createFromDataURL('data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64')).resize({width:16,height:16});
}

async function ensureWindow(){
  if(mainWindow && !mainWindow.isDestroyed()){ mainWindow.show(); mainWindow.focus(); return; }
  mainWindow=new BrowserWindow({
    width:1180,height:780,minWidth:850,minHeight:600,
    backgroundColor:'#0d0e13',
    title:'EliteFortune Agent Reliability',
    webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}
  });
  await mainWindow.loadURL(localServer.url);
  mainWindow.on('close',e=>{
    if(!app.isQuiting){e.preventDefault();mainWindow.hide();}
  });
}

app.whenReady().then(async()=>{
  process.env.EF_DATA_DIR=app.getPath('userData');
  const { startServer }=await import('./server.js');
  localServer=await startServer({
    port:0,
    repo:process.env.EF_REPOSITORY || process.cwd(),
    dataDir:app.getPath('userData')
  });
  await ensureWindow();

  tray=new Tray(trayImage());
  tray.setToolTip('EliteFortune Agent Reliability');
  tray.setContextMenu(Menu.buildFromTemplate([
    {label:'Open Agent Reliability',click:()=>ensureWindow()},
    {label:'System Health',click:()=>shell.openExternal(localServer.url+'#health')},
    {type:'separator'},
    {label:'Quit',click:()=>{app.isQuiting=true;app.quit();}}
  ]));
  tray.on('double-click',()=>ensureWindow());
});

app.on('window-all-closed',()=>{});
app.on('before-quit',()=>{app.isQuiting=true;if(localServer?.server)localServer.server.close();});
