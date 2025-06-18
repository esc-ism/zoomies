import Demo from './demo';

import {DEGREES, ERROR_ALLOWANCE} from '@/shared';
import {getText, getCode, getButton} from '../../shared';

export const badTweens = {
	ratio: 0.6,
	position: 0.5,
	rotation: -4.467,
	zoom: 2,
};

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
					() => [{ratio: demo.ratioViewport, position: {x: -0.5, y: 0.5}}],
					() => [{rotation: demo.rotation - DEGREES[180] + ERROR_ALLOWANCE}, {duration: 4}],
					() => [{zoom: demo.zoom * 2}, {duration: 2, ease: 'power3.inOut', yoyo: true, repeat: 1, position: '<'}],
				]),
				' if the viewport and image share an aspect ratio.',
				'The system\'s flaw is only revealed when the ratios are ',
				getButton('decoupled', demo, [[{ratio: badTweens.ratio}]]),
				'.',
			],
			[
				'Consider ',
				getButton('this', demo, [[badTweens]]),
				' demo state.',
				'Imagine that you want to see the entirety of the image\'s top-right corner.',
				'You\'ll find that it\'s ',
				getButton('impossible', demo, [
					[badTweens],
					[{position: {x: 0.5, y: 0.1}}],
				]),
				' to achieve this without ',
				getButton('rotating', demo, [
					[badTweens],
					[{rotation: Math.round(badTweens.rotation / DEGREES[90]) * DEGREES[90]}],
				]),
				' or ',
				getButton('zooming', demo, [
					[badTweens],
					[{zoom: 1}],
				]),
				' out past the point that pan limits become one-dimensional.',
			],
			[
				'Okay, but how does the system perform for snap-panning?',
				'Again, it\'s perfect until we decouple aspect ratios.',
				'Specifically, consider ',
				getButton('this', demo, [
					[{ratio: 0.5, rotation: DEGREES[90], position: 0, zoom: 1}],
					[{y: 0.25, zoom: 2}, {duration: 0}],
				]),
				' snap pan.',
				'It doesn\'t make any sense to show the empty space above the image here.',
			],
			[
				'This laissez-faire approach to pan limit point expansion doesn\'t work.',
				'An improved system will require more deliberate placement of image corners on viewport edges.',
			],
		),
	);
	
	return demo;
};
