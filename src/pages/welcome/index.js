import gsap from 'gsap';

import {inputListener} from '@/consts';
import demo from '@/demo';
import {DEGREES} from '@/shared';

import {getText, getInstruction} from '../shared';
import {getBound, getRailProgress, getVarGetter} from '../rotation/3line/demo';

import System from './demo';
// todo
//  I'm thinking it'd be cooler to devote a quadrant of the screen to each corner
//  scale and pan to zoom in on each image corner

let stopResolver;
let doStop;

const tween = async (stop) => {
	// keeps corners away from the readout
	const getRandomRotation = gsap.utils.random(-DEGREES[180] + DEGREES[45], DEGREES[45], undefined, true);
	const getRandomRatio = gsap.utils.random(0.5, 2, undefined, true);
	
	while (!doStop) {
		const {zoomPoints, rotation, ratio} = getVarGetter(
			getRandomRotation(),
			getRandomRatio(),
		)();
		
		let firstIndex;
		let firstIndexRaw;
		let otherProgresses;
		
		const setFirstIndex = (zoomPoints) => {
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
		
		setFirstIndex(zoomPoints);
		
		let [first, second, third] = zoomPoints.slice(firstIndexRaw);
		
		const setZoomPoints = () => {
			demo.system.constrainPosition({ratio: true}, true);
			
			setFirstIndex(demo.system.zoomPoints);
			[first, second, third] = demo.system.zoomPoints.slice(firstIndexRaw);
			
			demo.system.rails.hide();
			
			demo.system.rails[firstIndex].show();
			demo.system.rails[firstIndex + 1].show();
			
			if (!third.isFirstInt) {
				demo.system.rails[firstIndex + 2].show();
			}
		};
		
		demo.setTween(
			[{ratio, position: 0}, {delay: 0.5}],
			[{rotation, zoom: first.z}],
			[{zoom: first.z * 3}, {
				duration: 2,
				onStart() {
					setZoomPoints();
					
					demo.resizeCallback = setZoomPoints;
					demo.tween.data.ignorePosition = true;
				},
				onReverseComplete() {
					demo.system.rails.hide();
					
					demo.position.x = demo.position.y = 0;
					demo.applyPosition();
					
					delete demo.resizeCallback;
					delete demo.tween.data.ignorePosition;
				},
				onUpdate() {
					const progresses = [...otherProgresses];
					
					demo.position = getBound(demo.zoom, first, second, third) || {x: 0, y: 0};
					
					progresses.splice(firstIndex, 0, ...getRailProgress(demo.zoom, first, second, third));
					
					demo.system.rails.setProgress(...progresses);
				},
			}],
		);
		
		await Promise.race([stop, demo.tween]);
		
		if (doStop) {
			return;
		}
		
		const {onReverseComplete} = demo.tween.vars;
		
		demo.tween.reverse();
		
		await Promise.race([stop, new Promise((resolve) => {
			demo.tween.eventCallback('onReverseComplete', () => {
				resolve();
				
				onReverseComplete();
			});
		})]);
		
		await new Promise((resolve) => window.setTimeout(resolve, 1000));
	}
};

export default {
	System,
	start() {
		doStop = false;
		
		tween(new Promise((resolve) => {
			stopResolver = resolve;
		}));
	},
	end() {
		doStop = true;
		
		stopResolver();
	},
	text: getText(
		{
			tag: 'h1',
			content: 'Zoomies',
			style: {textAlign: 'center'},
		},
		'Hello! I\'m Callum.',
		[
			'I\'m a programmer who, for a few years now, has been occasionally engrossed in panning problems',
			'(think photo editor, not gold rush).',
			'Specifically, I\'ve been exploring how best to limit where users should be allowed to pan, and how best to facilitate "snap-panning".',
		],
		[
			'My scope is restricted to rectangular content, keeping all four corners viewable at all times and handling the following variables:',
			{tag: 'ul', style: {marginBlockStart: '1ex', marginBlockEnd: '0.5em'}, content: [
				'Image size',
				'Viewport size',
				'Zoom',
				'Rotation',
			].map((content) => ({tag: 'li', content}))},
		],
		[
			'This website is a little interactive report of my findings.',
			'It will walk you through the problems and demonstrate solutions, building from basics to the limits of my amateur capabilities.',
		],
		getInstruction({callback: (element) => {
			const update = () => {
				element.innerText = inputListener.isMouse ?
					'Hit your right arrow key to see the next page. If you\'re not using keyboard and mouse, scroll up to select touchscreen controls.' :
					'Swipe left to see the next page. If you\'re using keyboard and mouse, scroll up to select that control scheme.';
			};
			
			inputListener.add(update);
		}}),
	),
};
