import gsap from 'gsap';

import Demo from './demo';

import {getText} from '../shared';
import {getBound, getRailProgress, getVarGetter} from '../rotation/3line/demo';

import {CLASS_INSTRUCTION} from '../consts';
import {DEGREES} from '@/shared';

const tween = async (demo) => {
	// keeps corners away from the readout
	const getRandomRotation = gsap.utils.random(-DEGREES[180] + DEGREES[45], DEGREES[45], undefined, true);
	const getRandomRatio = gsap.utils.random(0.5, 2, undefined, true);
	
	while (!demo.isRemoved) {
		const {zoomPoints, rotation, ratio} = getVarGetter(
			demo,
			getRandomRotation(),
			getRandomRatio(),
		)();
		
		let firstIndex;
		let firstIndexRaw;
		let otherProgresses;
		
		const setFirstIndex = () => {
			if (zoomPoints[2].z > zoomPoints[5].z) {
				firstIndex = firstIndexRaw = 0;
				
				otherProgresses = zoomPoints[5].isFirstInt ? [0, 0] : [0, 0, 0];
				
				return;
			}
			
			firstIndexRaw = 3;
			
			otherProgresses = zoomPoints[2].isFirstInt ? [0, 0] : [0, 0, 0];
			
			if (zoomPoints[2].isFirstInt) {
				firstIndex = 2;
			} else {
				firstIndex = 3;
			}
		};
		
		setFirstIndex();
		
		let [first, second, third] = zoomPoints.slice(firstIndexRaw);
		
		const setZoomPoints = () => {
			demo.constrainPosition({ratio}, true);
			
			setFirstIndex();
			[first, second, third] = demo.zoomPoints.slice(firstIndexRaw);
			
			demo.rails.hide();
			
			demo.rails[firstIndex].show();
			demo.rails[firstIndex + 1].show();
			
			if (!third.isFirstInt) {
				demo.rails[firstIndex + 2].show();
			}
		};
		
		demo.setTween(
			[{ratio}, {delay: 0.5}],
			[{rotation, zoom: first.z}],
			[{zoom: first.z * 3}, {
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
					const progresses = [...otherProgresses];
					
					demo.position = position;
					demo.applyPosition();
					
					progresses.splice(firstIndex, 0, ...getRailProgress(demo.zoom, first, second, third));
					
					demo.rails.setProgress(...progresses);
				},
			}],
		);
		
		await Promise.race([demo.removed, demo.tween]);
		
		if (demo.isRemoved) {
			return;
		}
		
		const {onReverseComplete} = demo.tween.vars;
		
		demo.tween.reverse();
		
		await Promise.race([demo.removed, new Promise((resolve) => {
			demo.tween.eventCallback('onReverseComplete', () => {
				resolve();
				
				onReverseComplete();
			});
		})]);
	}
};

export default (wrapper) => {
	const demo = new Demo();
	
	demo.init().then(() => tween(demo));
	
	wrapper.append(
		demo.constructor.element,
		getText(
			{
				content: [
					'Hello! I\'m Callum.',
					'I\'m a front-end developer who has spent the past two years working on panning problems.',
					'Specifically, I\'ve been working on pan-limiting where zoom, rotation and aspect ratios (for both image and viewport) are variable.',
					'This website serves as my essay on panning, discussing problems and demonstrating solutions.',
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
