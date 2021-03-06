'use strict'

/* global Acels */
/* global Theme */
/* global Source */
/* global History */

/* global Manager */
/* global Renderer */
/* global Tool */
/* global Interface */
/* global Picker */
/* global Cursor */

/* global FileReader */

function Client () {
  this.install = function (host) {
    console.info('Client', 'Installing..')

    this.acels = new Acels(this)
    this.theme = new Theme(this)
    this.history = new History(this)
    this.source = new Source(this)

    this.manager = new Manager(this)
    this.renderer = new Renderer(this)
    this.tool = new Tool(this)
    this.interface = new Interface(this)
    this.picker = new Picker(this)
    this.layerSelector = new LayerSelector(this)
    this.tooltip = new Tooltip(this)
    this.cursor = new Cursor(this)
    this.color = new Color(this)

    host.appendChild(this.renderer.el)

    document.addEventListener('mousedown', (e) => { this.cursor.down(e) }, false)
    document.addEventListener('mousemove', (e) => { this.cursor.move(e) }, false)
    document.addEventListener('contextmenu', (e) => { this.cursor.alt(e) }, false)
    document.addEventListener('mouseup', (e) => { this.cursor.up(e) }, false)
    document.addEventListener('copy', (e) => { this.copy(e) }, false)
    document.addEventListener('cut', (e) => { this.cut(e) }, false)
    document.addEventListener('paste', (e) => { this.paste(e) }, false)
    window.addEventListener('resize', (e) => { this.onResize() }, false)
    window.addEventListener('dragover', (e) => { e.stopPropagation(); e.preventDefault(); e.dataTransfer.dropEffect = 'copy' })
    window.addEventListener('drop', this.onDrop)

    this.acels.set('File', 'New', 'CmdOrCtrl+W', () => { this.tool.reset(); this.source.new() })
    this.acels.set('File', 'Open', 'CmdOrCtrl+O', () => { this.source.open('grid', this.whenOpen) })
    this.acels.set('File', 'Save', 'CmdOrCtrl+S', () => { this.source.saveGrid(this.tool.export()) })
    this.acels.set('File', 'Save', 'CmdOrCtrl+Shift+S', () => { this.source.saveGridAs(this.tool.export()) })
    this.acels.set('File', 'Export Vector', 'CmdOrCtrl+E', () => { this.source.saveSvg() })
    this.acels.set('File', 'Export Vector', 'CmdOrCtrl+Shift+E', () => { this.source.saveSvgAs() })
    this.acels.set('File', 'Export Image', 'CmdOrCtrl+Shift+R', () => { this.manager.toPNG(this.tool.settings.size, (dataUrl) => { this.source.write('dotgrid', 'png', dataUrl, 'image/png') }) })
    this.acels.set('File', 'File Informations', 'I', () => { this.source.info() })
    this.acels.set('History', 'Undo', 'CmdOrCtrl+Z', () => { this.tool.undo() })
    this.acels.set('History', 'Redo', 'CmdOrCtrl+Shift+Z', () => { this.tool.redo() })
    this.acels.set('Stroke', 'Line', 'X', () => { this.tool.cast('line') })
    this.acels.set('Stroke', 'Arc', 'S', () => { this.tool.cast('arc_c') })
    this.acels.set('Stroke', 'Arc Rev', 'D', () => { this.tool.cast('arc_r') })
    this.acels.set('Stroke', 'Bezier', 'Z', () => { this.tool.cast('bezier') })
    this.acels.set('Stroke', 'Close', 'C', () => { this.tool.cast('close') })
    this.acels.set('Stroke', 'Arc(full)', 'T', () => { this.tool.cast('arc_c_full') })
    this.acels.set('Stroke', 'Arc Rev(full)', 'Y', () => { this.tool.cast('arc_r_full') })
    this.acels.set('Stroke', 'Clear Selection', 'Escape', () => { this.tool.clear() })
    this.acels.set('Effect', 'Linecap', 'Q', () => { this.tool.toggle('linecap') })
    this.acels.set('Effect', 'Linejoin', 'W', () => { this.tool.toggle('linejoin') })
    this.acels.set('Effect', 'Mirror', 'M', () => { this.tool.toggle('mirror') })
    this.acels.set('Effect', 'Fill', 'R', () => { this.tool.toggle('fill') })
    this.acels.set('Effect', 'Thicker', '}', () => { this.tool.toggle('thickness', 1) })
    this.acels.set('Effect', 'Thinner', '{', () => { this.tool.toggle('thickness', -1) })
    this.acels.set('Effect', 'Thicker +5', ']', () => { this.tool.toggle('thickness', 5) })
    this.acels.set('Effect', 'Thinner -5', '[', () => { this.tool.toggle('thickness', -5) })
    this.acels.set('Manual', 'Add Point', 'Enter', () => { this.tool.addVertex(this.cursor.pos); this.renderer.update() })
    this.acels.set('Manual', 'Move Up', 'Up', () => { this.cursor.pos.y -= 15; this.renderer.update() })
    this.acels.set('Manual', 'Move Right', 'Right', () => { this.cursor.pos.x += 15; this.renderer.update() })
    this.acels.set('Manual', 'Move Down', 'Down', () => { this.cursor.pos.y += 15; this.renderer.update() })
    this.acels.set('Manual', 'Move Left', 'Left', () => { this.cursor.pos.x -= 15; this.renderer.update() })
    this.acels.set('Manual', 'Remove Point', 'Shift+Backspace', () => { this.tool.removeSegmentsAt(this.cursor.pos) })
    this.acels.set('Manual', 'Remove Segment', 'Backspace', () => { this.tool.removeSegment() })
    this.acels.set('Layers', 'Layer1',  'CmdOrCtrl+1', () => { this.tool.selectLayer(0) })
    this.acels.set('Layers', 'Layer2',  'CmdOrCtrl+2', () => { this.tool.selectLayer(1) })
    this.acels.set('Layers', 'Layer3',  'CmdOrCtrl+3', () => { this.tool.selectLayer(2) })
    this.acels.set('Layers', 'Layer4',  'CmdOrCtrl+4', () => { this.tool.selectLayer(3) })
    this.acels.set('Layers', 'Layer5',  'CmdOrCtrl+5', () => { this.tool.selectLayer(4) })
    this.acels.set('Layers', 'Layer6',  'CmdOrCtrl+6', () => { this.tool.selectLayer(5) })
    this.acels.set('Layers', 'Layer7',  'CmdOrCtrl+7', () => { this.tool.selectLayer(6) })
    this.acels.set('Layers', 'Layer8',  'CmdOrCtrl+8', () => { this.tool.selectLayer(7) })
    this.acels.set('Layers', 'Layer9',  'CmdOrCtrl+9', () => { this.tool.selectLayer(8) })
    this.acels.set('Layers', 'Layer10', 'CmdOrCtrl+0', () => { this.tool.selectLayer(9) })
    this.acels.set('Layers', 'Move Layer to Front', 'CmdOrCtrl+Right', () => { this.tool.moveLayer(1) })
    this.acels.set('Layers', 'Move Layer to Back', 'CmdOrCtrl+Left', () => { this.tool.moveLayer(-1) })
    this.acels.set('Layers', 'Merge Layers', 'CmdOrCtrl+M', () => { this.tool.merge() })
    this.acels.set('Layers', 'Layer Informations', 'T', () => { this.tool.info() })
    this.acels.set('View', 'Color Picker', 'G', () => { this.color.toggle() })
    this.acels.set('View', 'Toggle Grid', 'H', () => { this.renderer.toggle() })
    this.acels.install(window)
    this.acels.pipe(this)

    this.manager.install()
    this.interface.install(host)
    this.theme.install(host, () => { this.update() })
  }

  this.start = () => {
    console.log('Client', 'Starting..')
    console.info(`${this.acels}`)

    this.theme.start()
    this.tool.start()
    this.renderer.start()
    this.interface.start()
    this.layerSelector.start()

    this.source.new()
    this.onResize()

    setTimeout(() => { document.body.className += ' ready' }, 250)
  }

  this.update = () => {
    this.manager.update()
    this.interface.update()
    this.renderer.update()
  }

  this.clear = () => {
    this.history.clear()
    this.tool.reset()
    this.reset()
    this.renderer.update()
    this.interface.update(true)
  }

  this.reset = () => {
    this.tool.clear()
    this.update()
  }

  this.whenOpen = (file, data) => {
    this.tool.replace(JSON.parse(data))
    this.onResize()
  }

  // Resize Tools

  this.fitSize = () => {
    if (this.requireResize() === false) { return }
    console.log('Client', `Will resize to: ${printSize(this.getRequiredSize())}`)
    this.update()
  }

  this.getPadding = () => {
    return { x: 60, y: 90 }
  }

  this.getWindowSize = () => {
    return { width: window.innerWidth, height: window.innerHeight }
  }

  this.getProjectSize = () => {
    return this.tool.settings.size
  }

  this.getPaddedSize = () => {
    const rect = this.getWindowSize()
    const pad = this.getPadding()
    return { width: step(rect.width - pad.x, 15), height: step(rect.height - pad.y, 15) }
  }

  this.getRequiredSize = () => {
    const rect = this.getProjectSize()
    const pad = this.getPadding()
    return { width: step(rect.width, 15) + pad.x, height: step(rect.height, 15) + pad.y }
  }

  this.requireResize = () => {
    const _window = this.getWindowSize()
    const _required = this.getRequiredSize()
    const offset = sizeOffset(_window, _required)
    if (offset.width !== 0 || offset.height !== 0) {
      console.log('Client', `Require ${printSize(_required)}, but window is ${printSize(_window)}(${printSize(offset)})`)
      return true
    }
    return false
  }

  this.onResize = () => {
    const _project = this.getProjectSize()
    const _padded = this.getPaddedSize()
    const offset = sizeOffset(_padded, _project)
    if (offset.width !== 0 || offset.height !== 0) {
      console.log('Client', `Resize project to ${printSize(_padded)}`)
      this.tool.settings.size = _padded
    }
    this.update()
  }

  // Events

  this.drag = function (e) {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    const filename = file.path ? file.path : file.name ? file.name : ''

    if (filename.indexOf('.grid') < 0) { console.warn('Client', 'Not a .grid file'); return }

    const reader = new FileReader()

    reader.onload = function (e) {
      const data = e.target && e.target.result ? e.target.result : ''
      this.source.load(filename, data)
      this.fitSize()
    }
    reader.readAsText(file)
  }

  this.onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]

    if (file.name.indexOf('.grid') > -1) {
      this.source.read(file, this.whenOpen)
    }
  }

  this.copy = function (e) {
    this.renderer.update()

    if (e.target !== this.picker.input) {
      e.clipboardData.setData('text/source', this.tool.export(this.tool.layer()))
      e.clipboardData.setData('text/plain', this.tool.path())
      e.clipboardData.setData('text/html', this.manager.el.outerHTML)
      e.clipboardData.setData('text/svg+xml', this.manager.el.outerHTML)
      e.preventDefault()
    }

    this.renderer.update()
  }

  this.cut = function (e) {
    this.renderer.update()

    if (e.target !== this.picker.input) {
      e.clipboardData.setData('text/source', this.tool.export(this.tool.layer()))
      e.clipboardData.setData('text/plain', this.tool.export(this.tool.layer()))
      e.clipboardData.setData('text/html', this.manager.el.outerHTML)
      e.clipboardData.setData('text/svg+xml', this.manager.el.outerHTML)
      this.tool.layers[this.tool.index] = []
      e.preventDefault()
    }

    this.renderer.update()
  }

  this.paste = function (e) {
    if (e.target !== this.picker.el) {
      let data = e.clipboardData.getData('text/source')
      if (isJson(data)) {
        data = JSON.parse(data.trim())
        this.tool.import(data)
      }
      e.preventDefault()
    }

    this.renderer.update()
  }

  this.onKeyDown = (e) => {
  }

  this.onKeyUp = (e) => {
  }

  function sizeOffset (a, b) { return { width: a.width - b.width, height: a.height - b.height } }
  function printSize (size) { return `${size.width}x${size.height}` }
  function isJson (text) { try { JSON.parse(text); return true } catch (error) { return false } }
  function step (v, s) { return Math.round(v / s) * s }
}
