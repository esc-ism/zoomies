import gsap from 'gsap';

import Demo from './demo';

import {getText} from '../shared';
import {getBound, getRailProgress, getVarGetter} from '../rotation/3line/demo';

import {CLASS_INSTRUCTION} from '../consts';
import {DEGREES} from '@/shared';

const tween = async (demo) => {
	const wait = async (delay = 1) => await new Promise((resolve, reject) => {
		window.setTimeout(() => {
			if (!demo.element.isConnected) {
				reject();
				
				return;
			}
			
			if (document.hidden) {
				document.addEventListener('visibilitychange', resolve, {once: true});
				
				return;
			}
			
			resolve();
		}, delay * 1000);
	});
	
	let isActive = true;
	
	while (isActive) {
		await wait()
			.then(() => {
				const {zoomPoints, rotation, ratio} = getVarGetter(
					demo,
					gsap.utils.random(-DEGREES[180], 0),
					gsap.utils.random(0.5, 2),
				)();
				
				let firstIndex = zoomPoints[5].isFirstInt ? 0 : 3;
				let [first, second, third] = zoomPoints.slice(firstIndex);
				
				const setZoomPoints = () => {
					demo.constrainPosition({ratio}, true);
					
					firstIndex = demo.zoomPoints[5].isFirstInt ? 0 : 3;
					[first, second, third] = demo.zoomPoints.slice(firstIndex);
					
					demo.rails.hide();
					
					demo.rails[firstIndex].show();
					demo.rails[firstIndex + 1].show();
					demo.rails[firstIndex + 2].show();
				};
				
				demo.setTween(
					[{ratio}],
					[{rotation, zoom: first.z}],
					[{zoom: 5}, {
						duration: 2,
						onStart() {
							setZoomPoints();
							
							demo.resizeCallback = setZoomPoints;
							demo.tween.data.ignorePosition = true;
						},
						onReverseComplete() {
							demo.rails.hide();
							
							demo.position.x = demo.position.y = 0;
							demo.applyPosition();
							
							delete demo.resizeCallback;
							delete demo.tween.data.ignorePosition;
						},
						onUpdate() {
							const position = getBound(demo.zoom, first, second, third) || {x: 0, y: 0};
							const progresses = [0, 0, 0];
							
							demo.position = position;
							demo.applyPosition();
							
							progresses.splice(firstIndex, 0, ...getRailProgress(demo.zoom, first, second, third));
							
							demo.rails.setProgress(...progresses);
						},
					}],
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
	
	demo.init().then(() => tween(demo));
	
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
