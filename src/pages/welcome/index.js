import gsap from 'gsap';

import Demo from './demo';

import {getText} from '../shared';

import {CLASS_INSTRUCTION} from '../consts';
import {DEGREES} from '@/shared';
import {getProgressed} from '../rotation/shared';
import {getZoomPoints} from '../rotation/axis/demo';
import {getDimensions} from '../rotation/axis';

const tween = async (demo) => {
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
				const [first, second] = getZoomPoints(
					rotation,
					demo.viewportDimensions,
					getDimensions(ratio, demo.viewportDimensions),
				).slice(2);
				
				const getNext = (zoom = 5) => {
					if (zoom >= second.z) {
						const {p, ...position} = getProgressed(second, {x: 0.5, y: 0.5}, zoom);
						
						return [position, [0, 0, 1, p]];
					}
					
					const {p, ...position} = getProgressed(first, second.vpEnd, zoom);
					
					return [position, [0, 0, p * second.p, 0]];
				};
				
				demo.setTween(
					[{ratio}],
					[{rotation, zoom: first.z}],
					[{zoom: 5}, {
						duration: 2,
						onUpdate: function () {
							const [position, progresses] = getNext(demo.zoom);
							
							demo.position = position;
							demo.applyPosition();
							
							demo.rails.setProgress(...progresses);
						},
					}],
					[{position: getNext()[0]}, {duration: 0}],
				);
				
				return demo.tween;
			})
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
					'I\'m a front-end developer who has spent the past two years working on panning problems.',
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
	
	return demo;
};
