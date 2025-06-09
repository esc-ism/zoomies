import gsap from 'gsap';

import {DEGREES} from '@/shared';
import {WEIGHTS} from '@/demo';
import {getText, getCode} from '../../shared';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	const badWidth = 0.6;
	
	const setBadState = () => {
		demo.position.x = 0.5;
		demo.position.y = 0.5;
		demo.rotation = -4.467;
		demo.zoom = Math.max(1, demo.zoom);
		
		demo.setWidth(badWidth);
		
		demo.applyZoom();
		demo.applyRotation();
	};
	
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
				{
					tag: 'button',
					content: 'perfectly',
					onclick: () => {
						demo.setWidth(1);
						
						const {rotation} = demo;
						
						demo.rotation += DEGREES[360];
						
						const duration = 6;
						
						demo.doTween(
							true,
							['rotation', rotation, {duration, ease: 'none'}],
							['zoom', demo.zoom * 2, {duration: duration / 2, ease: 'power3.inOut', yoyo: true, repeat: 1}],
						);
					},
				},
				' if the viewport and image share an aspect ratio.',
				'The system\'s flaw is only revealed when the ratios are ',
				{
					tag: 'button',
					content: 'decoupled',
					onclick: () => {
						demo.setWidth(badWidth, true);
					},
				},
				'.',
			],
			[
				'Consider ',
				{
					tag: 'button',
					content: 'this',
					onclick: setBadState,
				},
				' demo state.',
				'Imagine that you want to see the entirety of the image\'s top-right corner.',
				'You\'ll find that it\'s impossible to achieve this without ',
				{
					tag: 'button',
					content: 'rotating',
					onclick: () => {
						setBadState();
						
						demo.doTween(true, ['rotation', -4, {duration: 1, ease: 'power1.inOut'}]);
					},
				},
				' or ',
				{
					tag: 'button',
					content: 'zooming',
					onclick: () => {
						setBadState();
						
						demo.doTween(true, ['zoom', 0.6, {duration: 1, ease: 'power1.inOut'}]);
					},
				},
				' far out.',
			],
		),
	);
};
