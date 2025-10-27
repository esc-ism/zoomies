import {DEGREES, getAngleDiff} from '@/shared';
import {xmlns} from '@/pages/shared/math';
import demo from '@/demo';
import {inputListener} from '@/consts';
import {CLASS_HIDE_HORIZONTAL, CLASS_HIDE_VERTICAL} from '@/shared/orientation';

import {CLASS_FLASH_CONTAINER, CLASS_MATH_WRAPPER} from '../consts';
import {getText, getButton, getInstruction, getInputDependent, getMath} from '../shared';
import flash from '../shared/flash';

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
			0.3,
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
			0.3,
		),
	},
	{
		mouse: ['Drag with your right mouse button to rotate.'],
		touch: ['Drag horizontally with two fingers to rotate.'],
		key: 'rotate',
		validator: new Validator(
			() => demo.rotation,
			(rotation) => Math.abs(getAngleDiff(demo.rotation, rotation)),
			DEGREES[45] / 3,
		),
	},
	{
		mouse: ['Use your scroll wheel while holding "ctrl" on your keyboard to adjust image aspect ratio.'],
		touch: ['Drag vertically with two fingers to adjust image aspect ratio.'],
		key: 'resizeImage',
		validator: new Validator(
			() => demo.ratioImage,
			(ratioImage) => (demo.ratioImage > ratioImage ? (demo.ratioImage / ratioImage) : (ratioImage / demo.ratioImage)) - 1,
			0.3,
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
				0.06,
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
	},
	text: getText(
		{
			tag: 'h1',
			style: {textAlign: 'center'},
			content: 'Unbound',
		},
		[
			'To start, I\'d like to touch on why pan-limiting is necessary.',
		],
		{
			style: {fontStyle: 'italic'},
			content: [
				'Wait, before that, what\'s the thing ',
				{tag: 'span', classList: [CLASS_HIDE_HORIZONTAL], content: 'at the top'},
				{tag: 'span', classList: [CLASS_HIDE_VERTICAL], content: 'to the left'},
				'?',
			],
		},
		[
			'Glad you asked!',
			'It\'s our first pan-limiting playground.',
			'The colourful, spotted square is the "image" and it\'s being seen through the "viewport".',
			'To the viewport\'s top-left is a readout of the playground\'s state.',
			'Follow the instructions below to see what you can do with it.',
		],
		{
			...getInstruction({classList: [CLASS_HIDE_VERTICAL]}, {classList: [CLASS_HIDE_HORIZONTAL]}, getRestartButton()),
			callback: (container) => {
				const [horizontal, vertical, button] = container.children;
				
				let [instruction] = instructions;
				
				const update = (isMouse) => {
					if (!instruction) {
						return;
					}
					
					const text = instruction[isMouse ? 'mouse' : 'touch'];
					
					if (instruction.hasAlt) {
						[horizontal.innerText, vertical.innerText] = text;
					} else {
						horizontal.innerText = vertical.innerText = text;
					}
				};
				
				inputListener.add(update);
				
				container.classList.add(CLASS_FLASH_CONTAINER);
				
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
										}, true);
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
							
							flash(container);
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
							flash(container);
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
			'Each webpage will provide a playground for a unique pan-limiting system.',
			'To demonstrate the value of pan-limiting, I\'m starting with a system that neglects it.',
			'It may be described like:',
		],
		getMath({
			content: {tag: 'mtable', xmlns, content: [
				{tag: 'mtr', xmlns, content: [
					{tag: 'mtd', xmlns, content: [
						{tag: 'mn', xmlns, content: '-∞'},
						{tag: 'mo', xmlns, content: '<'},
						{tag: 'mi', xmlns, content: 'x'},
						{tag: 'mo', xmlns, content: '<'},
						{tag: 'mn', xmlns, content: '∞'},
					]},
				]},
				{tag: 'mtr', xmlns, content: [
					{tag: 'mtd', xmlns, content: [
						{tag: 'mn', xmlns, content: '-∞'},
						{tag: 'mo', xmlns, content: '<'},
						{tag: 'mi', xmlns, content: 'y'},
						{tag: 'mo', xmlns, content: '<'},
						{tag: 'mn', xmlns, content: '∞'},
					]},
				]},
			]},
		}),
		{
			tag: 'h2',
			style: {textAlign: 'center'},
			content: 'Effectiveness',
		},
		'Let\'s get into its issues.',
		getInstruction([
			'Notice the pink text below?',
			getInputDependent((isMouse) =>
				` ${isMouse ? 'Click' : 'Tap'} it for a visualisation.` +
				` ${isMouse ? 'Click' : 'Tap'} again to restore your playground state.`),
		]),
		[
			'A competent user of this system may ',
			getButton('self-impose', [
				[{zoom: 1, position: 0.2}],
				[{position: {x: 0.3, y: -0.2}}],
				[{position: {x: -0.2, y: -0.3}}],
				[{position: {x: -0.4, y: 0.2}}],
			]),
			' a pan-limiting algorithm to keep their bearings.',
			'But what if their ',
			getButton('finger slips', [
				[{position: 2, zoom: 1}],
			]),
			'?',
		],
		[
			'You can imagine how someone might slide away from the image and become lost in the void.',
			'Pan-limiting systems prevent this by keeping users from the no-man\'s land beyond the confines of the image.',
		],
		[
			'Pan-limits here are fixed, regardless of zoom.',
			'More advanced systems can take a position and derive an appropriate zoom level, which is useful when span-panning.',
			'I\'ll talk more about that later.',
		],
		{
			tag: 'h2',
			style: {textAlign: 'center'},
			content: 'Conclusion',
		},
		[
			'Some degree of pan-limiting is important.',
			'Like how game developers endeavour to keep players in-bounds, a good pan-limiting system keeps the viewport attached to its content.',
		],
		'Let\'s move on and take a look at the minimum viable product.',
	),
};
