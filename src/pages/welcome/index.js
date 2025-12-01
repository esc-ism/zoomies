import gsap from 'gsap';

import {inputListener} from '@/consts';
import demo from '@/demo';
import {DEGREES} from '@/shared';

import {getText, getInstruction} from '../shared';
import {getBound, getRailProgress, getVarGetter} from '../rotation/3line/demo';

import System from './demo';

let stopResolver;
let doStop;

const tween = async (stop) => {
	const getRandomRotation = gsap.utils.random([
		-DEGREES[90] - DEGREES['45_2'], -DEGREES[90] + DEGREES['45_2'],
		-DEGREES['45_2'], DEGREES['45_2'],
	], true);
	
	const ratioGetters = [
		() => {
			getRandomRatio = ratioGetters[1];
			
			return 0.5 + Math.random() * 0.25;
		},
		() => {
			getRandomRatio = ratioGetters[0];
			
			return 2 - Math.random() * 0.5;
		},
	];
	
	let [getRandomRatio] = ratioGetters;
	
	while (!doStop) {
		const {zoomPoints, rotation, ratio} = getVarGetter(
			getRandomRotation(),
			demo.ratioViewport / getRandomRatio(),
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
			[{ratio, position: 0, rotation, zoom: first.z}, {delay: 0.5}],
			[{zoom: 10}, {
				duration: 10,
				ease: 'power1.in',
				isPositionUpdate: true,
				onStart() {
					setZoomPoints();
					
					gsap.ticker.fps(30);
					
					demo.resizeCallback = setZoomPoints;
				},
				onComplete() {
					delete demo.resizeCallback;
				},
				onUpdate(tween) {
					const progresses = [...otherProgresses];
					
					tween.timeScale(1 + (Math.pow(tween.ratio, 1.2) * 2));
					
					demo.elements.viewport.style.filter = `brightness(${100 - tween.ratio * 100}%)`;
					
					demo.position = getBound(demo.zoom, first, second, third) || {x: 0, y: 0};
					demo.applyPosition();
					
					progresses.splice(firstIndex, 0, ...getRailProgress(demo.zoom, first, second, third));
					
					demo.system.rails.setProgress(...progresses);
				},
			}],
		);
		
		await Promise.race([stop, demo.tween]);
		
		gsap.ticker.fps(60);
		
		if (doStop) {
			demo.elements.viewport.style.removeProperty('filter');
			
			return;
		}
		
		demo.system.rails.hide();
		
		demo.rotation = DEGREES[90];
		
		demo.setTween(
			[{zoom: 0, position: 0}, {
				duration: 0,
				onComplete: () => {
					demo.tweenUpdate.then(() => {
						demo.elements.viewport.style.removeProperty('filter');
					});
				},
			}],
			[{zoom: 1, rotation: -DEGREES[270]}, {cutRotation: false, duration: 5}],
			[{ratio: 0.5}, {position: '<'}],
			[{ratio: 1.5}],
			[{ratio: 0.75}],
			[{ratio: 2}],
			[{ratio: 1}],
		);
		
		await Promise.race([stop, demo.tween.then(() => demo.tweenUpdate)]);
	}
};

const state = {};

export default {
	System,
	start() {
		state.rotation = demo.rotation;
		state.ratioImage = demo.ratioImage;
		state.zoom = demo.zoom;
		state.position = {...demo.position};
		
		demo.progress.element.style.display = 'none';
		
		doStop = false;
		
		tween(new Promise((resolve) => {
			stopResolver = resolve;
		}));
	},
	end() {
		doStop = true;
		
		stopResolver();
		
		Object.assign(demo, state);
		
		demo.applyPosition();
		demo.applyZoom();
		demo.applyRotation();
		demo.updateSizesImage(false);
		
		demo.progress.element.style.removeProperty('display');
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
			'Specifically, I\'ve been exploring how best to bound where users should be allowed to pan, and how best to facilitate "snap-panning".',
		],
		[
			'My scope is restricted to standard, rectangular shapes, keeping all four corners viewable at all times and handling the following variables:',
			{tag: 'ul', style: {marginBlockStart: '1ex', marginBlockEnd: '0.5em'}, content: [
				'Image aspect ratio',
				'Viewport aspect ratio',
				'Zoom',
				'Rotation',
			].map((content) => ({tag: 'li', content}))},
		],
		[
			'This website is a little interactive report of my findings.',
			'It will walk you through the problems and demonstrate solutions, building from basics to the limits of my amateur capabilities.',
		],
		getInstruction([
			{tag: 'span', callback: (element) => {
				const update = () => {
					element.innerText = inputListener.isMouse ?
						'Hit your right arrow key to see the next page. Not using keyboard and mouse?' :
						'Swipe left to see the next page. Using keyboard and mouse?';
				};
				
				inputListener.add(update);
			}},
			' Scroll up and use the buttons on the header\'s left to switch control scheme.',
		]),
	),
};
