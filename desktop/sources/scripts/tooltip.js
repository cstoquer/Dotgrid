'use strict'

const MESSAGE_DURATION = 3000;

function Tooltip (client) {
	this.el = document.createElement('div')
	this.el.id = 'tooltip'
	this.timeout = null;
    document.body.appendChild(this.el)


	this.push = function (message) {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		this.el.innerText = message;

		this.timeout = setTimeout(() => {
			this.el.innerText = '';
		}, MESSAGE_DURATION)
	}
}
