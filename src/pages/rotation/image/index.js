import {DEGREES} from '@/shared';
import {getText, getCode, getButton, registerDemo} from '../../shared';
import {register as registerFunctions} from '../../code';
import * as mock from '../mock';
import {permissiveTweens, restrictiveTweens} from '../1line';
import {DOUBLE_LINE as SHARED_FUNCTIONS} from '../code';

import snapImage from './snapImage';
import Demo from './demo';
import getZoomPoints from './zoomPoints';

const getCornerProgressTweens = (rotation) => [
	[{ratio: 1, zoom: 1, position: 0.5}],
	[{rotation}, {delay: 0.2}],
];

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getYIntersect', args: ['viewportSize', 'cornerAngle', 'progressAngle'], type: ['y', 'zoom'], and: [
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '/', and: [
				{op: '-', and: [
					'½imageHeight',
					{op: '*', and: ['½imageWidth', {op: 'tan', and: 'cornerAngle'}]},
				]},
				'imageHeight',
			]},
			{op: '/', and: [
				'viewportSize',
				{op: '*', and: [
					{op: 'cos', and: 'progressAngle'},
					{op: 'abs', and: {
						op: '/', and: ['½imageWidth', {op: 'cos', and: 'cornerAngle'}],
					}},
				]},
			]},
		]}},
	]},
	{op: 'func', id: 'getXIntersect', args: ['viewportSize', 'cornerAngle', 'progressAngle'], type: ['x', 'zoom'], and: [
		{op: 'return', and: {op: 'array', multiline: true, and: [
			{op: '/', and: [
				{op: '-', and: [
					'½imageWidth',
					{op: '*', and: ['½imageHeight', {op: 'tan', and: 'cornerAngle'}]},
				]},
				'imageWidth',
			]},
			{op: '/', and: [
				'viewportSize',
				{op: '*', and: [
					{op: 'cos', and: 'progressAngle'},
					{op: 'abs', and: {
						op: '/', and: ['½imageHeight', {op: 'cos', and: 'cornerAngle'}],
					}},
				]},
			]},
		]}},
	]},
	{op: 'func', id: 'getIntersectSide', args: ['cornerAngle', 'progressAngle', 'quadrantAngle', 'isEvenQuadrant'], type: ['x', 'y', 'zoom'], pair: [1, 0], and: [
		{op: '=', id: 'lockAngle', type: 'angle', and: {
			op: '+', and: ['progressAngle', 'quadrantAngle'],
		}},
		'',
		{op: 'if', and: [
			{op: '<', and: ['lockAngle', 'cornerAngle']},
			{op: 'return', and: {op: 'array', and: [
				0,
				{op: '...', and: {op: 'call', id: 'getYIntersect', and: ['½viewportWidth', 'lockAngle', 'progressAngle']}},
			]}},
		]},
		'',
		{op: '=', id: ['intersectX', 'intersectZoom'], and: {
			op: 'call', id: 'getXIntersect', and: ['½viewportWidth', {op: '-', and: ['½π', 'quadrantAngle', 'progressAngle']}, 'progressAngle'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: '?', and: ['isEvenQuadrant', {op: '-', and: 'intersectX'}, 'intersectX']},
			0,
			'intersectZoom',
		]}},
	]},
	{op: 'func', id: 'getIntersectBase', args: ['cornerAngle', 'progressAngle', 'quadrantAngle', 'isEvenQuadrant'], type: ['x', 'y', 'zoom'], pair: [1, 0], and: [
		{op: '=', id: 'lockAngle', and: {
			op: '-', and: ['½π', 'quadrantAngle', 'progressAngle'],
		}},
		'',
		{op: 'if', and: [
			{op: '<', and: ['lockAngle', 'cornerAngle']},
			{op: 'return', and: {op: 'array', and: [
				0,
				{op: '...', and: {op: 'call', id: 'getYIntersect', and: ['½viewportHeight', 'lockAngle', 'progressAngle']}},
			]}},
		]},
		'',
		{op: '=', id: ['intersectX', 'intersectZoom'], and: {
			op: 'call', id: 'getXIntersect', and: ['½viewportHeight', {op: '+', and: ['progressAngle', 'quadrantAngle']}, 'progressAngle'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: '?', and: ['isEvenQuadrant', 'intersectX', {op: '-', and: 'intersectX'}]},
			0,
			'intersectZoom',
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
		{op: '=', id: ['angleBase', 'angleSide'], and: {
			op: 'call', id: 'getProgressAngles', and: ['quadrantAngle'],
		}},
		'',
		{op: '=', id: 'cornerAngle', type: 'angle', and: {
			op: 'atan', and: {
				op: '/', and: ['viewportHeight', 'viewportWidth'],
			},
		}},
		'',
		{op: '=', id: ['intersectSideX', 'intersectSideY', 'intersectSideZoom'], and: {
			op: 'call', id: 'getIntersectSide', and: [
				'cornerAngle',
				'angleSide',
				'quadrantAngle',
				'isEvenQuadrant',
			],
		}},
		{op: '=', id: ['intersectBaseX', 'intersectBaseY', 'intersectBaseZoom'], and: {
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
	
	const getTraceVars = getVarGetter(demo, DEGREES[90] - 0.4, 0.75);
	
	registerDemo(demo);
	registerFunctions(demo, functions);
	
	wrapper.append(
		demo.constructor.element,
		getText(
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
				'In the prior system, there were two playground states that revealed issues.',
				'Let\'s start by seeing how they look here.',
			],
			[
				'First, the ',
				getButton('state', [[restrictiveTweens]]),
				' that was too restrictive is way better!',
				'It isn\'t nearly as permissive as the "Viewport Center" system, but in most situations it\'s good enough.',
				'The unnecessarily permissive ',
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
				], {getParam: getTraceVars}),
				'  follow image axes until they intersect ',
				getButton('lock rails', [
					({rotation, ratio, second}) => [{position: second, ratio, rotation, zoom: second.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z * 2}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				'.',
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
			[
				'Each origin rail\'s start zoom will be the zoom at which its image corner touches a viewport edge.',
				'If we know the lock rail\'s gradient, and we know which image corner it will end at, we can derive its start zoom from its origin rail intersection.',
			],
			[
				'Origin rails trace whichever axis minimises lock rail length.',
			],
			getCode([
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
				'The maths here build upon those of the single-line system.',
				'As before, a lock rail is snipped to achieve matching start zooms.',
				'Now, however, the snipped part of the lock rail must be paired with the end of the un-snipped lock rail\'s origin rail.',
				'Finally, one more snip is necessary to match zooms for origin rails.',
			],
			[
				'The final product might look similar to the image below.',
				'Segments are coloured to show pairings.',
			],
			// todo make an image for single-line?
			{
				tag: 'div',
				content: snapImage,
				style: {textAlign: 'center'},
			},
			[
				'In the prior system, I needed to find a line that intersects the snap point and two adjacent rails.',
				'Now, with the adjacent rails split into a trio of segment pairs, the maximum number of checks required to find a snap zoom is tripled.',
			],
			getCode([
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
	);
	
	return demo;
};
