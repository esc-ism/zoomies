import {DEGREES} from '@/shared';
import {getText, getCode, getButton} from '../../shared';

import Demo from './demo';

export const badTweens = {};

for (const [type, value, ease] of [
	['ratio', 0.6],
	['position', 0.5],
	['rotation', -4.467],
	['zoom', 2],
]) {
	badTweens[type] = [type, value, ease];
}

export default (wrapper) => {
	const demo = new Demo();
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h2',
				content: 'Naive Rotation',
			},
			[
				'Now that we\'re considering rotation, how exactly do we want our system to behave?',
				'There are many approaches, some more effective than others.',
				'Here, I\'ll again start with the most simple.',
			],
			[
				'This demo has pan-limit points travel from the image\'s center directly towards their corresponding corners.',
				'Again, corners are kept at the edge of the viewport where possible.',
			],
			[
				'You\'ll find that this system works ',
				getButton('perfectly', demo, [
					() => ['ratio', demo.ratioViewport],
					() => ['rotation', demo.rotation - DEGREES[180] + 0.001, {duration: 4, delay: '>'}],
					() => ['zoom', demo.zoom * 2, {duration: 2, ease: 'power3.inOut', yoyo: true, repeat: 1, delay: '<'}],
					['position', {x: -0.5, y: 0.5}],
				]),
				' if the viewport and image share an aspect ratio.',
				'The system\'s flaw is only revealed when the ratios are ',
				getButton('decoupled', demo, [badTweens.ratio]),
				'.',
			],
			[
				'Consider ',
				getButton('this', demo, Object.values(badTweens)),
				' demo state.',
				'Imagine that you want to see the entirety of the image\'s top-right corner.',
				'You\'ll find that it\'s ',
				getButton('impossible', demo, [
					...Object.values(badTweens),
					['position', {x: 0.5, y: 0.1}, {delay: '>'}],
				]),
				' to achieve this without ',
				getButton('rotating', demo, [...Object.values(badTweens), ['rotation', Math.round(badTweens.rotation[1] / DEGREES[90]) * DEGREES[90], {delay: '>'}]]),
				' or ',
				getButton('zooming', demo, [...Object.values(badTweens), ['zoom', 1, {delay: '>'}]]),
				' out past the point that pan limits become one-dimensional.',
			],
			[
				'This laissez-faire approach to pan limit point expansion doesn\'t work.',
				'An improved system will require more deliberate placement of image corners on viewport edges.',
			],
		),
	);
};
