'use strict'

const dialog = require('electron').remote.dialog;

/* global FileReader */
/* global MouseEvent */

function Source (client) {
  this.cache = {}
  this.state = {}

  this.install = () => {
  }

  this.start = () => {
    this.new()
  }

  this.clear = () => {
    this.state.gridFilePath = ''
    this.state.svgFilePath = ''
  }

  this.new = () => {
    this.clear()
    this.cache = {}
    client.tooltip.push('New file.')
  }

  this.info = () => {
    const gridFilePath = this.state.gridFilePath
    if (gridFilePath) {
      client.tooltip.push(`File: ${gridFilePath}`)
    } else {
      client.tooltip.push('Unsaved file.')
    }
  }

  this.open = (ext, callback, store = false) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file.name.indexOf('.' + ext) < 0) { console.warn('Source', `Skipped ${file.name}`); return }
      this.read(file, callback, store)
    }
    input.click()
  }

  this.load = (ext, callback) => {
    client.tooltip.push('Load file.')
    const input = document.createElement('input')
    input.type = 'file'
    input.setAttribute('multiple', 'multiple')
    input.onchange = (e) => {
      for (const file of e.target.files) {
        if (file.name.indexOf('.' + ext) < 0) { console.warn('Source', `Skipped ${file.name}`); return }
        this.read(file, this.store)
      }
    }
    input.click()
  }

  this.store = (file, content) => {
    console.info('Source', 'Stored ' + file.name)
    this.cache[file.name] = content
  }

  this.save = (name, content, type = 'text/plain', callback) => {
    this.saveAs(name, content, type, callback)
  }

  this.saveAs = (name, ext, content, type = 'text/plain', callback) => {
    console.log('Source', 'Save new file..')
    this.write(name, ext, content, type, callback)
  }

  // I/O

  this.read = (file, callback, store = false) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const res = event.target.result
      if (callback) { callback(file, res) }
      if (store) { this.store(file, res) }

      this.clear()

      if (file.path) {
        this.state.gridFilePath = file.path;
        client.tooltip.push('File: ' + file.path)
      }

      try {
        const data = JSON.parse(res)
        if (data.meta && data.meta.svgPath) {
          this.state.svgFilePath = data.meta.svgPath
        }
      } catch (e) {
        this.state.svgFilePath = ''
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  this.write = (name, ext, content, type, settings = 'charset=utf-8') => {
    const link = document.createElement('a')
    link.setAttribute('download', `${name}-${timestamp()}.${ext}`)
    if (type === 'image/png' || type === 'image/jpeg') {
      link.setAttribute('href', content)
    } else {
      link.setAttribute('href', 'data:' + type + ';' + settings + ',' + encodeURIComponent(content))
    }
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  }

  function writeFile(filePath, content) {
    fs.writeFile(filePath, content, (error) => {
      if (error) return client.tooltip.push('Error: ' + error.message)
      client.tooltip.push('Save: ' + filePath)
    })
  }

  this.addGridMeta = (content) => {
    if (!this.state.svgFilePath) return content
    try {
      const data = JSON.parse(content)
      data.meta = { svgPath: this.state.svgFilePath }
      return JSON.stringify(data, null, 2)
    } catch (e) {
      return content
    }
  }

  this.saveGrid = (content) => {
    if (this.state.gridFilePath) {
      content = this.addGridMeta(content)
      return writeFile(this.state.gridFilePath, content)
    }
    this.saveGridAs(content)
  }

  this.saveGridAs = (content) => {
    content = this.addGridMeta(content)

    const options = {
      filters: [{ name:'Grid File', extensions: ['grid'] }]
    }

    if (this.state.gridFilePath) {
      options.defaultPath = this.state.gridFilePath
    }

    dialog.showSaveDialog(null, options).then((result) => {
      if (!result || !result.filePath) return;
      let filePath = result.filePath

      if (path.extname(filePath) !== '.grid') {
        filePath += '.grid'
      }

      this.state.gridFilePath = filePath;
      writeFile(filePath, content)
    });
  }

  this.saveSvg = () => {
    if (this.state.svgFilePath) {

      if (Array.isArray(this.state.svgFilePath)) {
        for (let i = 0; i < this.state.svgFilePath.length; i++) {
          const config = this.state.svgFilePath[i];
          writeFile(config.path, client.manager.toString(config.scale))
        }
        client.tooltip.push(`Exported ${this.state.svgFilePath.length} SVG files.`)
        return;
      }

      const content = client.manager.toString()
      return writeFile(this.state.svgFilePath, content)
    }
    this.saveSvgAs()
  }

  this.saveSvgAs = () => {
    const options = {
      filters: [{ name:'SVG File', extensions: ['svg'] }]
    }

    if (this.state.gridFilePath) {
      options.defaultPath = path.basename(this.state.gridFilePath, '.grid')
    }

    dialog.showSaveDialog(null, options).then((result) => {
      if (!result || !result.filePath) return;
      var filePath = result.filePath

      if (path.extname(filePath) !== '.svg') {
        filePath += '.svg'
      }

      this.state.svgFilePath = filePath;
      const content = client.manager.toString()
      writeFile(filePath, content)
    });
  }

  function timestamp (d = new Date(), e = new Date(d)) {
    return `${arvelie()}-${neralie()}`
  }

  function arvelie (date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000)
    const doty = Math.floor(diff / 86400000) - 1
    const y = date.getFullYear().toString().substr(2, 2)
    const m = doty === 364 || doty === 365 ? '+' : String.fromCharCode(97 + Math.floor(doty / 14)).toUpperCase()
    const d = `${(doty === 365 ? 1 : doty === 366 ? 2 : (doty % 14)) + 1}`.padStart(2, '0')
    return `${y}${m}${d}`
  }

  function neralie (d = new Date(), e = new Date(d)) {
    const ms = e - d.setHours(0, 0, 0, 0)
    return (ms / 8640 / 10000).toFixed(6).substr(2, 6)
  }
}
