import {DEGREES, xmlns} from '@/shared';
import {CLASS_MATH} from '../consts';

import {getText, getButton, registerDemo} from '../shared';

import Demo from './demo';

// top right corner with zoom=2
export const getSnapPosition = (demo) => ({
	x: 0.5 - demo.sizesViewport.width / demo.sizesImage.width / 4,
	y: 0.5 - demo.sizesViewport.height / demo.sizesImage.height / 4,
});

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	
	wrapper.append(
		demo.constructor.element,
		getText(
			{
				tag: 'h1',
				content: 'Viewport Center',
				style: {textAlign: 'center'},
			},
			[
				'Let\'s start ',
				getButton('limiting panning', [
					[{zoom: 1}],
					() => {
						const axis = Math.abs(demo.position.x) >= Math.abs(demo.position.y) ? 'x' : 'y';
						
						return [{[axis]: demo.position[axis] <= 0 ? 0.5 : -0.5}, {ease: 'bounce.out', duration: 1.5}];
					},
				]),
				'!',
				'Here, we have the simplest reasonable system, where the center of the viewport is bound by the image.',
				'The system may be described like:',
			],
			{tag: 'p', classList: [CLASS_MATH], content: [
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '-0.5'},
								{tag: 'mo', xmlns, content: '⩽'},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: '⩽'},
								{tag: 'mn', xmlns, content: '0.5'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '-0.5'},
								{tag: 'mo', xmlns, content: '⩽'},
								{tag: 'mi', xmlns, content: 'y'},
								{tag: 'mo', xmlns, content: '⩽'},
								{tag: 'mn', xmlns, content: '0.5'},
							]},
						]},
					]},
				]},
			]},
			{
				tag: 'h2',
				content: 'Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'Despite its simplicity, this system actually works wonderfully.',
				'In most cases, I think it\'s the best solution;',
				'its intuitive, unrestrictive pan limits provide an excellent user experience, and the code is hyper-efficient.',
				'The only real issue with this system is with snap-panning.',
			],
			[
				'Say we want to ',
				getButton('fill', [
					() => [{rotation: DEGREES[90], zoom: 2, position: getSnapPosition(demo)}],
				]),
				' our screens with the top-right quadrant of the image.',
				'We can ',
				getButton('snap-pan', [
					() => [{position: getSnapPosition(demo)}, {duration: 0}],
				]),
				' to the spot we want, but a ',
				getButton('manual zoom', [
					() => [{position: getSnapPosition(demo)}, {duration: 0}],
					[{rotation: DEGREES[90], zoom: 2}, {delay: 0.2}],
				]),
				' is necessary to achieve the desired view.',
				'It\'d be nice if an appropriate zoom could be applied automatically.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'This is a perfect pan-limiting system; it can\'t be improved without also making concessions.',
				'Its only shortcoming is its lousy snap-panning behaviour.',
			],
			[
				'We\'ll call this system\'s snap-panning "zoomless", as opposed to "zoomful".',
				'All future systems will have zoomful snap-panning.',
			],
			[
				'A sensible way to apply these systems is to pair this one with an upcoming system, using the other system solely for snap-pans.',
				'If your image can\'t be rotated, its ideal partner is the next system up.',
			],
		),
	);
	
	return demo;
};
