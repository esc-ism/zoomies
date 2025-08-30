import {DEGREES, xmlns} from '@/shared';
import {CLASS_MATH, CLASS_MATH_EQUATION} from '../consts';

import {register as registerFunctions} from '../code';
import {getText, getCode, getButton, registerDemo} from '../shared';
import {getSnapPosition} from '../center';

import Demo from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	registerFunctions(demo);
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h1',
				content: 'Viewport Edge',
				style: {textAlign: 'center'},
			},
			[
				'To solve this snap panning problem, we need a pan-limiting system that\'s affected by the viewport\'s dimensions.',
				'To keep things simple, let\'s avoid considering rotation for now.',
			],
			[
				'When possible, our new system keeps the viewport wholly within the image.',
				'Panning is prevented along axes where the viewport is ',
				getButton('larger', [
					[{rotation: DEGREES[90], zoom: 0.8}],
				]),
				' than the image.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			[
				'Notice that the viewport\'s dimensions half as zoom ',
				getButton('doubles', [
					[{position: 0.5}],
					() => [{zoom: demo.zoom * 2}],
				]),
				'.',
				'This reciprocal relationship between zoom and viewport size gives the following calculation for pan limits along the x & y axes:',
			],
			getCode([
				{op: '=', id: 'boundX', type: 'x', and: {
					op: '?', multiline: true, and: [
						{op: '>=', and: [
							{op: '/', and: ['viewportWidth', 'zoom']},
							'imageWidth',
						]},
						0,
						{op: '-', and: [0.5, {op: '/', and: ['½viewportWidth', 'zoom', 'imageWidth']}]},
					],
				}},
				'',
				{op: '=', id: 'boundY', type: 'y', and: {
					op: '?', multiline: true, and: [
						{op: '>=', and: [
							{op: '/', and: ['viewportHeight', 'zoom']},
							'imageHeight',
						]},
						0,
						{op: '-', and: [0.5, {op: '/', and: ['½viewportHeight', 'zoom', 'imageHeight']}]},
					],
				}},
			]),
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			[
				'Snap panning now requires an accommodating zoom adjustment.',
				'We can derive the calculation by solving the pan limiting calculation for zoom.',
			],
			{tag: 'p', classList: [CLASS_MATH], content: [
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', classList: [CLASS_MATH_EQUATION], xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'r'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mn', xmlns, content: '½'},
										{tag: 'mi', xmlns, content: 'viewportSize'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'imageSize'},
									]},
								]},
							]},
						]},
					]},
				]},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', classList: [CLASS_MATH_EQUATION], xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '0.5'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'r'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'zoom'},
									]},
								]},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: '|position|'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '0.5'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mi', xmlns, content: '|position|'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'r'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'zoom'},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'zoom'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mn', xmlns, content: '0.5'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mi', xmlns, content: '|position|'},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'r'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'zoom'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mi', xmlns, content: 'r'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mn', xmlns, content: '0.5'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: '|position|'},
									]},
								]},
							]},
						]},
					]},
				]},
			]},
			getCode([
				{op: '=', id: 'zoomX', type: 'zoom', and: {
					op: '/', and: ['½viewportWidth', 'imageWidth', {op: '-', and: [0.5, {op: 'abs', and: 'x'}]}],
				}},
				{op: '=', id: 'zoomY', type: 'zoom', and: {
					op: '/', and: ['½viewportHeight', 'imageHeight', {op: '-', and: [0.5, {op: 'abs', and: 'y'}]}],
				}},
				'',
				{op: '=', id: 'snapZoom', type: 'zoom', and: {
					op: 'max', and: ['zoomX', 'zoomY'],
				}},
			]),
			{
				tag: 'h2',
				content: 'Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'Zoom is now adjusted for us automatically when ',
				getButton('snap panning', [
					[{position: 0.5, zoom: 2}, {duration: 0}],
				]),
				'.',
				'Position will even be ',
				getButton('corrected', [
					[{ratio: 1, position: 0.5}, {duration: 0}],
					[{zoom: 1.5}, {position: 0}],
					[{ratio: 2}],
				]),
				' if aspect ratios change!',
			],
			[
				'This is the perfect system for images that can\'t be rotated, but it ',
				getButton('fails', [
					(position) => [{position}, {duration: 0}],
					[{zoom: 2}],
					[{rotation: DEGREES[90] - 0.2}, {duration: 0.5}],
					({x, y}) => [{position: {x: x - 0.05, y: y - 0.05}}, {ease: 'power1.inOut', duration: 0.2, delay: 0.6}],
					(position) => [{position}, {ease: 'bounce.out', duration: 0.4, delay: 0.1}],
				], {doReset: true, getParam: () => getSnapPosition(demo)}),
				' when rotation is introduced.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'From now on, we\'ll only be looking at systems built for rotation.',
				'Those systems will build on this one, taking various approaches to replicating and improving its behaviour.',
			],
		),
	);
	
	return demo;
};
