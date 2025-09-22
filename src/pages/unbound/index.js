import {getText, getButton, registerDemo, getInstruction} from '../shared';

import getRestartButton from './restart';

import Demo from './demo';

const instructions = [
	{text: ['Pan by dragging with the left mouse button.'], key: 'pan'},
	{text: ['Drag with your right mouse button to rotate.'], key: 'rotate'},
	{text: ['Use your mouse wheel to zoom in and out.'], key: 'zoom'},
	{text: ['Zoom while holding the control button on your keyboard to adjust image aspect ratio.'], key: 'resizeImage'},
	{text: ['Drag the vertical bar to the right of the playground to adjust viewport aspect ratio.'], key: 'resizeViewport'},
	{text: ['To reset viewport aspect ratio, right click the bar you used to adjust it.'], key: 'resetViewport'},
	{text: ['Finally, right click on the viewport to reset the image.'], key: 'resetImage'},
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
				'Firstly, I\'d like to touch on why pan-limiting is necessary.',
			],
			{
				style: {fontStyle: 'italic'},
				content: 'Wait, before that, what\'s the thing to the left?',
			},
			[
				'Glad you asked!',
				'It\'s our first pan-limiting playground.',
				'The colourful, spotted square is the "image" and it\'s being seen through the "viewport".',
				'Follow along with the dark-yellow box below to see what you can do with it.',
			],
			{...getInstruction([]), callback: async (container) => {
				const element = container.firstChild;
				const button = getRestartButton();
				
				container.appendChild(button);
				
				container.style.position = 'relative';
				
				element.style.transition = button.style.transition = 'opacity 0.6s ease-out';
				
				while (true) {
					for (const {text, key} of instructions) {
						element.style.opacity = '1';
						element.innerText = text;
						
						await new Promise((resolve) => {
							demo.actionPromises[key] = resolve;
						});
						
						element.style.opacity = '0';
						
						await new Promise((resolve) => {
							element.addEventListener('transitionend', resolve, {once: true});
						});
					}
					
					element.style.position = 'absolute';
					
					button.style.removeProperty('position');
					button.style.opacity = '1';
					
					container.style.cursor = 'pointer';
					await new Promise((resolve) => {
						container.addEventListener('click', resolve, {once: true});
					});
					
					container.style.removeProperty('cursor');
					button.style.opacity = '0';
					
					await new Promise((resolve) => {
						button.addEventListener('transitionend', resolve, {once: true});
					});
					
					element.style.removeProperty('position');
					button.style.position = 'absolute';
				}
			}},
			[
				'Each webpage will provide a playground for a unique pan-limiting system.',
				'To illustrate the value of pan-limiting, I\'m starting with a system that neglects it.',
				'Let\'s get into its issues.',
			],
			{
				tag: 'h2',
				style: {textAlign: 'center'},
				content: 'Effectiveness',
			},
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
				'Additionally, more advanced pan-limiting systems can take a position and derive an appropriate zoom level.',
				'This turns out to be a useful feature when span-panning, but that\'s a topic for later.',
			],
			{
				tag: 'h2',
				style: {textAlign: 'center'},
				content: 'Conclusion',
			},
			[
				'Some degree of pan limiting is important.',
				'Like how game developers endeavour to keep players in-bounds, a good pan-limiting system keeps the viewport attached to its content.',
			],
			'Let\'s move on and take a look at the minimum viable product.',
		),
	);
	
	return demo;
};
