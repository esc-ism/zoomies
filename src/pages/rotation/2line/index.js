import {DEGREES} from '@/shared';

import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';
import {badTweens} from '../1line';

import {MULTI_LINE as SHARED_FUNCTIONS} from '../code';
import Demo, {getSnappedZoom} from './demo';
import snapImage from './snapImage';
import getZoomPoints, {getRelevantDemo} from './zoomPoints';

export const getDimensions = (ratio, {width, height}) => {
	const dimensions = {};
	
	if (ratio < 1) {
		dimensions.width = width;
		dimensions.height = height * ratio;
	} else {
		dimensions.width = width / ratio;
		dimensions.height = height;
	}
	
	return {
		...dimensions,
		halfWidth: dimensions.width / 2,
		halfHeight: dimensions.height / 2,
	};
};

export const getVarGetter = (demo, rotation = DEGREES[90], ratio = 1) => () => {
	const zoomPoints = getZoomPoints(getRelevantDemo({...demo, rotation, sizesImage: getDimensions(ratio, demo.sizesViewport)}));
	
	return {first: zoomPoints[2], second: zoomPoints[3], zoomPoints, rotation, ratio};
};

const getCornerProgressTweens = (rotation) => [
	[{ratio: 1, zoom: 1, position: 0.5}],
	[{rotation}, {delay: 0.2}],
];

const getLimitedPosition = (limit = 0.4) => Math.max(-limit, Math.min(limit, Math.random() - 0.5));

const getSnapVars = (demo, getRatio) => {
	const position = {x: getLimitedPosition(), y: getLimitedPosition()};
	const {zoomPoints, rotation, ratio} = getVarGetter(demo, Math.random() * DEGREES[180], getRatio())();
	
	const zoom = getSnappedZoom(...zoomPoints, position);
	
	return {ratio, rotation, startZoom: Math.min(zoomPoints[0].z, zoomPoints[2].z), zoom, position};
};

export const getSnapTweens = (demo, getRatio) => [
	[
		({rotation, ratio, startZoom}) => [{rotation, ratio, zoom: startZoom, position: 0}],
		({position}) => [{position}],
		({zoom}) => [{zoom}, {duration: 0}],
	],
	{getParam: getSnapVars.bind(null, demo, getRatio)},
];

const get45Button = (demo, rotation, ratioImage) => getButton(
	`${rotation}°`,
	[({zoomPoints}) => [{zoom: Math.max(zoomPoints[0].z, zoomPoints[3].z), position: 0, rotation: DEGREES[rotation], ratioImage}]],
	{getParam: () => getVarGetter(demo, DEGREES[rotation], demo.ratioViewport / ratioImage)()},
);

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getIntersection', args: ['viewportX', 'viewportY', 'axisY', 'cornerX', 'axisZoom'], type: ['x', 'y', 'zoom'], pair: [1, 0], and: [
		{op: '=', id: 'c', and: {
			op: '*', and: ['cornerX', 'axisY'],
		}},
		{op: '=', id: 'd', and: {
			op: '-', and: [
				{op: '*', and: [{op: '-', and: 'viewportY'}, 'cornerX']},
				{op: '*', and: ['viewportX', {op: '-', and: ['axisY', 0.5]}]},
			],
		}},
		'',
		{op: '=', id: 'intersectX', type: 'x', pair: 'intersectY', and: {
			op: '/', and: [
				{op: '*', and: [{op: '-', and: 'viewportX'}, 'c']},
				'd',
			],
		}},
		{op: '=', id: 'intersectY', type: 'y', pair: 'intersectX', and: {
			op: '/', and: [
				{op: '*', and: [{op: '-', and: 'viewportY'}, 'c']},
				'd',
			],
		}},
		'',
		{op: '=', id: 'progress', and: {
			op: '/', and: ['intersectX', 'cornerX'],
		}},
		'',
		{op: 'return', and: [
			'intersectX',
			'intersectY',
			{op: '/', and: [
				'axisZoom',
				{op: '-', and: [1, 'progress']},
			]},
		]},
	]},
	{op: 'func', id: 'getCloseIntersection', args: ['rightX', 'rightY', 'topX', 'topY', 'axisY', 'axisZoom', 'isLeft'], type: ['x', 'y', 'zoom', 'xvp', 'yvp'], pair: [1, 0,,4, 3], and: [
		{op: '=', id: 'cornerX', type: 'x', and: {
			op: '?', and: ['isLeft', -0.5, 0.5],
		}},
		'',
		{op: '=', multiline: true, id: ['intersectRightX', 'intersectRightY', 'intersectRightZoom'], and: {
			op: 'call', id: 'getIntersection', and: ['rightX', 'rightY', 'axisY', 'cornerX', 'axisZoom'],
		}},
		{op: '=', multiline: true, id: ['intersectTopX', 'intersectTopY', 'intersectTopZoom'], and: {
			op: 'call', id: 'getIntersection', and: ['topX', 'topY', 'axisY', 'cornerX', 'axisZoom'],
		}},
		'',
		{op: 'if', and: [
			{op: '>', and: ['intersectRightZoom', 'intersectTopZoom']},
			{op: 'return', and: ['intersectRightX', 'intersectRightY', 'intersectRightZoom', 'rightX', 'rightY']},
		]},
		'',
		{op: 'return', and: ['intersectTopX', 'intersectTopY', 'intersectTopZoom', 'topX', 'topY']},
	]},
	{op: 'func', id: 'getZoomPoints', type: ['zoom', 'x', 'y', 'zoom', 'xvp', 'yvp', 'zoom', 'x', 'y', 'zoom', 'xvp', 'yvp'], pair: [,2, 1,,5, 4,,8, 7,,11, 10], and: [
		{op: '=', id: ['zoomSide', 'zoomBase'], and: {
			op: 'call', id: 'getStartZooms',
		}},
		{op: '=', id: 'angle', type: 'angle', and: {
			op: '%', and: [
				{op: '-', and: ['½π', 'rotation']},
				'π',
			],
		}},
		'',
		{op: '=', id: ['rightX', 'rightY', 'topX', 'topY'], and: {
			op: 'call', id: 'getViewportPoints', and: ['zoomSide', 'zoomBase'],
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
		{op: '=', id: 'progress', and: {
			op: '+', and: [
				{op: '*', and: [
					{op: '/', and: ['quadrantAngle', '½π']},
					-2,
				]},
				1,
			],
		}},
		{op: '=', id: 'angleBase', type: 'angle', isBase: true, and: {
			op: 'atan', and: {
				op: '*', and: [
					'progress',
					{op: '/', and: ['viewportWidth', 'viewportHeight']},
				],
			},
		}},
		{op: '=', id: 'angleSide', type: 'angle', and: {
			op: 'atan', and: {
				op: '*', and: [
					'progress',
					{op: '/', and: ['viewportHeight', 'viewportWidth']},
				],
			},
		}},
		'',
		{op: '=', id: 'axisIntersectSideAngle', type: 'angle', and: {
			op: '+', and: ['quadrantAngle', 'angleSide'],
		}},
		{op: '=', id: 'axisIntersectSideY', type: 'y', and: {
			op: '/', and: [
				{op: '-', and: [
					'½imageHeight',
					{op: '*', and: [
						'½imageWidth',
						{op: 'tan', and: 'axisIntersectSideAngle'},
					]},
				]},
				'imageHeight',
			],
		}},
		{op: '=', id: 'axisIntersectSideZoom', type: 'zoom', and: {
			op: '/', and: [
				'½viewportWidth',
				{op: '*', and: [
					{op: 'cos', and: 'angleSide'},
					{op: 'abs', and: {
						op: '/', and: [
							'½imageWidth',
							{op: 'cos', and: 'axisIntersectSideAngle'},
						],
					}},
				]},
			],
		}},
		'',
		{op: '=', id: 'axisIntersectBaseAngle', type: 'angle', and: {
			op: '-', and: ['½π', 'quadrantAngle', 'angleBase'],
		}},
		{op: '=', id: 'axisIntersectBaseY', type: 'y', and: {
			op: '/', and: [
				{op: '-', and: [
					'½imageHeight',
					{op: '*', and: [
						'½imageWidth',
						{op: 'tan', and: 'axisIntersectBaseAngle'},
					]},
				]},
				'imageHeight',
			],
		}},
		{op: '=', id: 'axisIntersectBaseZoom', type: 'zoom', and: {
			op: '/', and: [
				'½viewportHeight',
				{op: '*', and: [
					{op: 'cos', and: 'angleBase'},
					{op: 'abs', and: {
						op: '/', and: [
							'½imageWidth',
							{op: 'cos', and: 'axisIntersectBaseAngle'},
						],
					}},
				]},
			],
		}},
		'',
		{op: '=', multiline: true, id: ['intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY'], and: {
			op: 'call', id: 'getCloseIntersection', and: ['rightX', 'rightY', 'topX', 'topY', 'axisIntersectSideY', 'axisIntersectSideZoom', 'isEvenQuadrant'],
		}},
		{op: '=', multiline: true, id: ['intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY'], and: {
			op: 'call', id: 'getCloseIntersection', and: ['rightX', 'rightY', 'topX', 'topY', 'axisIntersectBaseY', 'axisIntersectBaseZoom', {op: '!', and: 'isEvenQuadrant'}],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', multiline: 2, and: ['zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY', 'zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY']},
		]},
		'',
		{op: 'return', multiline: 2, and: ['zoomBase', 'intersectBaseX', 'intersectBaseY', 'intersectBaseZoom', 'intersectBaseEndX', 'intersectBaseEndY', 'zoomSide', 'intersectSideX', 'intersectSideY', 'intersectSideZoom', 'intersectSideEndX', 'intersectSideEndY']},
	]},
	{op: 'func', id: 'getBound', args: ['originZoom', 'midX', 'midY', 'midZoom', 'endX', 'endY', 'isLeft'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '>', and: ['zoom', 'midZoom']},
			{op: '=', id: 'progress', and: {
				op: '/', and: ['zoom', 'midZoom'],
			}},
			{op: '=', id: 'cornerX', type: 'x', and: {
				op: '?', and: ['isLeft', -0.5, 0.5],
			}},
			'',
			{op: 'return', and: [
				{op: '-', and: [
					'cornerX',
					{op: '/', and: [
						{op: '-', and: ['cornerX', 'midX']},
						'progress',
					]},
				]},
				{op: '-', and: [
					0.5,
					{op: '/', and: [
						{op: '-', and: [0.5, 'midY']},
						'progress',
					]},
				]},
			]},
		]},
		'',
		{op: 'if', and: [
			{op: '<=', and: ['zoom', 'originZoom']},
			{op: 'return', and: [0, 0]},
		]},
		'',
		{op: '=', id: ['boundX', 'boundY'], type: ['x', 'y'], and: {
			op: 'call', id: 'getProgressed', and: [0, 0, 'endX', 'endY', 'originZoom', 'zoom'],
		}},
		'',
		{op: 'return', and: ['boundX', 'boundY']},
	]},
	{op: 'func', id: 'getDirected', args: ['endX', 'endY', 'midX', 'midY', 'flip', 'cX'], type: ['x', 'y', 'x', 'y', 'x', 'y'], pair: [1, 0, 3, 2, 5, 4], and: [
		{op: 'return', and: {
			op: '?', multiline: true, and: [
				'flip',
				{op: 'array', and: [
					{op: '-', and: 'endX'}, {op: '-', and: 'endY'},
					{op: '-', and: 'midX'}, {op: '-', and: 'midY'},
					{op: '-', and: 'cX'}, -0.5,
				]},
				{op: 'array', and: [
					'endX', 'endY',
					'midX', 'midY',
					'cX', 0.5,
				]},
			],
		}},
	]},
	{op: 'func', id: 'getIntersectZoom', args: ['startZoom', 'fromX0', 'fromY0', 'toX0', 'toY0', 'fromX1', 'fromY1', 'toX1', 'toY1', 'isInverse', 'maxP'], type: 'zoom', and: [
		{op: 'if', and: [
			{op: '>=', and: ['maxP', 0]},
			{op: '=', id: 'p', and: {
				op: 'call', id: 'getIntersectRatio', and: ['fromX0', 'fromY0', 'toX0', 'toY0', 'fromX1', 'fromY1', 'toX1', 'toY1', 'isInverse'],
			}},
			'',
			{op: 'if', and: [
				{op: '&&', and: [
					{op: '>=', and: ['p', 0]},
					{op: '<=', and: ['p', 'maxP']},
				]},
				{op: 'return', and: {
					op: '/', and: [
						'startZoom',
						{op: '-', and: [1, 'p']},
					],
				}},
			]},
		]},
		'',
		{op: 'return', and: 0},
	]},
	{op: 'func', id: 'getPairings', args: ['flip0', 'flip1'], type: [
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',
	], pair: [
		,
		2, 1, 4, 3, 6, 5, 8, 7,,
		11, 10, 13, 12, 15, 14, 17, 16,,
		20, 19, 22, 21, 24, 23, 26, 25,
	], and: [
		{op: '=', id: ['dEndX0', 'dEndY0', 'dMidX0', 'dMidY0', 'dCX0', 'dCY0'], and: {
			op: 'call', id: 'getDirected', and: ['endX0', 'endY0', 'x0', 'y0', 'flip0', -0.5],
		}},
		{op: '=', id: ['dEndX1', 'dEndY1', 'dMidX1', 'dMidY1', 'dCX1', 'dCY1'], and: {
			op: 'call', id: 'getDirected', and: ['endX1', 'endY1', 'x1', 'y1', 'flip1', 0.5],
		}},
		'',
		{op: 'return', multiline: true, and: [
			{op: '...', and: {op: '?', multiline: true, and: [
				{op: '>=', and: ['originZoom0', 'originZoom1']},
				{op: 'array', and: [
					'originZoom0',
					0, 0,
					'dEndX0', 'dEndY0',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'dEndX1', 'dEndY1', 'originZoom1', 'originZoom0']}},
					'dEndX1', 'dEndY1',
				]},
				{op: 'array', and: [
					'originZoom1',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'dEndX0', 'dEndY0', 'originZoom0', 'originZoom1']}},
					'dEndX0', 'dEndY0',
					0, 0,
					'dEndX1', 'dEndY1',
				]},
			]}},
			{op: '...', and: {op: '?', multiline: true, and: [
				{op: '>=', and: ['zoom0', 'zoom1']},
				{op: 'array', multiline: 2, and: [
					'zoom1',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'dEndX0', 'dEndY0', 'originZoom0', 'zoom1']}},
					'dEndX0', 'dEndY0',
					'dMidX1', 'dMidY1',
					'dCX1', 'dCY1',
					'zoom0',
					'dMidX0', 'dMidY0',
					'dCX0', 'dCY0',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: ['dMidX1', 'dMidY1', 'dCX1', 'dCY1', 'zoom1', 'zoom0']}},
					'dCX1', 'dCY1',
				]},
				{op: 'array', multiline: 2, and: [
					'zoom0',
					'dMidX0', 'dMidY0',
					'dCX0', 'dCY0',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'dEndX1', 'dEndY1', 'originZoom1', 'zoom0']}},
					'dEndX1', 'dEndY1',
					'zoom1',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: ['dMidX0', 'zoom0', 'dCX0', 'dCY0', 'dMidY0', 'zoom1']}},
					'dCX0', 'dCY0',
					'dMidX1', 'dMidY1',
					'dCX1', 'dCY1',
				]},
			]}},
		]},
	]},
	{op: 'func', id: 'getZoom', args: ['flip0', 'flip1', 'isInverse'], type: 'zoom', and: [
		{op: '=', multiline: 3, id: [
			'zoomA', 'fromX0A', 'fromY0A', 'toX0A', 'toY0A', 'fromX1A', 'fromY1A', 'toX1A', 'toY1A',
			'zoomB', 'fromX0B', 'fromY0B', 'toX0B', 'toY0B', 'fromX1B', 'fromY1B', 'toX1B', 'toY1B',
			'zoomC', 'fromX0C', 'fromY0C', 'toX0C', 'toY0C', 'fromX1C', 'fromY1C', 'toX1C', 'toY1C',
		], and: {
			op: 'call', id: 'getPairings', and: ['flip0', 'flip1'],
		}},
		'',
		{op: 'return', and: {
			op: '||', multiline: true, and: [
				{op: 'call', id: 'getIntersectZoom', and: ['zoomC', 'fromX0C', 'fromY0C', 'toX0C', 'toY0C', 'fromX1C', 'fromY1C', 'toX1C', 'toY1C', 'isInverse', 1]},
				{op: 'call', id: 'getIntersectZoom', and: [
					'zoomB', 'fromX0B', 'fromY0B', 'toX0B', 'toY0B', 'fromX1B', 'fromY1B', 'toX1B', 'toY1B', 'isInverse', {
						op: '-', and: [
							1,
							{op: '/', and: ['zoomB', 'zoomC']},
						],
					},
				]},
				{op: 'call', id: 'getIntersectZoom', and: [
					'zoomA', 'fromX0A', 'fromY0A', 'toX0A', 'toY0A', 'fromX1A', 'fromY1A', 'toX1A', 'toY1A', 'isInverse', {
						op: '-', and: [
							1,
							{op: '/', and: ['zoomA', 'zoomB']},
						],
					},
				]},
			],
		}},
	]},
];

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	registerFunctions(demo, functions);
	
	const getTraceVars = getVarGetter(demo, DEGREES[90] - 0.4, 0.75);
	const getDirectVars = getVarGetter(demo, DEGREES[90] - 0.4);
	
	wrapper.append(
		demo.constructor.element,
		getText(
			{
				tag: 'h1',
				content: 'Double-Line Rotation',
				style: {textAlign: 'center'},
			},
			[
				'Let\'s start by seeing how that ',
				getButton('problematic demo state', [[badTweens]]),
				' looks on this new system.',
			],
			[
				'Much better!',
				'This system is equivalent to the prior with shared aspect ratio, but handles ',
				getButton('decoupling', [
					[{...badTweens, ratio: 2, zoom: 1.5}],
					[{ratio: 0.5}, {duration: 5, ease: 'none'}],
				]),
				' much better.',
			],
			[
				'This system keeps each image corner on a different viewport edge.',
				'The corners\' distance along each edge is a ratio based on rotation angle;',
				'if an image corner maps to one viewport corner at ',
				getButton('0°', getCornerProgressTweens(DEGREES[90])),
				' and another at ',
				getButton('90°', getCornerProgressTweens(0)),
				', it travels linearly between them for ',
				getButton('intermediate angles', [
					...getCornerProgressTweens(DEGREES[90]),
					[{rotation: 0}, {ease: 'none', duration: 3}],
				]),
				'.',
			],
			[
				'But this is only half of the system.',
				'Since points no longer travel directly from the origin towards image corners, we need a smart way to move them from the origin.',
			],
			[
				'This is accomplished here by having them trace along the ',
				getButton('viewport\'s axes', [
					({rotation, ratio, first}) => [{position: 0, ratio, rotation, zoom: first.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				' until they can take a ',
				getButton('corner-bound', [
					({rotation, ratio, second}) => [{position: second, ratio, rotation, zoom: second.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z * 2}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				'  path.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			[
				'In the previous system, we only needed to calculate the zoom at which each image corner touched the viewport\'s edge.',
				'We can see this as defining a line segment from the origin to a corner, progressing from an initial zoom to infinite zoom.',
				'This system has two lines connecting the origin to each corner, necessitating twice as many line definitions.',
			],
			[
				'We\'ll still be focusing on the top-left and top-right image corners, but we must also assign a viewport edge that these corners will touch;',
				'one will be a "side" corner and the other a "base" corner.',
				'This assignment will be based off rotation, with corners alternating between "base" and "side" every 90°.',
			],
			[
				'For a given corner, its first line will travel from the origin to the center of a viewport edge (not necessarily the edge that the corner will touch).',
				'The zoom level at which the corner touches any viewport edge will be the line\'s start zoom.',
			],
			[
				'The second line will use the corner as its terminus and have the gradient necessary to meet the aforementioned positional constraint relative to its viewport edge.',
				'Its start point will be the intersection between this line and the first.',
				'In practise, I calculate whether to use a viewport "side" or "base" line as the first by finding the intersect for both and choosing the one that intersects closest to the corner.',
			],
			getCode([
				{op: '=', multiline: 2, id: ['originZoom0', 'x0', 'y0', 'zoom0', 'endX0', 'endY0', 'originZoom1', 'x1', 'y1', 'zoom1', 'endX1', 'endY1'], and: {
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
				'This latter part of the system has upsides and downsides.',
				'On one hand, users can take the most direct possible path when ',
				getButton('panning', [
					({rotation, ratio, second}) => [{rotation, ratio, zoom: second.z, position: 0}],
					({second}) => [{position: second}, {delay: 0.5}],
					({second}) => [{position: second.vpEnd}, {duration: 0}],
				], {getParam: getDirectVars}),
				' to an offscreen corner.',
				'On the other, for any image aspect ratio other than 1:1, there are windows of rotation values around ',
				get45Button(demo, 45, 0.8),
				', ',
				get45Button(demo, 135, 1.2),
				', ',
				get45Button(demo, 225, 0.5),
				' and ',
				get45Button(demo, 315, 1.5),
				' where preferred axes can\'t be used.',
			],
			[
				'Bounds jump around when rotating into and out of these windows.',
				'Within them, at low zooms, the system forces sub-optimal panning paths while providing insufficiently restrictive pan limits.',
			],
			[
				'As image aspect ratio gets more extreme, these windows get increasingly wide and the issues get ',
				getButton('increasingly severe', [
					[{position: 0.5}, {duration: 0}],
					[{ratioImage: 2, zoom: 1}],
					[{rotation: DEGREES[90]}, {duration: 2, delay: 0.2}],
					[{rotation: 0}, {ease: 'none', duration: 5}],
				], {getParam: getDirectVars}),
				'.',
			],
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			[
				'The maths here build upon those of the single-line system.',
				'As before, a line is snipped to achieve matching start zooms.',
				'Now, however, another snip is necessary to match zooms for the later lines.',
			],
			{
				tag: 'div',
				content: snapImage,
				style: {textAlign: 'center'},
			},
			[
				'The final lines look something like what\'s shown above.',
				'One pair of green lines starts at the origin and the other is snipped to start later.',
				'One pair of orange lines ends at the gradient change and the other starts there.',
				'The red lines span the remaining distance from the end of the orange lines to the corners',
			],
			[
				'Before, I needed to find a line that intersects the snap point and any two adjacent lines.',
				'Now, the intersected lines must share a colour.',
				'Thus, the number of checks required to find the correct snap zoom is tripled.',
			],
			[
				'On top of this, the region in which the position lies is no longer obvious.',
				'For simplicity, I simply check every region, further quadrupling checks for a total of 12x complexity.',
			],
			'If a snap zoom may be derived from more than one of the 12 pairs, the highest zoom value is used.',
			getCode([
				{op: '=', id: 'snapZoom', type: 'zoom', and: {
					op: 'max', multiline: true, and: [
						{op: 'call', id: 'getZoom', and: [false, false, false]},
						{op: 'call', id: 'getZoom', and: [false, true, true]},
						{op: 'call', id: 'getZoom', and: [true, false, true]},
						{op: 'call', id: 'getZoom', and: [true, true, false]},
					],
				}},
			]),
			{
				tag: 'h2',
				content: 'Snap-Pan Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'As a snap-panning facilitator, this system is hard to fault.',
				'Of course it performs fine on ',
				getButton('similar', ...getSnapTweens(demo, () => Math.random() / 5 + 0.9)),
				' aspect ratios,',
				'but even ',
				getButton('distant', ...getSnapTweens(demo, () => Math.random() / 10 + 0.2)),
				' aspect ratios reveal no flaw in its ability to derive sensible zoom levels.',
			],
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'Besides efficiency, the system\'s only drawback is its spotty pan-limiting when image aspect ratio isn\'t 1:1.',
				'It\'s possible to solve this problem by ditching viewport axis-based panning paths in favor of, for example, image axis paths.',
				'This, however, is accepting defeat;',
				'not using viewport axes means accepting sub-optimal paths, providing a worse user experience.',
				'There must be a way to have our cake and eat it too!',
			],
		),
	);
	
	return demo;
};
