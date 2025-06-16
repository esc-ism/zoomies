import gsap from 'gsap';

import Demo from './demo';

import {getText} from '../shared';

import {CLASS_INSTRUCTION} from '../consts';
import {DEGREES} from '@/shared';
import {getImageFit} from '../rotation/axis/demo';

const getTopRight = (rotation, doOffset) => {
	switch ((Math.floor(rotation / DEGREES[90]) % 4) - (doOffset ? 1 : 0)) {
		case 0: return {x: 0.5, y: 0.5};
		case 1: return {x: 0.5, y: -0.5};
		case 2: return {x: -0.5, y: -0.5};
	}
	
	return {x: -0.5, y: 0.5};
};

const getDimensions = (width = 1, height = 1) => ({
	width, height,
	halfWidth: width / 2,
	halfHeight: height / 2,
});

const tween = async (demo) => {
	gsap.ticker.fps(20);
	
	const wait = async (delay = 1) => await new Promise((resolve, reject) => {
		window.setTimeout(() => {
			if (demo.element.isConnected) {
				resolve();
			} else {
				reject();
			}
		}, delay * 1000);
	});
	
	let isActive = true;
	
	while (isActive) {
		await wait()
			.then(() => {
				const rotation = gsap.utils.random(DEGREES[180], DEGREES[360]);
				const ratio = gsap.utils.random(0.5, 2);
				const [zoom0, zoom1] = getImageFit(
					rotation,
					getDimensions(),
					getDimensions(Math.min(1, 1 / ratio), Math.min(1, 1 * ratio)),
				);
				const zoom = Math.max(zoom0, zoom1);
				
				const position = getTopRight(rotation, zoom0 > zoom1);
				
				demo.setTween(
					['ratio', ratio, {delay: 0}],
					['rotation', rotation, {duration: 3, delay: '>'}],
					['zoom', zoom, {duration: 3, delay: '<'}],
					['position', position, {delay: '>+=0.5'}],
					['zoom', zoom * 4, {duration: 3, delay: '<'}],
				);
				
				return demo.tween;
			})
			.then(() => wait())
			.then(() => {
				const {onReverseComplete} = demo.tween.vars;
				
				demo.tween.reverse();
				
				return new Promise((resolve) => {
					demo.tween.eventCallback('onReverseComplete', () => {
						resolve();
						
						onReverseComplete();
					});
				});
			}).catch(() => isActive = false);
	}
};

export default (wrapper) => {
	const demo = new Demo();
	
	demo.element.style.pointerEvents = 'none';
	demo.elements.resizer.style.pointerEvents = 'all';
	
	tween(demo);
	
	wrapper.append(
		demo.element,
		getText(
			{
				content: [
					'Hello! I\'m Callum.',
					'I\'m a front-end developer who has been unemployed for the past two years whilst working on panning problems.',
					'Specifically, I\'ve been working on pan-limiting where zoom, rotation and aspect ratios (for both image and viewport) are variable.',
					'This website serves as my essay on panning, discussing the problems and demonstrating my solutions.',
				],
			},
			{
				content: 'Hit your right arrow key to continue.',
				classList: [CLASS_INSTRUCTION],
			},
		),
	);
	
	return {
		remove() {
			demo.remove();
			
			gsap.ticker.fps();
		},
	};
};
