export type Rect = DOMRect & { el: Element }

export type Options = {
	/**
	 * @description The duration of the animation in milliseconds.
	 */
	duration?: number

	/**
	 * @description The delay before the animation starts in milliseconds.
	 */
	delay?: number

	/**
	 * @description The delay between each element in milliseconds.
	 */
	stagger?: number

	/**
	 * @description The easing function to use for the animation.
	 */
	easing?: string
}
