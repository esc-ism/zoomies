import {DEGREES} from '@/shared';
import {getText, getCode, getButton, getMath} from '../../shared';
import {cleanup, register as registerFunctions} from '../../code';
import * as mock from '../mock';
import {permissiveTweens, restrictiveTweens} from '../1line';
import {DOUBLE_LINE as SHARED_FUNCTIONS} from '../code';

import zoomImage from './zoomImage';
import snapImage from './snapImage';
import System, {getSnappedZoom} from './demo';
import getZoomPoints from './zoomPoints';
import {CLASS_MATH_ASSERTION, CLASS_MATH_EQUATION} from '@/pages/consts';
import {getOverlined, xmlns} from '@/pages/shared/math';

const code = [];

const getLimitedPosition = (limit = 0.4) => Math.max(-limit, Math.min(limit, Math.random() - 0.5));

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const getSnapVarGetter = (getRatio) => {
	const position = {x: getLimitedPosition(), y: getLimitedPosition()};
	const {zoomPoints, rotation, ratio} = getVarGetter(Math.random() * DEGREES[180], getRatio())();
	
	const zoom = getSnappedZoom(...zoomPoints, position);
	
	return {ratio, rotation, startZoom: Math.min(zoomPoints[0].z, zoomPoints[2].z), zoom, position};
};

const getSnapTweens = (getRatio) => [
	[
		({rotation, ratio, startZoom}) => [{rotation, ratio, zoom: startZoom, position: 0}],
		({position}) => [{position}],
		({zoom}) => [{zoom}, {duration: 0}],
	],
	{getParam: getSnapVarGetter.bind(null, getRatio)},
];

const getCornerProgressTweens = (rotation) => [
	[{ratio: 1, zoom: 1, position: 0.5}],
	[{rotation}, {delay: 0.2}],
];

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getIntersectSide', args: ['cornerAngle', 'progressAngle', 'quadrantAngle', 'isEvenQuadrant'], type: ['zoom', 'x', 'y'], pair: [, 2, 1], and: [
		{op: '=', id: 'lockAngle', type: 'angle', and: {
			op: '+', and: ['progressAngle', 'quadrantAngle'],
		}},
		'',
		{op: 'if', and: [
			{op: '<', and: ['lockAngle', 'cornerAngle']},
			{op: '=', id: ['intersectZoom', 'intersectY'], and: {
				op: 'call', id: 'getYIntersect', and: ['½viewportWidth', 'lockAngle', 'progressAngle'],
			}},
			'',
			{op: 'return', and: {op: 'array', and: ['intersectZoom', 0, 'intersectY']}},
		]},
		'',
		{op: '=', id: ['intersectZoom', 'intersectX'], and: {
			op: 'call', id: 'getXIntersect', and: ['½viewportWidth', {op: '-', and: ['½π', 'quadrantAngle', 'progressAngle']}, 'progressAngle'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			'intersectZoom',
			{op: '?', and: ['isEvenQuadrant', {op: '-', and: 'intersectX'}, 'intersectX']},
			0,
		]}},
	]},
	{op: 'func', id: 'getIntersectBase', args: ['cornerAngle', 'progressAngle', 'quadrantAngle', 'isEvenQuadrant'], type: ['zoom', 'x', 'y'], pair: [, 2, 1], and: [
		{op: '=', id: 'lockAngle', type: 'angle', and: {
			op: '-', and: ['½π', 'quadrantAngle', 'progressAngle'],
		}},
		'',
		{op: 'if', and: [
			{op: '<', and: ['lockAngle', 'cornerAngle']},
			{op: '=', id: ['intersectZoom', 'intersectY'], and: {
				op: 'call', id: 'getYIntersect', and: ['½viewportHeight', 'lockAngle', 'progressAngle'],
			}},
			'',
			{op: 'return', and: {op: 'array', and: ['intersectZoom', 0, 'intersectY']}},
		]},
		'',
		{op: '=', id: ['intersectZoom', 'intersectX'], and: {
			op: 'call', id: 'getXIntersect', and: ['½viewportHeight', {op: '+', and: ['progressAngle', 'quadrantAngle']}, 'progressAngle'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			'intersectZoom',
			{op: '?', and: ['isEvenQuadrant', 'intersectX', {op: '-', and: 'intersectX'}]},
			0,
		]}},
	]},
	// todo rename all the "first, second, third" stuff to "origin, connector, lock"
	{op: 'func', id: 'getFirstEnd', args: ['firstZoom', 'secondZoom', 'secondX', 'secondY'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '==', and: ['secondY', 0]},
			{op: 'return', and: {op: 'array', and: [
				{op: '/', and: [
					'secondX',
					{op: '-', and: [1, {op: '/', and: ['firstZoom', 'secondZoom']}]},
				]},
				0,
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', and: [
			0,
			{op: '/', and: [
				'secondY',
				{op: '-', and: [1, {op: '/', and: ['firstZoom', 'secondZoom']}]},
			]},
		]}},
	]},
	{op: 'func', id: 'getZoomPoints', type: ['zoom', 'x', 'y', 'zoom', 'xvp', 'yvp', 'zoom', 'x', 'y', 'zoom', 'xvp', 'yvp'], pair: [,2, 1,,5, 4,,8, 7,,11, 10], multilineResult: 2, and: [
		{op: '=', id: ['zoomSide', 'zoomBase'], and: {
			op: 'call', id: 'getStartZooms',
		}},
		'',
		{op: '=', id: 'isEvenQuadrant', and: {
			op: '!=', and: [
				{op: '%', and: [
					{op: 'floor', and: {
						op: '/', and: ['rotation', '½π'],
					}},
					2,
				]},
				0,
			],
		}},
		{op: '=', id: 'quadrantAngle', type: 'angle', and: {
			op: 'call', id: 'getQuadrantAngle', and: ['isEvenQuadrant'],
		}},
		'',
		{op: '=', id: ['angleSide', 'angleBase'], and: {
			op: 'call', id: 'getProgressAngles', and: ['quadrantAngle'],
		}},
		'',
		{op: '=', id: 'cornerAngle', type: 'angle', and: {
			op: 'atan', and: {
				op: '/', and: ['imageHeight', 'imageWidth'],
			},
		}},
		'',
		{op: '=', id: ['intersectSideZoom', 'intersectSideX', 'intersectSideY'], and: {
			op: 'call', id: 'getIntersectSide', and: [
				'cornerAngle',
				'angleSide',
				'quadrantAngle',
				'isEvenQuadrant',
			],
		}},
		{op: '=', id: ['intersectBaseZoom', 'intersectBaseX', 'intersectBaseY'], and: {
			op: 'call', id: 'getIntersectBase', and: [
				'cornerAngle',
				'angleBase',
				'quadrantAngle',
				'isEvenQuadrant',
			],
		}},
		'',
		{op: '=', id: ['endXSide', 'endYSide'], and: {
			op: 'call', id: 'getFirstEnd', and: [
				'zoomSide', 'intersectSideZoom', 'intersectSideX', 'intersectSideY',
			],
		}},
		{op: '=', id: ['endXBase', 'endYBase'], and: {
			op: 'call', id: 'getFirstEnd', and: [
				'zoomBase', 'intersectBaseZoom', 'intersectBaseX', 'intersectBaseY',
			],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: {op: 'array', multiline: 2, and: [
				'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'endXSide', 'endYSide',
				'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'endXBase', 'endYBase',
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: 2, and: [
			'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'endXBase', 'endYBase',
			'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'endXSide', 'endYSide',
		]}},
	]},
	{op: 'func', id: 'isBelow', args: ['secondX', 'secondY', 'cornerX', 'cornerY'], and: [
		{op: '=', id: 'm', and: {
			op: '/', and: [
				{op: '-', and: ['cornerY', 'secondY']},
				{op: '-', and: ['cornerX', 'secondX']},
			],
		}},
		'',
		{op: '=', id: 'c', and: {
			op: '-', and: ['secondY', {op: '*', and: ['m', 'secondX']}],
		}},
		'',
		{op: 'return', and: {
			op: '<', and: [
				'y',
				{op: '+', and: [{op: '*', and: ['m', 'x']}, 'c']},
			],
		}},
	]},
	{op: 'func', id: 'getQuadrant', and: [
		{op: 'if', and: [
			{op: '>', and: ['x', 0]},
			{op: 'if', and: [
				{op: '>', and: ['y', 0]},
				{op: 'return', and: {op: 'array', and: [
					{op: 'call', id: 'isBelow', and: ['x1', 'y1', 0.5, 0.5]},
					false,
				]}},
			]},
			'',
			{op: 'return', and: {op: 'array', and: [
				true,
				{op: 'call', id: 'isBelow', and: [{op: '-', and: 'x0'}, {op: '-', and: 'y0'}, 0.5, -0.5]},
			]}},
		]},
		'',
		{op: 'if', and: [
			{op: '>', and: ['y', 0]},
			{op: 'return', and: {op: 'array', and: [
				false,
				{op: 'call', id: 'isBelow', and: ['x0', 'y0', -0.5, 0.5]},
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: 'call', id: 'isBelow', and: [{op: '-', and: 'x1'}, {op: '-', and: 'y1'}, -0.5, -0.5]},
			true,
		]}},
	]},
];

let getTraceVars;

export default {
	System,
	start() {
		getTraceVars = getVarGetter(DEGREES[90] - 0.4, 0.75);
		
		registerFunctions(functions);
		
		for (const {start} of code) {
			start();
		}
	},
	end() {
		cleanup();
		
		for (const {end} of code) {
			end();
		}
	},
	text: getText(
		{
			tag: 'h1',
			content: 'Double-Line Rotation',
			style: {textAlign: 'center'},
		},
		[
			'In the prior system, there were two playground states that revealed issues.',
			'Let\'s start by seeing how they look here.',
		],
		[
			'First, the ',
			getButton('state', [[restrictiveTweens]]),
			' that was too restrictive is way better!',
			'The "Viewport Center" system gives users much more viewfinding flexibility, but in most situations this is good enough.',
			'The overly permissive ',
			getButton('state', [[permissiveTweens]]),
			' is also fixed, accurately replicating the behaviour of the "Viewport Edge" system.',
		],
		[
			'In the "Single-Line" system, we had no control over rail gradients; they would always be 1 or -1.',
			'This kept us from choosing lock points.',
			'Multi-line rails allow us to choose whatever gradients we want, providing much more flexibility.',
		],
		[
			'This system places each lock point on a different viewport edge.',
			'A point\'s distance along its edge is based on rotation angle.',
			'For example, it lies on the expected viewport corners at ',
			getButton('0°', getCornerProgressTweens(DEGREES[90])),
			' and ',
			getButton('90°', getCornerProgressTweens(0)),
			' and travels linearly between them for ',
			getButton('intermediate angles', [
				...getCornerProgressTweens(DEGREES[90]),
				[{rotation: 0}, {ease: 'none', duration: 3}],
			]),
			'.',
		],
		[
			'Now that we\'re messing with rail gradients, we need another rail segment to connect back to the origin.',
			'I\'ll call rail segments that determine lock points "lock rails" and the other segments "origin rails".',
		],
		[
			'In this system, ',
			getButton('origin rails', [
				({rotation, ratio, first}) => [{position: 0, ratio, rotation, zoom: first.z}],
				[{position: 0.5}, {delay: 0.5}],
				({second}) => [{zoom: second.z}, {duration: 3, position: '<'}],
			], {getParam: () => getTraceVars()}),
			'  follow image axes until they intersect ',
			getButton('lock rails', [
				({rotation, ratio, second}) => [{position: second, ratio, rotation, zoom: second.z}],
				[{position: 0.5}, {delay: 0.5}],
				({second}) => [{zoom: second.z * 2}, {duration: 3, position: '<'}],
			], {getParam: () => getTraceVars()}),
			'.',
			'Origin rails follow whichever axis minimises lock rail length.',
		],
		{
			tag: 'h2',
			content: 'Pan-Limit Maths',
			style: {textAlign: 'center'},
		},
		[
			'Each lock point must be on a different viewport edge, and adjacent corners will have lock points on adjacent edges.',
			'Since we\'re focusing on the top-left and top-right image corners, we can say that one will be a "side" (left or right viewport edge) corner and the other a "base" (top or bottom viewport edge) corner.',
			'This assignment will be based off rotation, with corners alternating between "base" and "side" every 90°.',
		],
		// todo define "lock angle"
		[
			'Like origin rail start zooms, lock rails are found through trigonometry.',
			'There are four kinds of lock rail;',
			'they can start from either axis and end at either a side or base corner.',
			'Each of the four variations has slightly different formulae, but they all present similar problems with similar solutions.',
			'Demonstrated below is an x-axis, base corner problem, where ',
			{tag: 'math', xmlns, style: {fontSize: '0.8em'}, content: getOverlined('AC')},
			' is the lock rail.',
			'The diagram is used to derive start zoom and start position formulae.',
		],
		{
			tag: 'div',
			content: zoomImage,
			style: {textAlign: 'center'},
		},
		getMath(
			{
				title: 'Variables',
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_ASSERTION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the lock rail start from'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'mn', xmlns, content: '0'},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let the target start zoom be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'z'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let half of the image\'s width be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let half of the image\'s height be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'let half of the viewport\'s height at default zoom be'},
							]},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'v'},
							]},
						]},
					]},
				],
			},
			{
				title: 'Declarations',
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'A'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'mn', xmlns, content: '0'},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'B'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'mi', xmlns, content: 'x'},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'C'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '('},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
								{tag: 'mo', xmlns, content: ', '},
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
								{tag: 'mo', xmlns, content: ')'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'θ'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'div', content: 'the image\'s angle of rotation'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'α'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mtext', xmlns, content: 'the desired lock rail angle'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '∠'},
								{tag: 'mi', xmlns, content: 'B'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'C'},
							]},
							{tag: 'mtext', xmlns, content: 'is'},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'θ'},
								{tag: 'mo', xmlns, content: '+'},
								{tag: 'mi', xmlns, content: 'α'},
							]},
						]},
					]},
				],
			},
			{
				title: 'Inferences',
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mo', xmlns, content: '|'},
								{tag: 'mi', xmlns, content: 'A'},
								{tag: 'mi', xmlns, content: 'C'},
								{tag: 'mo', xmlns, content: '|'},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'B'},
										{tag: 'mo', xmlns, content: '|'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'mo', xmlns, content: '∠'},
										{tag: 'mi', xmlns, content: 'B'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'C'},
										{tag: 'mo', xmlns, content: ')'},
									]},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'i'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'mi', xmlns, content: 'θ'},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 'α'},
										{tag: 'mo', xmlns, content: ')'},
									]},
								]},
							]},
						]},
					]},
				],
			},
			{
				title: {tag: 'mi', xmlns, content: 'z'},
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'α'},
									{tag: 'mo', xmlns, content: ')'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'D'},
										{tag: 'mo', xmlns, content: '|'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'C'},
										{tag: 'mo', xmlns, content: '|'},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'α'},
									{tag: 'mo', xmlns, content: ')'},
								]},
								{tag: 'mo', xmlns, content: '×'},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'C'},
									{tag: 'mo', xmlns, content: '|'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, content: '|'},
									{tag: 'mi', xmlns, content: 'A'},
									{tag: 'mi', xmlns, content: 'D'},
									{tag: 'mo', xmlns, content: '|'},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mi', xmlns, content: 'v'},
									{tag: 'mi', xmlns, content: 'z'},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'z'},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mi', xmlns, content: 'v'},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'cos'},
											{tag: 'mo', xmlns, content: '('},
											{tag: 'mi', xmlns, content: 'α'},
											{tag: 'mo', xmlns, content: ')'},
										]},
										{tag: 'mo', xmlns, content: '×'},
										{tag: 'mrow', xmlns, content: [
											{tag: 'mo', xmlns, content: '|'},
											{tag: 'mi', xmlns, content: 'A'},
											{tag: 'mi', xmlns, content: 'C'},
											{tag: 'mo', xmlns, content: '|'},
										]},
									]},
								]},
							]},
						]},
					]},
				],
			},
			{
				title: {tag: 'mi', xmlns, content: 'x'},
				content: [
					{tag: 'mtable', xmlns, classList: [CLASS_MATH_EQUATION], content: [
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'θ'},
									{tag: 'mo', xmlns, content: '+'},
									{tag: 'mi', xmlns, content: 'α'},
									{tag: 'mo', xmlns, content: ')'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'B'},
										{tag: 'mi', xmlns, content: 'C'},
										{tag: 'mo', xmlns, content: '|'},
									]},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, content: '|'},
										{tag: 'mi', xmlns, content: 'A'},
										{tag: 'mi', xmlns, content: 'B'},
										{tag: 'mo', xmlns, content: '|'},
									]},
								]},
								{tag: 'mo', xmlns, content: '='},
								{tag: 'mfrac', xmlns, content: [
									{tag: 'mrow', xmlns, content: [
										{tag: 'msub', xmlns, content: [
											{tag: 'mi', xmlns, content: 'i'},
											{tag: 'mi', xmlns, content: 'w'},
										]},
										{tag: 'mo', xmlns, content: '-'},
										{tag: 'mi', xmlns, content: 'x'},
									]},
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'i'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
								]},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'h'},
								]},
								{tag: 'mo', xmlns, content: '×'},
								{tag: 'mrow', xmlns, content: [
									{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
									{tag: 'mo', xmlns, content: '('},
									{tag: 'mi', xmlns, content: 'θ'},
									{tag: 'mo', xmlns, content: '+'},
									{tag: 'mi', xmlns, content: 'α'},
									{tag: 'mo', xmlns, content: ')'},
								]},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mi', xmlns, content: 'x'},
							]},
						]},
						{tag: 'mtr', xmlns, content: [
							{tag: 'mtd', xmlns, content: [
								{tag: 'mi', xmlns, content: 'x'},
							]},
							{tag: 'mo', xmlns, content: '='},
							{tag: 'mtd', xmlns, content: [
								{tag: 'msub', xmlns, content: [
									{tag: 'mi', xmlns, content: 'i'},
									{tag: 'mi', xmlns, content: 'w'},
								]},
								{tag: 'mo', xmlns, content: '-'},
								{tag: 'mrow', xmlns, content: [
									{tag: 'msub', xmlns, content: [
										{tag: 'mi', xmlns, content: 'i'},
										{tag: 'mi', xmlns, content: 'h'},
									]},
									{tag: 'mo', xmlns, content: '×'},
									{tag: 'mrow', xmlns, content: [
										{tag: 'mo', xmlns, setAttributes: {rspace: '0', lspace: '0'}, content: 'tan'},
										{tag: 'mo', xmlns, content: '('},
										{tag: 'mi', xmlns, content: 'θ'},
										{tag: 'mo', xmlns, content: '+'},
										{tag: 'mi', xmlns, content: 'α'},
										{tag: 'mo', xmlns, content: ')'},
									]},
								]},
							]},
						]},
					]},
				],
			},
		),
		getCode(code, [
			{op: '=', id: [
				'originZoom0', 'x0', 'y0', 'zoom0', 'endX0', 'endY0',
				'originZoom1', 'x1', 'y1', 'zoom1', 'endX1', 'endY1',
			], and: {
				op: 'call', id: 'getZoomPoints',
			}},
			'',
			{op: '=', id: ['topLeftX', 'topLeftY'], and: {
				op: 'call', id: 'getBound', and: ['originZoom0', 'x0', 'y0', 'zoom0', 'endX0', 'endY0', true],
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
				op: 'call', id: 'getBound', and: ['originZoom1', 'x1', 'y1', 'zoom1', 'endX1', 'endY1', false],
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
			'There\'s no huge flaw, but this system\'s user experience is pretty terrible.',
			'Take ',
			getButton('this', [
				[{ratio: 0.5, rotation: DEGREES[90] + 0.5, zoom: 1, position: 0}],
			]),
			' state for example — see the panning path necessary to view the offscreen corner?',
			'There\'s no way anyone would take that path naturally.',
			'Users naturally try to take the shortest path possible, but this system doesn\'t often allow that.',
		],
		[
			'The ideal pan-limiting system is one that users find so natural and unintrusive that they don\'t consciously notice it.',
			'Some degree of intrusiveness is necessary with zoomful systems, but there\'s no attempt at mitigation here.',
			'This system\'s pan-limiting experience is frustrating because users must bend to its will, when it ', {tag: 'i', content: 'should'}, ' bend to the will of its users.',
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'The maths here build upon those of the single-line system.',
			'As before, a lock rail is snipped to achieve matching start zooms.',
			'Now, however, the snipped part of the lock rail must be paired with the end of the un-snipped lock rail\'s origin rail.',
			'Finally, one more snip is necessary to match zooms for origin rails.',
		],
		[
			'The final product might look similar to the image below.',
			'Segments are coloured to show pairings.',
		],
		// todo give the single-line system an image?
		{
			tag: 'div',
			content: snapImage,
			style: {textAlign: 'center'},
		},
		[
			'In the prior system, I needed to find a line that intersects the snap point and two adjacent rails.',
			'Now, with the adjacent rails split into a trio of segment pairs, the maximum number of checks required to find a snap zoom is tripled.',
		],
		getCode(code, [
			{op: '=', id: 'match0', and: {op: '||', and: [
				{op: '==', and: ['endX0', 'endX1']},
				{op: '==', and: ['endY0', 'endY1']},
			]}},
			{op: '=', id: ['flip0', 'flip1'], and: {
				op: 'call', id: 'getQuadrant',
			}},
			'',
			{op: '=', id: 'snapZoom', and: {
				op: 'call', id: 'getZoom', and: ['flip0', 'flip1', {op: '!=', and: ['flip0', 'flip1']}],
			}},
		]),
		{
			tag: 'h2',
			content: 'Snap-Pan Effectiveness',
			style: {textAlign: 'center'},
		},
		// todo expand?
		[
			'As a snap-panning facilitator, this system is hard to fault.',
			'Of course it performs fine on ',
			getButton('similar', ...getSnapTweens(() => Math.random() / 5 + 0.9)),
			' aspect ratios,',
			'but even ',
			getButton('distant', ...getSnapTweens(() => Math.random() / 10 + 0.2)),
			' aspect ratios reveal no flaw in its ability to derive sensible zoom levels.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'This system\'s not a great pan-limiter, but it\'s an effective snap-panner.',
		],
		[
			'This system achieves the goal of finding a zoomful, rotation-handling system to complement "Viewport Center".',
			'So, uh, let\'s stop here I guess...',
		],
	),
};
