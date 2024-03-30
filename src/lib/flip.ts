import { linear } from '$lib/easing'
import type { Options, Rect } from './types'

class Flip {
	selector
	defaults

	constructor(selector: string, defaults: Options = {}) {
		this.selector = selector
		this.defaults = defaults
	}

	rect(el: Element) {
		// Since `getBoundingClientRect` returns a DOMRect, we need to convert it to a plain object to spread it.
		const rect = el.getBoundingClientRect().toJSON()

		const computedStyle = window.getComputedStyle(el)

		// Store the initial transform and any other properties we care about.
		const initialStyles = {
			transform: computedStyle.transform === 'none' ? '' : computedStyle.transform
			// Add other styles as needed.
		}

		return { el, ...rect, initialStyles }
	}

	measure() {
		// Convert the NodeList to an array so we can use `map`.
		return Array.from(document.querySelectorAll(this.selector)).map(this.rect)
	}

	absolute(el: Element, to: Rect) {
		// Set the element's position to absolute so we can animate it freely.
		el.setAttribute(
			'style',
			`
				position: absolute;
				top: ${to.top}px;
				left: ${to.left}px;
				width: ${to.width}px;
				height: ${to.height}px;
			`
		)

		return () => el.removeAttribute('style')
	}

	invert(el: Element, first: Rect, last: Rect, options: Options) {
		const { promise, resolve } = Promise.withResolvers()

		// Calculate the differences
		const dx = first.left - last.left
		const dy = first.top - last.top

		const removeStyle = this.absolute(el, last)
		const flip = el.animate(
			[
				{
					width: `${first.width}px`,
					height: `${first.height}px`,
					transform: `translate(${dx}px, ${dy}px)`
				},
				{
					width: `${last.width}px`,
					height: `${last.height}px`,
					transform: `translate(0px, 0px)`
				}
			],
			{ ...options, fill: 'backwards' }
		)

		flip.onfinish = () => {
			removeStyle()
			resolve(null)
		}

		return promise
	}

	flip(options: Options = {}) {
		const {
			duration = 1000,
			delay = 0,
			stagger = 0,
			easing = linear
		} = { ...this.defaults, ...options }

		// Create a promise that resolves when all the animations are done.
		const { promise, resolve } = Promise.withResolvers()
		const promises: Promise<void>[] = []

		const first = this.measure()

		requestAnimationFrame(() => {
			const last = this.measure()

			for (let i = 0; i < first.length; i++) {
				const promise = this.invert(last[i].el, first[i], last[i], {
					duration,
					delay: i * stagger + delay,
					easing
				})
				promises.push(promise)
			}

			Promise.all(promises).then(resolve)
		})

		return promise
	}
}

export function createFlip(selector: string, defaults: Options = {}) {
	return new Flip(selector, defaults)
}
