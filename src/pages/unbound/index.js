import {getText, getButton, registerDemo, getInstruction} from '../shared';

import Demo from './demo';

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
			'First thing\'s first: why is pan-limiting necessary?',
			[
				'To the left is our first pan-limiting playground.',
				'This particular playground neglects to limit panning.',
				'Try it out!',
			],
			{
				tag: 'h2',
				style: {textAlign: 'center'},
				content: 'Controls',
			},
			{
				tag: 'p',
				style: {whiteSpace: 'pre', textAlign: 'center', lineHeight: 'normal', fontFamily: 'courier-new, monospace'},
				content: [
					'╔════════╦════════════════╦══════════╗', {tag: 'br'},
					'║ ', {tag: 'strong', content: 'ACTION'}, ' ║     ', {tag: 'strong', content: 'MOUSE'}, '      ║ ', {tag: 'strong', content: 'KEYBOARD'}, ' ║', {tag: 'br'},
					'╠════════╬═══════╦════════╬══════════╣', {tag: 'br'},
					'║ Pan    ║ Drag  ║ Left   ║          ║', {tag: 'br'},
					'╠════════╬═══════╣ Mouse  ╠══════════╣', {tag: 'br'},
					'║ Snap   ║ Click ║ Button ║          ║', {tag: 'br'},
					'╠════════╬═══════╩════════╬══════════╣', {tag: 'br'},
					'║ Zoom   ║                ║          ║', {tag: 'br'},
					'╠════════╣ Scroll Wheel   ╠══════════╣', {tag: 'br'},
					'║ Scale  ║                ║ ctrl     ║', {tag: 'br'},
					'╠════════╬═══════╦════════╬══════════╣', {tag: 'br'},
					'║ Rotate ║ Drag  ║ Right  ║          ║', {tag: 'br'},
					'╠════════╬═══════╣ Mouse  ╠══════════╣', {tag: 'br'},
					'║ Reset  ║ Click ║ Button ║          ║', {tag: 'br'},
					'╚════════╩═══════╩════════╩══════════╝',
				],
			},
			{
				tag: 'h2',
				style: {textAlign: 'center'},
				content: 'Effectiveness',
			},
			getInstruction([
				'Notice the pink text below?',
				'Placing your cursor over pink text will demonstrate relevant concepts.',
				'Clicking this text will skip to the end of demonstrations and set your playground state.',
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
				'This turns out to be a useful feature when span-panning, but that\'s a topic for the next page.',
			],
			{
				tag: 'h2',
				style: {textAlign: 'center'},
				content: 'Conclusion',
			},
			[
				'Some degree of pan limiting is important.',
				'Let\'s move on and take a look at the minimum viable product.',
			],
		),
	);
	
	return demo;
};
