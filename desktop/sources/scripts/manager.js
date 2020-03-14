'use strict'

/* global XMLSerializer */
/* global btoa */
/* global Image */
/* global Blob */

function Manager (client) {
  // Create SVG parts
  this.el = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  this.el.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  this.el.setAttribute('baseProfile', 'full')
  this.el.setAttribute('version', '1.1')
  this.el.style.fill = 'none'

  this.layers = []

  this.install = function () {
    for (var i = 0; i < LAYERS_COUNT; i++) {
      this.el.appendChild(this.layers[i] = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
    }
  }

  this.update = function () {
    this.el.setAttribute('width', (client.tool.settings.size.width) + 'px')
    this.el.setAttribute('height', (client.tool.settings.size.height) + 'px')
    this.el.style.width = (client.tool.settings.size.width)
    this.el.style.height = client.tool.settings.size.height

    const styles = client.tool.styles
    const paths = client.tool.paths()

    for (const id in this.layers) {
      const style = styles[id]
      const path = paths[id]
      const layer = this.layers[id]

      layer.style.strokeWidth = style.thickness
      layer.style.strokeLinecap = style.strokeLinecap
      layer.style.strokeLinejoin = style.strokeLinejoin
      layer.style.stroke = style.color
      layer.style.fill = style.fill

      layer.setAttribute('d', path)
    }
  }

  this.svg64 = function () {
    const xml = new XMLSerializer().serializeToString(this.el)
    const svg64 = btoa(xml)
    const b64Start = 'data:image/svg+xml;base64,'
    return b64Start + svg64
  }

  // Exporters

  this.toPNG = function (size = client.tool.settings.size, callback) {
    this.update()

    const image64 = this.svg64()
    const img = new Image()
    const canvas = document.createElement('canvas')
    canvas.width = (size.width) * 2
    canvas.height = (size.height) * 2
    img.onload = function () {
      canvas.getContext('2d').drawImage(img, 0, 0, (size.width) * 2, (size.height) * 2)
      callback(canvas.toDataURL('image/png'))
    }
    img.src = image64
  }

  this.toSVG = function (callback) {
    this.update()

    const image64 = this.svg64()
    callback(image64, 'export.svg')
  }

  this.toGRID = function (callback) {
    this.update()

    const text = client.tool.export()
    const file = new Blob([text], { type: 'text/plain' })
    callback(URL.createObjectURL(file), 'export.grid')
  }

  this.toString = (scale = 1) => {
    // return new XMLSerializer().serializeToString(this.el)
    let xml = ''

    const bbox   = client.tool.boundingBox();
    // TODO: process mirrors
    const width  = (bbox.r - bbox.l) * scale;
    const height = (bbox.b - bbox.t) * scale;
    const styles = client.tool.styles
    const paths  = client.tool.paths(-bbox.l, -bbox.t, scale)

    // NOTA: last layer is the guide and is not exported
    for (var i = 0; i < LAYERS_COUNT - 1; i++) {
      const style = styles[i]
      const path  = paths[i]
      if (!path) continue;
      const thickness = style.thickness * scale
      xml += `<path d="${path}" style="stroke-width: ${thickness}; stroke-linecap: ${style.strokeLinecap}; stroke-linejoin: ${style.strokeLinejoin}; stroke: ${style.color}; fill: ${style.fill};"/>`
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" baseProfile="full" version="1.1" width="${width}px" height="${height}px">${xml}</svg>`
  }
}
