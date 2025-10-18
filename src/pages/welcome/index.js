import gsap from 'gsap';

import demo from '@/demo';

import System from './demo';

import {getText, getInstruction} from '../shared';
import {getBound, getRailProgress, getVarGetter} from '../rotation/3line/demo';

import {DEGREES} from '@/shared';
import {InputMethod} from '@/consts';

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
					const position = getBound(demo.zoom, first, second, third) || {x: 0, y: 0};
					const progresses = [...otherProgresses];
					
					demo.position = position;
					demo.applyPosition();
					
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
		[
			'Hello! I\'m Callum — a programmer.',
		],
		[
			'For the past two years or so, I\'ve been delving into panning (the thing you do to look around after zooming in).',
			'Specifically, I\'ve been working on pan-limiting where zoom, rotation, image aspect ratio and viewport aspect ratio are all variable.',
		],
		[
			'This website is a little interactive report of my findings.',
			'It will walk you through the problem space and demonstrate solutions, ranging from trivial to the kind of thing that a non-mathematician might spend two years on.',
		],
		// todo register swipes to change page
		//  todo actually put all text wrappers in a flex container and (snap) scroll to turn page
		getInstruction({callback: (element) => {
			const update = () => {
				element.innerText = InputMethod.isMouse ?
					'Hit your right arrow key to continue. If you\'re not using keyboard and mouse, scroll up to select touchscreen controls.' :
					'Swipe left to continue. If you\'re using keyboard and mouse, scroll up to select that control scheme.';
			};
			
			update();
			
			InputMethod.addListener(update);
		}}),
	),
};
