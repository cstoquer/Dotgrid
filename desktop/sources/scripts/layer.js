'use strict'

const LAYER_NAMES = '1234567890';

function LayerSelector (client) {
	this.el = document.createElement('div')
	this.el.id = 'layers'
	this.items = []

	this.selector = document.createElement('div');
	this.selector.id = 'selector'
	this.el.appendChild(this.selector)

	for (let i = 0; i < LAYERS_COUNT; i++) {
		const item = document.createElement('div')
		item.className = 'layer'
		item.innerText = LAYER_NAMES[i]
		this.el.appendChild(item)
		this.items.push(item)
		item.addEventListener('click', client.tool.selectLayer.bind(client.tool, i))
	}

	this.start = function () {
		this.update();
	}

	this.update = function () {
		const styles = client.tool.styles
		for (let i = 0; i < LAYERS_COUNT; i++) {
			const style = styles[i]
			this.items[i].style.backgroundColor = style.color
		}
		this.selector.style.left = client.tool.index * 24 + 'px'
	}
}
