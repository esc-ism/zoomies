import demo from '@/demo';
import {inputListener} from '@/consts';
import {DEGREES, getAngleDiff} from '@/shared';
import {CLASS_HIDE_HORIZONTAL, CLASS_HIDE_VERTICAL} from '@/shared/orientation';

import {CLASS_FLASH_CONTAINER} from '../consts';
import {getText, getInstruction, getInputDependent, getMath} from '../shared';
import {getButton, clearButton} from '../shared/button';
import {xmlns} from '../shared/math';
import flash from '../shared/flash';

import getRestartButton from './restart';
import System from './demo';

let exits = 0;
let instruct;
let exitPromise;
let exitResolve;

const getDialogue = (...content) => ({style: {fontStyle: 'italic', textAlign: 'right', textWrapStyle: 'balance'}, content});

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
		{
			tag: 'h1',
			style: {textAlign: 'center'},
			content: 'Unbound',
		},
		[
			'To start, I\'d like to expound the value of pan-limiting.',
		],
		getDialogue(
			'Wait — before that, what\'s the thing ',
			{tag: 'span', classList: [CLASS_HIDE_HORIZONTAL], content: 'at the top'},
			{tag: 'span', classList: [CLASS_HIDE_VERTICAL], content: 'to the left'},
			'?',
		),
		[
			'Glad you asked!',
			'It\'s our first pan-limiting playground.',
			// todo hook ratioImage and change square/rect
			'The colourful, spotted square is the "image" and it\'s being seen through the "viewport".',
			'To the viewport\'s top-left is a readout of the playground\'s state.',
			'Follow the instructions below to see what you can do with it.',
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
			'Each page will provide a playground for a unique pan-limiting system.',
			'To demonstrate the value of pan-limiting, I\'m starting with a system that neglects it.',
			'A formal description of the system might read:',
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
			'It\'s possible for users to fall away from the image and become lost in the void.',
			'Pan-limiting systems prevent this by keeping users from straying too far beyond the confines of the image.',
			'Like how game developers endeavour to keep players in-bounds, a good pan-limiting system keeps the viewport attached to its content.',
		],
		[
			'A subtler deficiency exists in its snap-panning abilities.',
			'The problem is shared by the system on the next page, where it will be discussed in more detail.',
		],
		{
			tag: 'h2',
			style: {textAlign: 'center'},
			content: 'Conclusion',
		},
		[
			'There do exist niche use cases for unbound panning.',
			'For example, a canvas that grows to accommodate new input would be undermined by pan limits.',
			'In most cases, however, some degree of pan-limiting is useful.',
		],
		[
			'Most importantly, unbound panning is ', {tag: 'i', content: 'boring'}, ' and pan-limiting is ', {tag: 'i', content: 'interesting'}, '!',
		],
		getDialogue(
			'Why make me read about it if you ',
			{tag: 'strong', content: 'agree'},
			' that it\'s boring?',
		),
		[
			'Good question!',
			'I\'m trying to tell a story through this website, and no story\'s ending is as impactful without context.',
			'These early pages will help you to appreciate the complex pan-limiting coming later, and understand the steps taken to get there.',
			'Hopefully, by the end, you\'ll think that pan-limiting is as interesting as I do!',
		],
	),
};
