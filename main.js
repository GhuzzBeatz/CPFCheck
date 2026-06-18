const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs   = require('fs')
const { spawnSync } = require('child_process')

app.setName('Verificador Matemático de CPF')

function getDataDir() {
  return app.isPackaged
    ? path.join(app.getPath('userData'), 'data')
    : path.join(__dirname, 'data')
}

let win = null

function createWindow() {
  const dir = getDataDir()
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const windowOptions = {
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 640,
    title: 'Verificador Matematico de CPF',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, 'logo.ico'),
    backgroundColor: '#0f1833',
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      contextIsolation: false,
      webSecurity: false,
      additionalArguments: ['--data-dir=' + dir]
    }
  }

  if (process.platform === 'win32') {
    windowOptions.titleBarStyle = 'hidden'
    windowOptions.titleBarOverlay = {
      color: '#0f1833',
      symbolColor: '#e8eaf0',
      height: 32
    }
  }

  win = new BrowserWindow(windowOptions)

  win.loadFile('index.html')

  win.once('ready-to-show', () => {
    win.show()
    win.focus()
  })

  setTimeout(() => { if (win && !win.isVisible()) win.show() }, 4000)
  win.on('page-title-updated', e => e.preventDefault())
}

// ── SALVAR ARQUIVO (CSV/TXT) ───────────────────────────────
ipcMain.handle('salvar-arquivo', async (event, { conteudo, base64, nomeArquivo, extensao, filtro }) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      defaultPath: nomeArquivo,
      filters: [{ name: filtro || 'Arquivo', extensions: [extensao || 'txt'] }]
    })
    if (canceled || !filePath) return { sucesso: false, motivo: 'cancelado' }
    if (base64) fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))
    else fs.writeFileSync(filePath, conteudo || '', 'utf8')
    try { fs.chmodSync(filePath, 0o666) } catch (e) {}
    // Windows: remove atributo "somente leitura" quando existir.
    if (process.platform === 'win32') {
      try { spawnSync('attrib', ['-R', filePath], { windowsHide: true }) } catch (e) {}
    }
    return { sucesso: true, caminho: filePath }
  } catch(err) {
    return { sucesso: false, motivo: 'erro', mensagem: err.message }
  }
})

ipcMain.handle('mostrar-arquivo-na-pasta', async (event, caminho) => {
  try {
    if (!caminho) return { sucesso: false }
    shell.showItemInFolder(caminho)
    return { sucesso: true }
  } catch (err) {
    return { sucesso: false, mensagem: err.message }
  }
})

// ── ABRIR ARQUIVO ──────────────────────────────────────────
ipcMain.handle('abrir-arquivo', async () => {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Texto e CSV', extensions: ['txt', 'csv'] },
        { name: 'Excel', extensions: ['xlsx', 'xls'] },
        { name: 'Todos os arquivos', extensions: ['*'] }
      ]
    })
    if (canceled || !filePaths.length) return { sucesso: false, motivo: 'cancelado' }
    const caminho = filePaths[0]
    const ext = path.extname(caminho).toLowerCase()

    if (ext === '.xlsx' || ext === '.xls') {
      const base64 = fs.readFileSync(caminho).toString('base64')
      return { sucesso: true, caminho, tipo: 'excel', base64 }
    }

    const conteudo = fs.readFileSync(caminho, 'utf8')
    return { sucesso: true, caminho, tipo: 'texto', conteudo }
  } catch(err) {
    return { sucesso: false, motivo: 'erro', mensagem: err.message }
  }
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
