import {xmlns} from '@/pages/shared/svg';
import {CLASS_FLASH_CONTAINER, CLASS_MATH} from '../consts';
import {getText, getButton, registerDemo, getInstruction, flash} from '../shared';

import getRestartButton from './restart';

import Demo from './demo';
import {CLASS_HIDE_HORIZONTAL, CLASS_HIDE_VERTICAL} from '@/shared/css';

const instructions = [
	{text: ['Drag with your left mouse button to pan.'], key: 'pan'},
	{text: ['Left click on the image to snap-pan.'], key: 'snap'},
	{text: ['Drag with your right mouse button to rotate.'], key: 'rotate'},
	{text: ['Use your scroll wheel to zoom in and out.'], key: 'zoom'},
	{text: ['Use your scroll wheel while holding "ctrl" on your keyboard to adjust image aspect ratio.'], key: 'resizeImage'},
	{text: [
		['Drag the vertical bar at the right side of the viewport to adjust its aspect ratio.'],
		['Drag the horizontal bar below the viewport to adjust its aspect ratio.'],
	], key: 'resizeViewport', hasAlt: true},
	{text: ['Right click the vertical bar to reset viewport aspect ratio.'], key: 'resetViewport'},
	{text: ['Right click on the viewport to reset everything else.'], key: 'resetImage'},
];

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	
	wrapper.append(
		demo.constructor.element,
		getText(
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
			{...getInstruction({classList: [CLASS_HIDE_VERTICAL]}, {classList: [CLASS_HIDE_HORIZONTAL]}, getRestartButton()), callback: async (container) => {
				const [horizontal, vertical, button] = container.children;
				
				container.classList.add(CLASS_FLASH_CONTAINER);
				
				button.style.display = 'none';
				
				container.style.position = 'relative';
				
				while (true) {
					for (const instruction of instructions) {
						if (instruction.hasAlt) {
							[horizontal.innerText, vertical.innerText] = instruction.text;
						} else {
							horizontal.innerText = vertical.innerText = instruction.text;
						}
						
						await new Promise((resolve) => {
							demo.actionPromises[instruction.key] = resolve;
						});
						
						flash(container);
					}
					
					horizontal.style.display = vertical.style.display = 'none';
					
					button.style.removeProperty('display');
					
					container.style.cursor = 'pointer';
					await new Promise((resolve) => {
						container.addEventListener('click', resolve, {once: true});
					});
					
					container.style.removeProperty('cursor');
					
					flash(container);
					
					horizontal.style.removeProperty('display');
					vertical.style.removeProperty('display');
					button.style.display = 'none';
				}
			}},
			[
				'Each webpage will provide a playground for a unique pan-limiting system.',
				'To demonstrate the value of pan-limiting, I\'m starting with a system that neglects it.',
				'It may be described like:',
			],
			{tag: 'p', classList: [CLASS_MATH], content: [
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
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
				]},
			]},
			{
				tag: 'h2',
				style: {textAlign: 'center'},
				content: 'Effectiveness',
			},
			'Let\'s get into its issues.',
			getInstruction([
				'Notice the pink text below?',
				'Holding your cursor over pink text will demonstrate relevant concepts.',
				'Click pink text to skip to the end of demonstrations and set your playground state.',
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
				'Pan-limiting systems prevent this by keeping users from the no man\'s land beyond the confines of the image.',
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
	);
	
	return demo;
};
