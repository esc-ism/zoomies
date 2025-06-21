import {getText, getCode, getButton} from '../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	wrapper.append(
		demo.element,
		getText(
			{
				tag: 'h1',
				content: 'Unbound',
				style: {textAlign: 'center'},
			},
			[
				'First thing\'s first: why is pan-limiting necessary?',
				'Well, that question would be easy to answer if we had an image that allows unbound panning...',
			],
			'Fortunately, that\'s what we see to our left!',
			[
				'This is our first pan-limiting demonstration.',
				'This particular demonstration neglects to limit panning.',
				'Try it out!',
			],
			{
				tag: 'h2',
				content: 'Controls',
				style: {textAlign: 'center'},
			},
			{
				tag: 'p',
				content: [
					'╔════════╦════════════════╦══════════╗', {tag: 'br'},
					'║ ACTION ║     MOUSE      ║ KEYBOARD ║', {tag: 'br'},
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
				style: {whiteSpace: 'pre', textAlign: 'center', lineHeight: 'normal'},
			},
			{
				tag: 'h2',
				content: 'Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'A competent user of this system may ',
				getButton('self-impose', demo, [
					[{zoom: 1, position: 0.2}],
					['position', {x: 0.3, y: -0.2}],
					['position', {x: -0.2, y: -0.3}],
					['position', {x: -0.4, y: 0.2}],
				]),
				' a pan-limiting algorithm to keep their bearings.',
				'But what if their ',
				getButton('finger slips', demo, [
					[{position: 2, zoom: 1}],
				]),
				'?',
			],
			[
				'You can imagine how someone might slide away from the image and become lost in the void.',
				'Pan-limiting systems prevent this by keeping users from the no man\'s land beyond the confines of the image.',
			],
			[
				'Some pan-limiting systems can also take a position and derive an appropriate zoom level; something that this system is incapable of.',
				'This turns out to be a useful feature when span-panning, but that\'s a topic for the next page.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'Some degree of pan limiting is important.',
				'Let\'s move on and take a look at the minimum viable product.',
			],
		),
	);
	
	return demo;
};
