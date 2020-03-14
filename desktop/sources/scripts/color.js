'use strict'

const RGB_REGEXP = /rgba?\(\s*([.0-9]+)\s*,\s*([.0-9]+)\s*,\s*([.0-9]+)\s*,?\s*([.0-9]+)?\s*\)/;


function rgb2hsv (r, g, b) {
	r /= 255
	g /= 255
	b /= 255

	var h, s
	var v = Math.max(r, g, b)
	var diff = v - Math.min(r, g, b)

	function diffc (c) {
		return (v - c) / 6 / diff + 1 / 2
	}

	if (diff == 0) {
		h = s = 0
	} else {
		s = diff / v
		let rr = diffc(r)
		let gg = diffc(g)
		let bb = diffc(b)

		if (r === v) {
			h = bb - gg
		} else if (g === v) {
			h = (1 / 3) + rr - bb
		} else if (b === v) {
			h = (2 / 3) + gg - rr
		}
		if (h < 0) {
			h += 1
		}else if (h > 1) {
			h -= 1
		}
	}
	return { h, s, v }
}

function HSV(h, s, v) {
	this.h = h
	this.s = s
	this.v = v
	this.a = 1

	function hex(i) {
		let x = i.toString(16).toUpperCase()
		if (i < 16) x = '0' + x
		return x
	}

	this.hex = function () {
		const rgb = this.rgb()
		if (this.a >= 1) {
			return '#' + hex(rgb.r) + hex(rgb.g) + hex(rgb.b)
		} else {
			return '#' + hex(rgb.r) + hex(rgb.g) + hex(rgb.b) + hex(~~(this.a * 255))
		}
	}

	this.rgb = function () {
		let h = this.h
		let s = this.s
		let v = this.v

		h *= 6
		let i = Math.floor(h)
		let f = h - i
		let p = v * (1 - s)
		let q = v * (1 - f * s)
		let t = v * (1 - (1 - f) * s)
		let mod = i % 6
		let r = [v, q, p, p, t, v][mod]
		let g = [t, v, v, q, p, p][mod]
		let b = [p, p, t, v, v, q][mod]

		r = Math.min(255, Math.round(r * 255))
		g = Math.min(255, Math.round(g * 255))
		b = Math.min(255, Math.round(b * 255))

		return { r, g, b }
	}

	this.fromText = function (str) {
		let r, g, b;

		// try to parse `rgb()` type string
		let match = str.match(RGB_REGEXP);

		if (match) {
			r = ~~match[1];
			g = ~~match[2];
			b = ~~match[3];
			this.fromRGB(r, g, b);
		} else {
			// parse HEX color
			let a = '0x' + str.slice(1).replace(str.length < 5 && /./g, '$&$&');
			this.fromRGB(a >> 16, a >> 8 & 255, a & 255);
		}

		return this;
	}

	this.fromRGB = function (r, g, b) {
		const hsv = rgb2hsv(r, g, b)
		this.h = hsv.h
		this.s = hsv.s
		this.v = hsv.v
	}
}


function Color (client) {
	this.el = document.createElement('div')
	this.el.id = 'color'
	this.color = new HSV(0, 0, 0)

	this.el.innerHTML = require('./scripts/color.html')
	document.body.appendChild(this.el)
	this.el.style.display = 'none'

	this.display = document.getElementById('display')
	this.pointer = document.getElementById('colorPointer')
	this.hueSlider = document.getElementById('hueSlider')
	this.alphaSlider = document.getElementById('alphaSlider')
	this.aplhaColor = document.getElementById('alphaColor')

	function horizontalSlidderEvent(dom, target, attribute) {
		dom.addEventListener('mousedown', function (e) {
			var rect = dom.getBoundingClientRect()

			function onMove(e) {
				var x = ~~(e.clientX - rect.left)
				x = Math.max(0, Math.min(360, x))
				target.color[attribute] = x / 360
				target.update()
			}

			function onEnd(e) {
				document.removeEventListener('mousemove', onMove)
				document.removeEventListener('mouseup', onEnd)
			}
			document.addEventListener('mousemove', onMove)
			document.addEventListener('mouseup', onEnd)
		})
	}

	horizontalSlidderEvent(document.getElementById('huePicker'),   this, 'h')
	horizontalSlidderEvent(document.getElementById('alphaPicker'), this, 'a')

	var self = this;
	this.display.addEventListener('mousedown', function (e) {
		var rect = self.display.getBoundingClientRect()

		function onMove(e) {
			var x = ~~(e.clientX - rect.left)
			var y = ~~(e.clientY - rect.top)
			x = Math.max(0, Math.min(360, x))
			y = Math.max(0, Math.min(150, y))

			self.color.s = x / 360
			self.color.v = 1 - y / 150

			self.update()
		}

		function onEnd(e) {
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onEnd)
		}
		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onEnd)
	})

	this.el.addEventListener('click', (e) => {
		this.close()
	})

	document.getElementById('colorContainer').addEventListener('click', (e) => {
		e.preventDefault()
		e.stopPropagation()
	})

	this.toggle = function () {
		if (this.el.style.display === '') {
			this.close()
		} else {
			this.open()
		}
	}

	this.open = function () {
		this.el.style.display = ''
		const color = client.tool.style().color
		this.color.fromText(color)
		this.update()
	}

	this.close = function () {
		this.el.style.display = 'none'
		client.tool.style().color = this.color.hex()
	}

	this.update = function () {
		const { r, g, b } = this.color.rgb()

		this.display.style.backgroundColor = `hsl(${~~(this.color.h * 360)},100%,50%)`
		this.pointer.style.left = this.color.s * 360 + 'px'
		this.pointer.style.top = (1 - this.color.v) * 150 + 'px'
		this.hueSlider.style.left = 4 + this.color.h * 352 + 'px'
		this.alphaSlider.style.left = 4 + this.color.a * 352 + 'px'
		this.aplhaColor.style.background = `linear-gradient(to right, rgba(${r},${g},${b},0) 0%, rgb(${r},${g},${b}) 100%)`

		client.tool.style().color = this.color.hex()
		client.layerSelector.update()
	}
}
