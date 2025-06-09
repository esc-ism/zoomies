import {getText, getCode, getButton} from '../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	wrapper.append(
		demo.element,
		getText(
			{
				tag: 'h2',
				content: 'Why Limit Panning?',
			},
			{
				content: [
					'First thing\'s first: why is pan-limiting necessary?',
					'Well, that question would be easy to answer if we had an image that allows unbound panning...',
				],
			},
			{content: 'Fortunately, that\'s what we see to our left!'},
			{
				content: [
					'This is our first pan-limiting demonstration.',
					'This particular demonstration neglects to limit panning.',
					'Try it out!',
				],
			},
			getCode(
				// https://www.tablesgenerator.com/text_tables
				'╔══════════════╦══════╦════════╦══════════╦═══════╗',
				'║              ║ Pan  ║ Rotate ║ Snap Pan ║ Reset ║',
				'╠══════════════╬══════╬════════╬══════════╬═══════╣',
				'║ Mouse Button ║ Left ║ Right  ║ Left     ║ Right ║',
				'╠══════════════╬══════╬════════╬══════════╬═══════╣',
				'║ Action       ║ Drag ║ Click  ║ Drag     ║ Click ║',
				'╚══════════════╩══════╩════════╩══════════╩═══════╝',
			),
			{
				content: [
					'A sensible user of this system may ',
					getButton(
						'self-impose', demo,
						['zoom', 1],
						['position', 0.2],
						['position', {x: 0.3, y: -0.2}, {delay: '>'}],
						['position', {x: -0.2, y: -0.3}, {delay: '>'}],
						['position', {x: -0.4, y: 0.2}, {delay: '>'}],
					),
					' a pan-limiting algorithm to keep their bearings.',
					'But what if their ',
					getButton(
						'finger slips',
						demo,
						['position', 2],
						['zoom', 1],
					),
					'?',
				],
			},
			{
				content: [
					'You can imagine how someone might slide away from the image and become lost in the void.',
					'Pan-limiting systems prevent this by keeping users from the no man\'s land beyond the confines of the image.',
				],
			},
		),
	);
};
