import demo from '@/demo';
import {inputListener} from '@/consts';
import {DEGREES, getAngleDiff} from '@/shared';
import {CLASS_HIDE_HORIZONTAL, CLASS_HIDE_VERTICAL} from '@/shared/orientation';

import {getText, getInstruction, getDialogue, getInputDependent} from '../shared';
import {clearButton} from '../shared/button';
import getFlash from '../shared/flash';
import {IDS} from '../shared/page';

import getRestartButton from './restart';
import System from './demo';

let exits = 0;
let instruct;
let exitPromise;
let exitResolve;

class Validator {
	static succeed() {
		demo.progress.set(1);
		demo.progress.complete();
		
		return true;
	}
	
	#getValue;
	#getChange;
	#threshold;
	
	constructor(getValue, getChange, threshold) {
		this.#getValue = getValue;
		this.#getChange = getChange;
		this.#threshold = threshold;
	}
	
	get() {
		let value = this.#getValue();
		let change = 0;
		
		return () => {
			change += this.#getChange(value);
			value = this.#getValue();
			
			const progress = change / this.#threshold;
			
			if (progress >= 1) {
				return Validator.succeed();
			}
			
			demo.progress.set(progress);
			
			return false;
		};
	}
}

const instructions = [
	{
		mouse: ['Drag the viewport with your left mouse button to pan.'],
		touch: ['Drag the viewport to pan.'],
		key: 'pan',
		validator: new Validator(
			() => ({...demo.position}),
			({x, y}) => Math.abs(demo.position.x - x) / demo.ratioImage + Math.abs(demo.position.y - y) / demo.ratioImageInverse,
			0.1,
		),
	},
	{
		mouse: ['Left click on the image to snap-pan.'],
		touch: ['Tap the image to snap-pan.'],
		key: 'snap',
	},
	{
		mouse: ['Use your scroll wheel to zoom in and out.'],
		touch: ['Pinch in and out to zoom.'],
		key: 'zoom',
		validator: new Validator(
			() => demo.zoom,
			(zoom) => (demo.zoom > zoom ? (demo.zoom / zoom) : (zoom / demo.zoom)) - 1,
			0.1,
		),
	},
	{
		mouse: ['Drag with your right mouse button to rotate.'],
		touch: ['Drag horizontally with two fingers to rotate.'],
		key: 'rotate',
		validator: new Validator(
			() => demo.rotation,
			(rotation) => Math.abs(getAngleDiff(demo.rotation, rotation)),
			DEGREES[45] / 9,
		),
	},
	{
		mouse: ['Use your scroll wheel while holding "ctrl" on your keyboard to adjust image aspect ratio.'],
		touch: ['Drag vertically with two fingers to adjust image aspect ratio.'],
		key: 'resizeImage',
		validator: new Validator(
			() => demo.ratioImage,
			(ratioImage) => (demo.ratioImage > ratioImage ? (demo.ratioImage / ratioImage) : (ratioImage / demo.ratioImage)) - 1,
			0.1,
		),
	},
	{
		mouse: [
			['Drag the vertical bar at the right side of the viewport to adjust its aspect ratio.'],
			['Drag the horizontal bar below the viewport to adjust its aspect ratio.'],
		],
		touch: [
			['Drag the vertical bar at the right side of the viewport to adjust its aspect ratio.'],
			['Drag the horizontal bar below the viewport to adjust its aspect ratio.'],
		],
		key: 'resizeViewport',
		hasAlt: true,
		validator: (() => {
			const {resizerHorizontal, resizerVertical} = demo.elements;
			
			return new Validator(
				() => [resizerHorizontal.offsetLeft, resizerVertical.offsetTop],
				([x, y]) => Math.abs(resizerHorizontal.offsetLeft - x) / window.innerWidth + Math.abs(resizerVertical.offsetTop - y) / window.innerHeight,
				0.02,
			);
		})(),
	},
	{
		mouse: [
			['Click the vertical bar to reset viewport aspect ratio.'],
			['Click the horizontal bar to reset viewport aspect ratio.'],
		],
		touch: [
			['Tap the vertical bar to reset viewport aspect ratio.'],
			['Tap the horizontal bar to reset viewport aspect ratio.'],
		],
		key: 'resetViewport',
		hasAlt: true,
	},
	{
		mouse: ['Right click on the viewport to reset everything else.'],
		touch: ['Tap the viewport with two fingers to reset everything else.'],
		key: 'resetImage',
	},
];

export default {
	System,
	start: () => {
		instruct();
		
		exitPromise = new Promise((resolve) => {
			exitResolve = resolve;
		});
	},
	end: () => {
		exits++;
		exitResolve();
		
		demo.progress.reset();
		
		clearButton();
	},
	text: getText(
		getInstruction([
			getInputDependent((isMouse) => isMouse ?
				'Not using keyboard and mouse?' :
				'Using keyboard and mouse?'),
			' Scroll up and use the buttons on the header\'s left to switch control scheme.',
		]),
		{
			tag: 'h1',
			content: IDS.SPLASH,
			style: {textAlign: 'center'},
		},
		'Hello! I\'m Callum.',
		[
			'I\'m a programmer who, for a few years now, has been occasionally engrossed in panning problems',
			'(think photo editor, not gold rush).',
			'Specifically, I\'ve been exploring how best to limit where users should be allowed to pan, and how best to implement "snap-panning".',
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
		getDialogue(
			'sure. what\'s the thing ',
			{tag: 'span', classList: [CLASS_HIDE_HORIZONTAL], content: 'at the top'},
			{tag: 'span', classList: [CLASS_HIDE_VERTICAL], content: 'to the left'},
			'?',
		),
		[
			'Glad you asked!',
			'That\'s our first playground.',
			'The colourful, spotted ',
			{tag: 'span', callback: (element) => {
				const thresholdHigh = 1.1;
				const thresholdLow = 1 / thresholdHigh;
				
				const update = () => {
					element.innerText = (demo.ratioImage > 1 ? (demo.ratioImage < thresholdHigh) : (demo.ratioImage > thresholdLow)) ? 'square' : 'rectangle';
				};
				
				demo.hooks.ratio.add(update, true);
				
				update();
			}},
			' is the "image" and it\'s being seen through the "viewport".',
			'To the viewport\'s top-left is a readout of the playground\'s state.',
			'Follow the instructions below to learn the controls.',
		],
		{
			...getInstruction({classList: [CLASS_HIDE_VERTICAL]}, {classList: [CLASS_HIDE_HORIZONTAL]}, getRestartButton()),
			callback: (container) => {
				const [horizontal, vertical, button] = container.children;
				
				let [instruction] = instructions;
				
				const update = () => {
					if (!instruction) {
						return;
					}
					
					const text = instruction[inputListener.isMouse ? 'mouse' : 'touch'];
					
					if (instruction.hasAlt) {
						[horizontal.innerText, vertical.innerText] = text;
					} else {
						horizontal.innerText = vertical.innerText = text;
					}
				};
				
				const flash = getFlash(container);
				
				inputListener.add(update);
				
				button.style.display = 'none';
				
				container.style.position = 'relative';
				
				instruct = async () => {
					const id = exits;
					
					while (true) {
						for (instruction of instructions) {
							update();
							
							const validator = instruction.validator?.get() ?? Validator.succeed;
							let isFirst = true;
							
							do {
								await Promise.race([
									new Promise((resolve) => {
										demo.hooks[instruction.key].add(() => {
											resolve();
											
											return true;
										}, true, false);
									}),
									exitPromise,
								]);
								
								if (id !== exits) {
									[instruction] = instructions;
									
									update();
									
									return;
								}
								
								if (isFirst) {
									demo.progress.reset();
									
									isFirst = false;
								}
							} while (!validator());
							
							flash();
						}
						
						instruction = undefined;
						
						horizontal.style.display = vertical.style.display = 'none';
						
						button.style.removeProperty('display');
						
						container.style.cursor = 'pointer';
						await Promise.race([
							new Promise((resolve) => {
								container.addEventListener('click', resolve, {once: true});
							}),
							exitPromise,
						]);
						
						if (id === exits) {
							flash();
						}
						
						container.style.removeProperty('cursor');
						horizontal.style.removeProperty('display');
						vertical.style.removeProperty('display');
						button.style.display = 'none';
					}
				};
			},
		},
		[
			'Each page on this site will include a playground for you to interact with.',
			'This one just provides a fun visual (panning in a circle around the image\'s center looks pretty neat), but all future pages will showcase a unique approach to pan-limiting.',
		],
		(() => {
			const getBall = (isTop, isLeft) => ({
				tag: 'img', src: './pokeball.png', style: {
					height: '24px',
					imageRendering: 'pixelated',
					position: 'absolute',
					[isLeft ? 'left' : 'right']: '0',
					[isTop ? 'top' : 'bottom']: '0',
					[`border${isTop ? 'Top' : 'Bottom'}${isLeft ? 'Left' : 'Right'}Radius`]: '10px',
					[`border${isTop ? 'Bottom' : 'Top'}${isLeft ? 'Right' : 'Left'}Radius`]: '10px',
					translate: `${isLeft ? '-' : ''}12px ${isTop ? '-' : ''}12px`,
					backgroundColor: 'inherit',
					border: '3px solid black',
					userSelect: 'none',
					boxShadow: 'inherit',
				},
			});
			
			// https://fontmeme.com/fonts/pokemon-classic-font/
			// https://bulbapedia.bulbagarden.net/wiki/Professor_Oak/Quotes#Pok%C3%A9mon_Red,_Blue,_and_Yellow
			return {style: {
				fontFamily: 'Pokemon',
				fontSize: '0.6em',
				textAlign: 'center',
				lineHeight: '2',
				position: 'relative',
				padding: '14px',
				border: '9px double black',
				color: 'black',
				backgroundColor: '#cfcfcf',
				boxShadow: '0 0 5px white',
			}, content: [
				getBall(true, true),
				getBall(true, false),
				'Your very own PANNING legend is about to unfold!',
				'A world of dreams and adventures with BOUNDS awaits!',
				'Let\'s go!',
				getBall(false, true),
				getBall(false, false),
			]};
		})(),
		getInstruction([
			getInputDependent((isMouse) => isMouse ?
				'Hit your right arrow key to see the next page.' :
				'Swipe left to see the next page.'),
		]),
	),
};
