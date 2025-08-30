import Demo from './demo';
import SHARED_FUNCTIONS from '../code';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';

import {DEGREES, ERROR_ALLOWANCE, xmlns} from '@/shared';
import {CLASS_MATH, CLASS_MATH_EQUATION} from '../../consts';

export const badTweens = {
	ratio: 0.6,
	position: 0.5,
	rotation: -4.467,
	zoom: 2,
};

const opSpace = {tag: 'mspace', style: {width: '0.8em'}, xmlns};
const getOverlined = (content) => ({
	tag: 'mrow', xmlns, style: {textDecoration: 'overline', textDecorationThickness: '1px'}, content: content.split('').map((content) => ({
		tag: 'mi', xmlns, content,
	})),
});

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getBound', args: ['cornerX', 'cornerY', 'cornerZoom'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '<=', and: [
				'zoom',
				'cornerZoom',
			]},
			{op: 'return', and: [0, 0]},
		]},
		{op: '=', id: 'progress', and: {
			op: '/', and: [
				'zoom',
				'cornerZoom',
			],
		}},
		'',
		{op: 'return', and: [
			{op: '-', and: [
				'cornerX',
				{op: '/', and: [
					'cornerX',
					'progress',
				]},
			]},
			{op: '-', and: [
				'cornerY',
				{op: '/', and: [
					'cornerY',
					'progress',
				]},
			]},
		]},
	]},
	{op: 'func', id: 'getSnippedStart', args: ['cornerX', 'cornerY', 'cornerZoom', 'otherZoom'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '>=', and: ['cornerZoom', 'otherZoom']},
			{op: 'return', and: [0, 0]},
		]},
		'',
		{op: '=', id: 'proportion', and: {
			op: '-', and: [
				1,
				{op: '/', and: [
					'cornerZoom',
					'otherZoom',
				]},
			],
		}},
		'',
		{op: 'return', and: [
			{op: '*', and: [
				'proportion',
				'cornerX',
			]},
			{op: '*', and: [
				'proportion',
				'cornerY',
			]},
		]},
	]},
	{op: 'func', id: 'getCorners', type: ['x', 'y', 'x', 'y'], pair: [1, 0, 3, 2], and: [
		{op: 'if', and: [
			{op: '<=', and: [
				{op: '-', and: 'x'},
				'y',
			]},
			{op: 'if', and: [
				{op: '<=', and: [
					'x',
					'y',
				]},
				{op: 'return', and: [-0.5, 0.5, 0.5, 0.5]},
			]},
			{op: 'return', and: [0.5, -0.5, 0.5, 0.5]},
		]},
		{op: 'if', and: [
			{op: '<=', and: [
				'x',
				'y',
			]},
			{op: 'return', and: [-0.5, 0.5, -0.5, -0.5]},
		]},
		{op: 'return', and: [0.5, -0.5, -0.5, -0.5]},
	]},
	{op: 'func', id: 'getStartZooms', type: ['zoom', 'zoom'], and: [
		{op: '=', id: ['topLeftX', 'topLeftY', 'topRightX', 'topRightY'], type: ['zoom', 'zoom', 'zoom', 'zoom'], and: {
			op: 'call', id: 'getAllStartZooms',
		}},
		'',
		{op: 'return', multiline: true, and: [
			{op: 'min', and: [
				'topLeftX',
				'topLeftY',
			]},
			{op: 'min', and: [
				'topRightX',
				'topRightY',
			]},
		]},
	]},
];

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	registerFunctions(demo, functions);
	
	wrapper.append(
		demo.element,
		getText(
			{
				tag: 'h1',
				content: 'Single-Line Rotation',
				style: {textAlign: 'center'},
			},
			[
				'Because the last system was so simple, it\'s obvious that there\'s no way to improve its behaviour for un-rotated images.',
				'This won\'t be case for rotated images;',
				'there are myriad approaches to pan-limiting, some more effective than others, but no clear "perfect" solution.',
				'Here, I\'ll again start with the most simple.',
			],
			[
				'This demo has pan-limit points travel from the image\'s center directly towards their corresponding corners.',
				'Again, corners are kept at the edge of the viewport where possible.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			[
				'The maths here aren\'t yet too esoteric.',
				'First, I calculate the maximum zoom at which corners are visible from the origin.',
				'Adjacent corners can have different values but opposite corners are always equivalent.',
				'Knowing this, I only need to calculate a zoom for the top-left and top-right corners.',
				[
					'Note that the "rotation" value\'s unit is ', {
						tag: 'a',
						content: 'radians',
						href: 'https://en.wikipedia.org/wiki/Radian',
					},
					' and has a default value of ',
					{tag: 'math', xmlns, content: [
						{tag: 'mn', xmlns, content: '½'},
						{tag: 'mi', xmlns, content: 'π'},
					]},
					'.',
				],
				'Given these zoom values, we can derive pan limits from the user\'s zoom level.',
			],
			getCode([
				{op: '=', id: ['topLeftZoom', 'topRightZoom'], and: {
					op: 'call', id: 'getStartZooms',
				}},
				'',
				{op: '=', id: ['topLeftX', 'topLeftY'], and: {
					op: 'call', id: 'getBound', and: [-0.5, 0.5, 'topLeftZoom'],
				}},
				'',
				{op: '=', id: 'bottomRightX', ref: 'topLeftX', pair: 'bottomRightY', and: {
					op: '-', and: 'topLeftX',
				}},
				{op: '=', id: 'bottomRightY', ref: 'topLeftY', pair: 'bottomRightX', and: {
					op: '-', and: 'topLeftY',
				}},
				'',
				{op: '=', id: ['topRightX', 'topRightY'], and: {
					op: 'call', id: 'getBound', and: [0.5, 0.5, 'topRightZoom'],
				}},
				'',
				{op: '=', id: 'bottomLeftX', ref: 'topRightX', pair: 'bottomLeftY', and: {
					op: '-', and: 'topRightX',
				}},
				{op: '=', id: 'bottomLeftY', ref: 'topRightY', pair: 'bottomLeftX', and: {
					op: '-', and: 'topRightY',
				}},
			]),
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'You\'ll find that this system works ',
				getButton('perfectly', [
					() => [{ratio: demo.ratioViewport, position: {x: -0.5, y: 0.5}}],
					() => [{rotation: demo.rotation - DEGREES[180] + ERROR_ALLOWANCE}, {duration: 4}],
					() => [{zoom: demo.zoom * 2}, {duration: 2, ease: 'power3.inOut', yoyo: true, repeat: 1, position: '<'}],
				]),
				' if the viewport and image share an aspect ratio.',
				'The system\'s flaw is only revealed when the ratios are ',
				getButton('decoupled', [[{ratio: badTweens.ratio}]]),
				'.',
			],
			[
				'Consider ',
				getButton('this', [[badTweens]]),
				' demo state.',
				'Imagine that you want to see the entirety of the image\'s top-right corner.',
				'You\'ll find that it\'s ',
				getButton('impossible', [
					[badTweens],
					[{position: {x: 0.5, y: 0.1}}],
				]),
				' to achieve this without ',
				getButton('rotating', [
					[badTweens],
					[{rotation: Math.round(badTweens.rotation / DEGREES[90]) * DEGREES[90]}],
				]),
				' or ',
				getButton('zooming', [
					[badTweens],
					[{zoom: 1}],
				]),
				' out past the point that pan limits become one-dimensional.',
			],
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			'The maths for snap panning will take a little longer to run through.',
			[
				'First, I split the image into four segments using lines from the origin to each corner.',
				'The snap position will fall into one of these segments; I disregard the two lines that don\'t contribute to the position\'s segment.',
				'If the zoom value that I\'ve calculated for one of the relevant corners is lower than the other, I snip off the start of its line.',
			],
			getCode([
				{op: '=', id: ['toX0', 'toY0', 'toX1', 'toY1'], and: {
					op: 'call', id: 'getCorners',
				}},
				'',
				{op: '=', id: ['fromX0', 'fromY0'], and: {
					op: 'call', id: 'getSnippedStart', and: [
						'toX0',
						'toY0',
						'topLeftZoom',
						'topRightZoom',
					],
				}},
				{op: '=', id: ['fromX1', 'fromY1'], and: {
					op: 'call', id: 'getSnippedStart', and: [
						'toX1',
						'toY1',
						'topRightZoom',
						'topLeftZoom',
					],
				}},
			]),
			[
				'The resulting start position is where the corner\'s bound would lie at the other corner\'s zoom.',
				'From here, I need to find a line that intersects the snap point and ',
				{
					tag: 'a',
					href: 'https://math.stackexchange.com/questions/2223691/intersect-2-lines-at-the-same-ratio-through-a-point',
					content: 'both lines at the same ratio',
				},
				'.',
				'Solving this requires the ',
				{
					tag: 'a',
					href: 'https://en.wikipedia.org/wiki/Linear_interpolation',
					content: 'linear interpolation',
				},
				' formula, replacing slope with a variable (r) to be solved.',
			],
			{tag: 'p', classList: [CLASS_MATH], content: [
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'intersect'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'start'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 'r'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'end'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'start'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'intersect'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'start'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 'r'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'end'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'start'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
					]},
				]},
			]},
			[
				'We can use the point as a separator, splitting the intersecting line into two smaller lines.',
				'Knowing that these sub-lines must share a gradient, we can use ',
				{tag: 'span', content: '"m = dY / dX"', style: {whiteSpace: 'nowrap'}},
				' to write the equation we\'re trying to solve.',
			],
			{tag: 'p', classList: [CLASS_MATH], content: [
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'let the lines be '},
							]},
							{tag: 'mtd', xmlns, content: [
								getOverlined('AB'),
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: ' and '},
							]},
							{tag: 'mtd', xmlns, content: [
								getOverlined('CD'),
							]},
						]},
					]},
				]},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'E'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 'r'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mtd', xmlns, content: opSpace},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'F'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 'r'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'E'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 'r'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
							{tag: 'mtd', xmlns, content: opSpace},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'F'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 'r'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
					]},
				]},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'E'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'E'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'x'},
									]},
								]},
							]},
							{tag: 'mtd', xmlns, content: {
								tag: 'mo', xmlns, content: '=',
							}},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'F'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'F'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'x'},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 'r'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'B'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: ')'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 'r'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'B'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: ')'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
								]},
							]},
							{tag: 'mtd', xmlns, content: {
								tag: 'mo', xmlns, content: '=',
							}},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 'r'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'D'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mi', xmlns, content: 'y'},
										]},
										{tag: 'mo', xmlns, content: ')'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 'r'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'D'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mi', xmlns, content: 'x'},
										]},
										{tag: 'mo', xmlns, content: ')'},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'y'},
									]},
								]},
							]},
						]},
					]},
				]},
				{tag: 'div', content: '...'},
				{tag: 'math', xmlns, content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mn', xmlns, content: '0'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '='},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msup', xmlns, content: [
									{tag: 'mi', xmlns, content: 'r'},
									{tag: 'mn', xmlns, content: '2'},
								]},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'B'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns},
							{tag: 'mtd', xmlns},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '+'},
								opSpace,
								{tag: 'mi', xmlns, content: 'r'},
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mtable', xmlns, content: [
										{tag: 'mtr', xmlns, content: [
											{tag: 'mtd', xmlns, content: [
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'B'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mi', xmlns, content: 'x'},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'D'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'D'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mi', xmlns, content: 'x'},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'mn', xmlns, content: '2'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'B'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mi', xmlns, content: 'y'},
												{tag: 'mo', xmlns, content: '+'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mi', xmlns, content: 'y'},
											]},
										]},
										{tag: 'mtr', xmlns, content: [
											{tag: 'mtd', xmlns, content: [
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'D'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mi', xmlns, content: 'y'},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'D'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'B'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mi', xmlns, content: 'x'},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'mn', xmlns, content: '2'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mi', xmlns, content: 'x'},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'B'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'C'},
													{tag: 'mi', xmlns, content: 'y'},
												]},
												{tag: 'mo', xmlns, content: '-'},
												{tag: 'msub', xmlns, content: [
													{tag: 'mi', xmlns, content: 'A'},
													{tag: 'mi', xmlns, content: 'x'},
												]},
												{tag: 'mi', xmlns, content: 'y'},
											]},
										]},
									]},
								]},
								{tag: 'mo', xmlns, stretchy: 'true', content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns},
							{tag: 'mtd', xmlns},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '+'},
								opSpace,
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mi', xmlns, content: 'y'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'mi', xmlns, content: 'y'},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'x'},
								]},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mi', xmlns, content: 'y'},
								]},
							]},
						]},
					]},
				]},
			]},
			[
				'We end up with a quadratic expression and solve it with the ',
				{tag: 'a', content: 'quadratic formula', href: 'https://en.wikipedia.org/wiki/Quadratic_formula'},
				' to find our ratio.',
				'From here, it\'s a simple calculation using the highZoom value from earlier to find our final snap zoom.',
			],
			getCode([
				{op: '=', id: 'ratio', and: {
					op: 'call', id: 'getIntersectRatio', and: [
						'fromX0',
						'fromY0',
						'toX0',
						'toY0',
						'fromX1',
						'fromY1',
						'toX1',
						'toY1',
						{op: '!=', and: ['toY0', 'toY1']},
					],
				}},
				'',
				{op: '=', id: 'snapZoom', type: 'zoom', and: {
					op: '/', and: [
						{op: 'max', and: ['topLeftZoom', 'topRightZoom']},
						{op: '-', and: [
							1,
							'ratio',
						]},
					],
				}},
			]),
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'Okay! So how does the system perform as a medium for snap-panning?',
				'Again, it\'s perfect until we decouple aspect ratios.',
				'Specifically, consider ',
				getButton('this', [
					[{ratio: 0.5, rotation: DEGREES[90], position: 0, zoom: 1}],
					[{y: 0.25, zoom: 2}, {duration: 0}],
				]),
				' snap pan.',
				'It doesn\'t make much sense to show the empty space above the image here. ',
				getButton('Increasing', [
					[{ratio: 0.25, rotation: DEGREES[90], position: {x: 0, y: 0.25}, zoom: 2}],
				]),
				' the differential makes it even less sensible, with empty space appearing below too.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'This laissez-faire approach to pan limit point expansion doesn\'t work.',
				'An improved system will require more deliberate placement of image corners on viewport edges.',
			],
		),
	);
	
	return demo;
};
