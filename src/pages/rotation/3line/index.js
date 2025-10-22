import demo from '@/demo';
import {DEGREES} from '@/shared';

import {MULTI_LINE as SHARED_FUNCTIONS} from '../code';
import {cleanup, register as registerFunctions} from '../../code';
import {getText, getCode, getButton} from '../../shared';

import System from './demo';
import {xmlns} from '@/pages/shared/svg';
import {CLASS_MATH} from '@/pages/consts';

const code = [];

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getGenericIntersection', multiline: 2, args: [
		'from0X', 'from0Y', 'to0X', 'to0Y',
		'from1X', 'from1Y', 'to1X', 'to1Y',
	], type: ['x', 'y'], pair: [1, 0], and: [
		{op: '=', id: 'a0', and: {
			op: '-', and: ['from0Y', 'to0Y'],
		}},
		{op: '=', id: 'b0', and: {
			op: '-', and: ['to0X', 'from0X'],
		}},
		{op: '=', id: 'c0', and: {
			op: '-', and: [
				{op: '*', and: ['from0Y', 'to0X']},
				{op: '*', and: ['from0X', 'to0Y']},
			],
		}},
		'',
		{op: '=', id: 'a1', and: {
			op: '-', and: ['from1Y', 'to1Y'],
		}},
		{op: '=', id: 'b1', and: {
			op: '-', and: ['to1X', 'from1X'],
		}},
		{op: '=', id: 'c1', and: {
			op: '-', and: [
				{op: '*', and: ['from1Y', 'to1X']},
				{op: '*', and: ['from1X', 'to1Y']},
			],
		}},
		'',
		{op: '=', id: 'd', and: {
			op: '-', and: [
				{op: '*', and: ['a0', 'b1']},
				{op: '*', and: ['b0', 'a1']},
			],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: '/', and: [
				{op: '-', and: [
					{op: '*', and: ['c0', 'b1']},
					{op: '*', and: ['b0', 'c1']},
				]},
				'd',
			]},
			{op: '/', and: [
				{op: '-', and: [
					{op: '*', and: ['a0', 'c1']},
					{op: '*', and: ['c0', 'a1']},
				]},
				'd',
			]},
		]}},
	]},
	{op: 'func', id: 'getIntersection', args: [
		'zoom0', 'from0X', 'from0Y', 'to0X', 'to0Y',
		'from1X', 'from1Y', 'to1X', 'to1Y',
	], multiline: 2, type: ['zoom', 'x', 'y'], pair: [,2, 1], and: [
		{op: '=', id: ['intersectX', 'intersectY'], and: {
			op: 'call', id: 'getGenericIntersection', and: ['from0X', 'from0Y', 'to0X', 'to0Y', 'from1X', 'from1Y', 'to1X', 'to1Y'],
		}},
		'',
		{op: '=', id: 'isXAxis', and: {
			op: '>', and: [{op: 'abs', and: 'to0X'}, {op: 'abs', and: 'to0Y'}],
		}},
		'',
		{op: '=', id: 'progress', and: {
			op: '?', multiline: true, and: [
				'isXAxis',
				{op: '/', and: [
					{op: '-', and: ['intersectX', 'from0X']},
					{op: '-', and: ['to0X', 'from0X']},
				]},
				{op: '/', and: [
					{op: '-', and: ['intersectY', 'from0Y']},
					{op: '-', and: ['to0Y', 'from0Y']},
				]},
			],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: '/', and: [
				'zoom0',
				{op: '-', and: [1, 'progress']},
			]},
			'intersectX',
			'intersectY',
		]}},
	]},
	{op: 'func', id: 'getProgressedMiddle', args: ['x', 'y', 'zoom0', 'zoom1'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: '=', id: 'mult', and: {
			op: '/', and: ['zoom0', 'zoom1'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: '*', and: ['x', 'mult']},
			{op: '*', and: ['y', 'mult']},
		]}},
	]},
	{op: 'func', id: 'getSecond', args: ['firstZoom', 'firstEndX', 'firstEndY', 'secondZoom', 'offsetX', 'offsetY'], multiline: 2, type: ['x', 'y', 'x', 'y'], pair: [1, 0, 3, 2], and: [
		{op: '=', id: ['secondX', 'secondY'], type: ['x', 'y'], and: {
			op: 'call', id: 'getProgressed', and: [0, 0, 'firstEndX', 'firstEndY', 'firstZoom', 'secondZoom'],
		}},
		{op: '=', id: 'mult', and: {
			op: '/', and: ['firstZoom', 'secondZoom'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			'secondX', 'secondY',
			{op: '+', and: [{op: '*', and: ['firstEndX', 'mult']}, 'offsetX', 'secondX']},
			{op: '+', and: [{op: '*', and: ['firstEndY', 'mult']}, 'offsetY', 'secondY']},
		]}},
	]},
	{op: 'func', id: 'getAxisIntersects', args: ['isEvenQuadrant', 'quadrantAngle'], type: ['zoom', 'x', 'y', 'zoom', 'x', 'y'], pair: [2, 1, 5, 4], and: [
		{op: '=', id: ['angleSide', 'angleBase'], and: {
			op: 'call', id: 'getProgressAngles', and: ['quadrantAngle'],
		}},
		'',
		{op: 'if', and: [
			{op: '>=', and: ['quadrantAngle', '¼π']},
			{op: '=', id: ['axisIntersectSideZoom', 'axisIntersectSideY'], and: {op: 'call', id: 'getYIntersect', and: [
				'½viewportWidth',
				{op: '+', and: ['quadrantAngle', 'angleSide']},
				'angleSide',
			]}},
			{op: '=', id: ['axisIntersectBaseZoom', 'axisIntersectBaseY'], and: {op: 'call', id: 'getYIntersect', and: [
				'½viewportHeight',
				{op: '-', and: ['½π', 'quadrantAngle', 'angleBase']},
				'angleBase',
			]}},
			'',
			{op: 'return', and: {op: 'array', multiline: 2, and: [
				'axisIntersectSideZoom', 0, 'axisIntersectSideY',
				'axisIntersectBaseZoom', 0, 'axisIntersectBaseY',
			]}},
		]},
		'',
		{op: '=', id: ['axisIntersectSideZoom', 'axisIntersectSideX'], and: {
			op: 'call', id: 'getXIntersect', and: [
				'½viewportWidth',
				{op: '-', and: ['½π', 'quadrantAngle', 'angleSide']},
				'angleSide',
			],
		}},
		{op: '=', id: ['axisIntersectBaseZoom', 'axisIntersectBaseX'], and: {
			op: 'call', id: 'getXIntersect', and: [
				'½viewportHeight',
				{op: '+', and: ['quadrantAngle', 'angleBase']},
				'angleBase',
			],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: {op: 'array', multiline: 2, and: [
				'axisIntersectSideZoom', {op: '-', and: 'axisIntersectSideX'}, 0,
				'axisIntersectBaseZoom', 'axisIntersectBaseX', 0,
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: 2, and: [
			'axisIntersectSideZoom', 'axisIntersectSideX', 0,
			'axisIntersectBaseZoom', {op: '-', and: 'axisIntersectBaseX'}, 0,
		]}},
	]},
	{op: 'func', id: 'getDoFlip', args: [
	], and: [
		{op: '=', id: 'isXAxis', and: {
			op: '>', and: [{op: 'abs', and: 'firstEndX'}, {op: 'abs', and: 'firstEndY'}],
		}},
		'',
		{op: '=', id: ['farX', 'farY'], and: {
			op: 'call', id: 'getGenericIntersection', and: [0, 0, 'firstEndX', 'firstEndY', 'thirdX', 'thirdY', 'thirdEndX', 0.5],
		}},
		'',
		{op: '=', id: 'mThird', and: {
			op: '/', and: [
				{op: '-', and: [0.5, 'thirdY']},
				{op: '-', and: ['thirdEndX', 'thirdX']},
			],
		}},
		{op: '=', id: 'mFirst', and: {
			op: '/', and: ['firstEndY', 'firstEndX'],
		}},
		'',
		{op: 'return', and: {
			// todo this work?
			op: '==', and: [
				{op: '>', and: ['mFirst', 0]},
				{op: '<', and: ['mThird', 'mFirst']},
				{op: '?', multiline: true, and: [
					'isXAxis',
					{op: '==', and: [
						{op: '>', and: ['secondX', 0]},
						{op: '<', and: ['farX', 'secondX']},
					]},
					{op: '==', and: [
						{op: '>', and: ['secondY', 0]},
						{op: '<', and: ['farY', 'secondY']},
					]},
				]},
			],
		}},
	]},
	{op: 'func', id: 'getShared', type: [
		'zoom', 'zoom',
		// first
		'xvp', 'yvp', 'xvp', 'yvp', 'xvp', 'yvp', 'xvp', 'yvp',
		// second
		'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',
	], multilineResult: [2, 4, 4, 8, 8], pair: [,,3, 2, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14, 17, 16, 19, 18, 21, 20, 23, 22, 25, 24], args: [
		'isEvenQuadrant', 'zoomSide', 'zoomBase', 'rightXRaw', 'rightYRaw', 'topXRaw', 'topYRaw',
		'axisIntersectXSide', 'axisIntersectYSide', 'axisIntersectXBase', 'axisIntersectYBase',
		'cornerXSide', 'cornerXBase',
	], multiline: [7, 4, 2], and: [
		{op: '=', id: 'isHorizontalFirst', and: {
			op: '<=', and: ['zoomSide', 'zoomBase'],
		}},
		{op: '=', id: 'isVerticalFlip', and: {
			op: '&&', and: [
				{op: '<', and: ['rotation', 0]},
				{op: '>', and: ['rotation', {op: '-', and: 'π'}]},
			],
		}},
		'',
		{op: '=', id: ['rightX', 'rightY'], and: {
			op: '?', multiline: true, and: [
				{op: '!=', and: ['isVerticalFlip', 'isEvenQuadrant']},
				{op: 'array', and: [{op: '-', and: 'rightXRaw'}, {op: '-', and: 'rightYRaw'}]},
				{op: 'array', and: ['rightXRaw', 'rightYRaw']},
			],
		}},
		{op: '=', id: ['topX', 'topY'], and: {
			op: '?', multiline: true, and: [
				'isVerticalFlip',
				{op: 'array', and: [{op: '-', and: 'topXRaw'}, {op: '-', and: 'topYRaw'}]},
				{op: 'array', and: ['topXRaw', 'topYRaw']},
			],
		}},
		'',
		{op: '=', id: [
			'firstZoom', 'secondZoom', 'firstEndX', 'firstEndY',
			'offsetX', 'offsetY', 'thirdX', 'thirdY', 'thirdEndX',
		], multiline: [6, 3], and: {
			op: '?', multiline: true, and: [
				'isHorizontalFirst',
				{op: 'array', multiline: [6, 3], and: [
					'zoomSide', 'zoomBase', 'rightX', 'rightY',
					'topX', 'topY', 'axisIntersectXSide', 'axisIntersectYSide', 'cornerXSide',
				]},
				{op: 'array', multiline: [6, 3], and: [
					'zoomBase', 'zoomSide', 'topX', 'topY',
					'rightX', 'rightY', 'axisIntersectXBase', 'axisIntersectYBase', 'cornerXBase',
				]},
			],
		}},
		'',
		{op: '=', id: ['secondX', 'secondY', 'secondEndX', 'secondEndY'], and: {
			op: 'call', id: 'getSecond', and: ['firstZoom', 'firstEndX', 'firstEndY', 'secondZoom', 'offsetX', 'offsetY'],
		}},
		'',
		{op: '=', id: ['firstEndXFlipped', 'firstEndYFlipped', 'offsetXFlipped', 'offsetYFlipped'], and: {
			op: '?', multiline: true, and: [
				'isHorizontalFirst',
				{op: 'array', and: [{op: '-', and: 'rightX'}, {op: '-', and: 'rightY'}, 'topX', 'topY']},
				{op: 'array', and: ['topX', 'topY', {op: '-', and: 'rightX'}, {op: '-', and: 'rightY'}]},
			],
		}},
		'',
		{op: '=', id: ['secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped'], and: {
			op: 'call', id: 'getSecond', and: ['firstZoom', 'firstEndXFlipped', 'firstEndYFlipped', 'secondZoom', 'offsetXFlipped', 'offsetYFlipped'],
		}},
		'',
		{op: 'return', and: {
			op: '?', multiline: true, and: [
				{op: 'call', id: 'getDoFlip', and: ['firstEndX', 'firstEndY', 'secondX', 'secondY', 'thirdX', 'thirdY', 'thirdEndX']},
				{op: 'array', multiline: [2, 4, 4, 8, 8], and: [
					'firstZoom', 'secondZoom',
					{op: '-', and: 'firstEndXFlipped'}, {op: '-', and: 'firstEndYFlipped'},
					'firstEndXFlipped', 'firstEndYFlipped',
					'firstEndX', 'firstEndY',
					'firstEndX', 'firstEndY',
					{op: '-', and: 'secondXFlipped'}, {op: '-', and: 'secondYFlipped'}, {op: '-', and: 'secondEndXFlipped'}, {op: '-', and: 'secondEndYFlipped'},
					'secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped',
					'secondX', 'secondY', 'secondEndX', 'secondEndY',
					'secondX', 'secondY', 'secondEndX', 'secondEndY',
				]},
				{op: 'array', multiline: [2, 4, 4, 8, 8], and: [
					'firstZoom', 'secondZoom',
					'firstEndX', 'firstEndY',
					'firstEndX', 'firstEndY',
					{op: '-', and: 'firstEndXFlipped'}, {op: '-', and: 'firstEndYFlipped'},
					'firstEndXFlipped', 'firstEndYFlipped',
					'secondX', 'secondY', 'secondEndX', 'secondEndY',
					'secondX', 'secondY', 'secondEndX', 'secondEndY',
					{op: '-', and: 'secondXFlipped'}, {op: '-', and: 'secondYFlipped'}, {op: '-', and: 'secondEndXFlipped'}, {op: '-', and: 'secondEndYFlipped'},
					'secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped',
				]},
			],
		}},
	]},
	{op: 'func', id: 'getFixed', args: [
		'thirdZoom', 'thirdX', 'thirdY', 'cornerX',
		'firstZoom', 'firstEndX', 'firstEndY', 'firstEndXFlipped', 'firstEndYFlipped',
		'secondZoom', 'secondX', 'secondY', 'secondEndX', 'secondEndY',
		'secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped',
	], multiline: [4, 5, 5, 4], type: [
		'zoom', 'x', 'y', 'xvp', 'yvp',,,
		'x', 'y', 'x', 'y',
	], multilineResult: [4, 5, 5, 4], pair: [,2, 1, 4, 3,,,8, 7, 10, 9], and: [
		{op: 'if', and: [
			{op: '>=', and: ['thirdZoom', 'secondZoom']},
			{op: 'return', and: {op: 'array', and: [
				'thirdZoom', 'thirdX', 'thirdY', 'firstEndX', 'firstEndY',
				true, false, 'secondX', 'secondY', 'secondEndX', 'secondEndY',
			]}},
		]},
		'',
		{op: '=', id: ['thirdZoomFlipped', 'thirdXFlipped', 'thirdYFlipped'], and: {
			op: 'call', id: 'getIntersection', and: [
				'thirdZoom', 'thirdX', 'thirdY', 'cornerX', 0.5,
				'secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped',
			],
		}},
		'',
		{op: 'if', and: [
			{op: '>=', and: ['thirdZoomFlipped', 'secondZoom']},
			{op: 'return', and: {op: 'array', and: [
				'thirdZoomFlipped', 'thirdXFlipped', 'thirdYFlipped', 'firstEndXFlipped', 'firstEndYFlipped',
				true, true, 'secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped',
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: '...', and: {
				op: 'call', id: 'getIntersection', and: [
					'thirdZoom', 'thirdX', 'thirdY', 'cornerX', 0.5,
					'firstZoom', 0, 0, 'firstEndX', 'firstEndY',
				],
			}},
			'firstEndX', 'firstEndY',
		]}},
	]},
	{op: 'func', id: 'getAll', type: [
		'zoom', 'x', 'y', 'zoom', 'x', 'y',
		'zoom', 'xvp', 'yvp', 'xvp', 'yvp',
		'zoom',,,
		'x', 'y', 'x', 'y',,
		'x', 'y', 'x', 'y',
	], multilineResult: [3, 3, 5, 2, 5, 5], pair: [,2, 1,,5, 4,,8, 7, 10, 9,,,14, 13, 16, 15,,19, 18, 21, 20], args: ['isEvenQuadrant'], and: [
		{op: '=', id: ['zoomSide', 'zoomBase'], and: {
			op: 'call', id: 'getStartZooms',
		}},
		'',
		{op: '=', id: ['rightX', 'rightY', 'topX', 'topY'], and: {
			op: 'call', id: 'getViewportPoints', and: ['zoomSide', 'zoomBase'],
		}},
		'',
		{op: '=', id: 'quadrantAngle', type: 'angle', and: {
			op: 'call', id: 'getQuadrantAngle', and: ['isEvenQuadrant'],
		}},
		'',
		{op: '=', multiline: 3, id: [
			'axisIntersectZoomSide', 'axisIntersectXSide', 'axisIntersectYSide',
			'axisIntersectZoomBase', 'axisIntersectXBase', 'axisIntersectYBase',
		], and: {
			op: 'call', id: 'getAxisIntersects', and: ['isEvenQuadrant', 'quadrantAngle'],
		}},
		'',
		{op: '=', id: ['cornerXSide', 'cornerXBase'], type: ['x', 'x'], and: {
			op: '?', and: ['isEvenQuadrant', {op: 'array', and: [-0.5, 0.5]}, {op: 'array', and: [0.5, -0.5]}],
		}},
		'',
		{op: '=', id: [
			'firstZoom', 'secondZoom',
			'firstEndXSide', 'firstEndYSide',
			'firstEndXBase', 'firstEndYBase',
			// todo shorten names by using symbols
			//  maybe there's some math symbol you can use for mirror images
			//  top & right can just be arrows
			'firstEndXSideFlipped', 'firstEndYSideFlipped',
			'firstEndXBaseFlipped', 'firstEndYBaseFlipped',
			'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
			'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
			'secondXSideFlipped', 'secondYSideFlipped', 'secondEndXSideFlipped', 'secondEndYSideFlipped',
			'secondXBaseFlipped', 'secondYBaseFlipped', 'secondEndXBaseFlipped', 'secondEndYBaseFlipped',
		], and: {
			op: 'call', id: 'getShared', and: [
				'isEvenQuadrant', 'zoomSide', 'zoomBase', 'rightX', 'rightY', 'topX', 'topY',
				'axisIntersectXSide', 'axisIntersectYSide', 'axisIntersectXBase', 'axisIntersectYBase',
				'cornerXSide', 'cornerXBase',
			],
		}},
		'',
		{op: '=', id: ['thirdZoomSide', 'thirdXSide', 'thirdYSide'], and: {
			op: 'call', id: 'getIntersection', and: [
				'axisIntersectZoomSide', 'axisIntersectXSide', 'axisIntersectYSide', 'cornerXSide', 0.5,
				'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
			],
		}},
		{op: '=', id: ['thirdZoomBase', 'thirdXBase', 'thirdYBase'], and: {
			op: 'call', id: 'getIntersection', and: [
				'axisIntersectZoomBase', 'axisIntersectXBase', 'axisIntersectYBase', 'cornerXBase', 0.5,
				'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
			],
		}},
		'',
		{op: 'if', and: [
			{op: '&&', and: [
				{op: '<=', and: ['thirdZoomSide', 'secondZoom']},
				{op: '<=', and: ['thirdZoomBase', 'secondZoom']},
			]},
			{op: 'if', and: [
				{op: '>', and: [
					{op: 'abs', and: {op: '-', and: ['quadrantAngle', '¼π']}},
					'⅛π',
				]},
				{op: 'return', and: {op: 'array', multiline: [1, 1, 5], and: [
					{op: '...', and: {
						op: 'call', id: 'getIntersection', and: [
							'axisIntersectZoomSide', 'axisIntersectXSide', 'axisIntersectYSide', 'cornerXSide', 0.5,
							0, 0, 'firstEndXSide', 'firstEndYSide',
						],
					}},
					{op: '...', and: {
						op: 'call', id: 'getIntersection', and: [
							'axisIntersectZoomBase', 'axisIntersectXBase', 'axisIntersectYBase', 'cornerXBase', 0.5,
							0, 0, 'firstEndXBase', 'firstEndYBase',
						],
					}},
					'firstZoom', 'firstEndXSide', 'firstEndYSide', 'firstEndXBase', 'firstEndYBase',
				]}},
			]},
			'',
			{op: 'return', and: {op: 'array', multiline: [1, 1, 5, 2, 5, 5], and: [
				{op: '...', and: {
					op: 'call', id: 'getIntersection', multiline: 5, and: [
						'axisIntersectZoomSide', 'axisIntersectXSide', 'axisIntersectYSide', 'cornerXSide', 0.5,
						'secondXSideFlipped', 'secondYSideFlipped', 'secondEndXSideFlipped', 'secondEndYSideFlipped',
					],
				}},
				{op: '...', and: {
					op: 'call', id: 'getIntersection', multiline: 5, and: [
						'axisIntersectZoomBase', 'axisIntersectXBase', 'axisIntersectYBase', 'cornerXBase', 0.5,
						'secondXBaseFlipped', 'secondYBaseFlipped', 'secondEndXBaseFlipped', 'secondEndYBaseFlipped',
					],
				}},
				'firstZoom', 'firstEndXSideFlipped', 'firstEndYSideFlipped', 'firstEndXBaseFlipped', 'firstEndYBaseFlipped',
				'secondZoom', false,
				true, 'secondXSideFlipped', 'secondYSideFlipped', 'secondEndXSideFlipped', 'secondEndYSideFlipped',
				true, 'secondXBaseFlipped', 'secondYBaseFlipped', 'secondEndXBaseFlipped', 'secondEndYBaseFlipped',
			]}},
		]},
		'',
		{op: 'if', and: [
			{op: '<=', and: ['thirdZoomBase', 'thirdZoomSide']},
			{op: '=', multiline: [5, 6], id: [
				'thirdZoomFixed', 'thirdXFixed', 'thirdYFixed', 'firstEndXFixed', 'firstEndYFixed',
				'hasSecondFixed', 'secondIsFlipped', 'secondXFixed', 'secondYFixed', 'secondEndXFixed', 'secondEndYFixed',
			], and: {
				op: 'call', id: 'getFixed', and: [
					'thirdZoomBase', 'thirdXBase', 'thirdYBase', 'cornerXBase',
					'firstZoom', 'firstEndXBase', 'firstEndYBase',
					'firstEndXBaseFlipped', 'firstEndYBaseFlipped',
					'secondZoom', 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
					'secondXBaseFlipped', 'secondYBaseFlipped', 'secondEndXBaseFlipped', 'secondEndYBaseFlipped',
				],
			}},
			'',
			{op: 'return', and: {op: 'array', multiline: [3, 3, 5, 2, 5, 5], and: [
				'thirdZoomSide', 'thirdXSide', 'thirdYSide',
				'thirdZoomFixed', 'thirdXFixed', 'thirdYFixed',
				'firstZoom', 'firstEndXSide', 'firstEndYSide', 'firstEndXFixed', 'firstEndYFixed',
				'secondZoom', 'secondIsFlipped',
				true, 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
				'hasSecondFixed', 'secondXFixed', 'secondYFixed', 'secondEndXFixed', 'secondEndYFixed',
			]}},
		]},
		'',
		{op: '=', id: [
			'thirdZoomFixed', 'thirdXFixed', 'thirdYFixed', 'firstEndXFixed', 'firstEndYFixed',
			'hasSecondFixed', 'secondIsFlipped', 'secondXFixed', 'secondYFixed', 'secondEndXFixed', 'secondEndYFixed',
		], and: {
			op: 'call', id: 'getFixed', and: [
				'thirdZoomSide', 'thirdXSide', 'thirdYSide', 'cornerXSide',
				'firstZoom', 'firstEndXSide', 'firstEndYSide',
				'firstEndXSideFlipped', 'firstEndYSideFlipped',
				'secondZoom', 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
				'secondXSideFlipped', 'secondYSideFlipped', 'secondEndXSideFlipped', 'secondEndYSideFlipped',
			],
		}},
		'',
		{op: 'return', and: {op: 'array', multiline: [3, 3, 5, 2, 5, 5], and: [
			'thirdZoomFixed', 'thirdXFixed', 'thirdYFixed',
			'thirdZoomBase', 'thirdXBase', 'thirdYBase',
			'firstZoom', 'firstEndXFixed', 'firstEndYFixed', 'firstEndXBase', 'firstEndYBase',
			'secondZoom', 'secondIsFlipped',
			'hasSecondFixed', 'secondXFixed', 'secondYFixed', 'secondEndXFixed', 'secondEndYFixed',
			true, 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
		]}},
	]},
	{op: 'func', id: 'getZoomPoints', type: [
		'zoom', 'x', 'y', 'zoom', 'x', 'y',
		'zoom', 'xvp', 'yvp', 'xvp', 'yvp',
		'zoom',,,
		'x', 'y', 'x', 'y',,
		'x', 'y', 'x', 'y',
	], multilineResult: [3, 3, 5, 2, 5, 5], pair: [,2, 1,,5, 4,,8, 7, 10, 9,,,,15, 14, 17, 18,,20, 19, 22, 21], and: [
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
		'',
		{op: '=', id: [
			'thirdZoomSide', 'thirdXSide', 'thirdYSide', 'thirdZoomBase', 'thirdXBase', 'thirdYBase',
			'firstZoom', 'firstEndXSide', 'firstEndYSide', 'firstEndXBase', 'firstEndYBase',
			'secondZoom', 'secondIsFlipped',
			'hasSecondSide', 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
			'hasSecondBase', 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
		], and: {op: 'call', id: 'getAll', and: ['isEvenQuadrant']}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', and: {op: 'array', multiline: [3, 3, 5, 2, 5, 5], and: [
				'thirdZoomSide', 'thirdXSide', 'thirdYSide',
				'thirdZoomBase', 'thirdXBase', 'thirdYBase',
				'firstZoom', 'firstEndXSide', 'firstEndYSide', 'firstEndXBase', 'firstEndYBase',
				'secondZoom', 'secondIsFlipped',
				'hasSecondSide', 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
				'hasSecondBase', 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: [3, 3, 5, 2, 5, 5], and: [
			'thirdZoomBase', 'thirdXBase', 'thirdYBase', 'thirdZoomSide', 'thirdXSide', 'thirdYSide',
			'firstZoom', 'firstEndXBase', 'firstEndYBase', 'firstEndXSide', 'firstEndYSide',
			'secondZoom', 'secondIsFlipped',
			'hasSecondBase', 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
			'hasSecondSide', 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
		]}},
	]},
	{op: 'func', id: 'getBound', multiline: [4, 3, 6], type: ['x', 'y'], pair: [1, 0], args: [
		'thirdZoom', 'thirdX', 'thirdY', 'thirdEndX',
		'firstZoom', 'firstEndX', 'firstEndY',
		'secondZoom', 'hasSecond', 'secondX', 'secondY', 'secondEndX', 'secondEndY',
	], and: [
		{op: 'if', and: [
			{op: '<=', and: ['zoom', 'firstZoom']},
			{op: 'return', and: {op: 'array', and: [0, 0]}},
		]},
		'',
		{op: 'if', and: [
			{op: '<=', and: ['zoom', 'thirdZoom']},
			{op: 'if', and: [
				{op: '||', and: [
					{op: '!', and: 'hasSecond'},
					{op: '<=', and: ['zoom', 'secondZoom']},
				]},
				{op: 'return', and: {
					op: 'call', id: 'getProgressed', and: [0, 0, 'firstEndX', 'firstEndY', 'firstZoom', 'zoom'],
				}},
			]},
			'',
			{op: 'return', and: {
				op: 'call', id: 'getProgressed', and: ['secondX', 'secondY', 'secondEndX', 'secondEndY', 'secondZoom', 'zoom'],
			}},
		]},
		'',
		{op: '=', id: 'progress', and: {
			op: '/', and: ['zoom', 'thirdZoom'],
		}},
		'',
		{op: 'return', and: {op: 'array', and: [
			{op: '-', and: [
				'thirdEndX',
				{op: '/', and: [
					{op: '-', and: ['thirdEndX', 'thirdX']},
					'progress',
				]},
			]},
			{op: '-', and: [
				0.5,
				{op: '/', and: [
					{op: '-', and: [0.5, 'thirdY']},
					'progress',
				]},
			]},
		]}},
	]},
	{op: 'func', id: 'getDirected', type: [
		'zoom', 'x', 'y', 'x', 'y',
		'zoom', 'x', 'y', 'x', 'y',
	], pair: [,2, 1, 4, 3,,7, 6, 9, 8], args: [
		'flip',
		'thirdZoom', 'thirdX', 'thirdY', 'thirdEndX',
		'firstZoom', 'firstEndX', 'firstEndY',
		'secondZoom', 'hasSecond', 'secondX', 'secondY', 'secondEndX', 'secondEndY',
	], multiline: [1, 4, 3, 6], and: [
		{op: '=', id: ['zoom0', 'fromX0', 'fromY0', 'toX0', 'toY0'], and: {
			op: '?', multiline: true, and: [
				'hasSecond',
				{op: 'array', and: ['secondZoom', 'secondX', 'secondY', 'secondEndX', 'secondEndY']},
				{op: 'array', and: ['firstZoom', 0, 0, 'firstEndX', 'firstEndY']},
			],
		}},
		'',
		{op: 'return', and: {
			op: '?', multiline: true, and: [
				'flip',
				{op: 'array', multiline: 5, and: [
					'zoom0', {op: '-', and: 'fromX0'}, {op: '-', and: 'fromY0'}, {op: '-', and: 'toX0'}, {op: '-', and: 'toY0'},
					'thirdZoom', {op: '-', and: 'thirdX'}, {op: '-', and: 'thirdY'}, {op: '-', and: 'thirdEndX'}, -0.5,
				]},
				{op: 'array', multiline: 5, and: [
					'zoom0', 'fromX0', 'fromY0', 'toX0', 'toY0',
					'thirdZoom', 'thirdX', 'thirdY', 'thirdEndX', 0.5,
				]},
			],
		}},
	]},
	{op: 'func', id: 'getPairings', type: [
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',,
		'zoom', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y',
	], pair: [,2, 1, 4, 3, 6, 5, 8, 7,,11, 10, 13, 12, 15, 14, 17, 16,,,21, 20, 23, 22, 25, 24, 27, 26], args: ['flip0', 'flip1'], and: [
		{op: '=', multiline: 2, id: [
			'zoomLow0', 'fromXLow0', 'fromYLow0', 'toXLow0', 'toYLow0',
			'zoomHigh0', 'fromXHigh0', 'fromYHigh0', 'toXHigh0', 'toYHigh0',
		], and: {
			op: 'call', id: 'getDirected', and: [
				'flip0',
				'thirdZoom0', 'thirdX0', 'thirdY0', -0.5,
				'firstZoom', 'firstEndX0', 'firstEndY0',
				'secondZoom', 'hasSecond0', 'secondX0', 'secondY0', 'secondEndX0', 'secondEndY0',
			],
		}},
		{op: '=', multiline: 2, id: [
			'zoomLow1', 'fromXLow1', 'fromYLow1', 'toXLow1', 'toYLow1',
			'zoomHigh1', 'fromXHigh1', 'fromYHigh1', 'toXHigh1', 'toYHigh1',
		], and: {
			op: 'call', id: 'getDirected', and: [
				'flip1',
				'thirdZoom1', 'thirdX1', 'thirdY1', 0.5,
				'firstZoom', 'firstEndX1', 'firstEndY1',
				'secondZoom', 'hasSecond1', 'secondX1', 'secondY1', 'secondEndX1', 'secondEndY1',
			],
		}},
		'',
		{op: '=', id: [
			'zoomC', 'x0C', 'y0C', 'xEnd0C', 'yEnd0C', 'x1C', 'y1C', 'xEnd1C', 'yEnd1C',
			'zoomB', 'x0B', 'y0B', 'xEnd0B', 'yEnd0B', 'x1B', 'y1B', 'xEnd1B', 'yEnd1B',
		], and: {
			op: '?', multiline: true, and: [
				{op: '>=', and: ['thirdZoom0', 'thirdZoom1']},
				{op: 'array', multiline: [1, 4, 3, 1, 3, 4], and: [
					'thirdZoom0',
					'fromXHigh0', 'fromYHigh0', 'toXHigh0', 'toYHigh0',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [
						'fromXHigh1', 'fromYHigh1', 'toXHigh1', 'toYHigh1', 'zoomHigh1', 'thirdZoom0',
					]}},
					'toXHigh1', 'toYHigh1',
					'thirdZoom1',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [
						'fromXLow0', 'fromYLow0', 'toXLow0', 'toYLow0', 'zoomLow0', 'thirdZoom1',
					]}},
					'toXLow0', 'toYLow0',
					'fromXHigh1', 'fromYHigh1', 'toXHigh1', 'toYHigh1',
				]},
				{op: 'array', multiline: [1, 3, 4, 1, 4, 3], and: [
					'thirdZoom1',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [
						'fromXHigh0', 'fromYHigh0', 'toXHigh0', 'toYHigh0', 'zoomHigh0', 'thirdZoom1',
					]}},
					'toXHigh0', 'toYHigh0',
					'fromXHigh1', 'fromYHigh1', 'toXHigh1', 'toYHigh1',
					'thirdZoom0',
					'fromXHigh0', 'fromYHigh0', 'toXHigh0', 'toYHigh0',
					{op: '...', and: {op: 'call', id: 'getProgressed', and: [
						'fromXLow1', 'fromYLow1', 'toXLow1', 'toYLow1', 'zoomLow1', 'thirdZoom0',
					]}},
					'toXLow1', 'toYLow1',
				]},
			],
		}},
		'',
		{op: 'if', and: [
			{op: '!', and: 'hasSecond0'},
			{op: 'return', and: {op: 'array', multiline: [9, 9, 2, 3, 4], and: [
				'zoomC', 'x0C', 'y0C', 'xEnd0C', 'yEnd0C', 'x1C', 'y1C', 'xEnd1C', 'yEnd1C',
				'zoomB', 'x0B', 'y0B', 'xEnd0B', 'yEnd0B', 'x1B', 'y1B', 'xEnd1B', 'yEnd1B',
				true, 'secondZoom',
				{op: '...', and: {op: 'call', id: 'getProgressed', and: [
					'fromXLow0', 'fromYLow0', 'toXLow0', 'toYLow0', 'zoomLow0', 'secondZoom',
				]}},
				'toXLow0', 'toYLow0',
				'fromXHigh1', 'fromYHigh1', 'toXHigh1', 'toYHigh1',
			]}},
		]},
		'',
		{op: 'if', and: [
			{op: '!', and: 'hasSecond1'},
			{op: 'return', and: {op: 'array', multiline: [9, 9, 2, 4, 3], and: [
				'zoomC', 'x0C', 'y0C', 'xEnd0C', 'yEnd0C', 'x1C', 'y1C', 'xEnd1C', 'yEnd1C',
				'zoomB', 'x0B', 'y0B', 'xEnd0B', 'yEnd0B', 'x1B', 'y1B', 'xEnd1B', 'yEnd1B',
				true, 'secondZoom',
				'fromXHigh0', 'fromYHigh0', 'toXHigh0', 'toYHigh0',
				{op: '...', and: {op: 'call', id: 'getProgressed', and: [
					'fromXLow1', 'fromYLow1', 'toXLow1', 'toYLow1', 'zoomLow1', 'secondZoom',
				]}},
				'toXLow1', 'toYLow1',
			]}},
		]},
		'',
		{op: 'if', and: [
			'secondIsFlipped',
			{op: 'return', and: {op: 'array', multiline: [9, 9, 2, 4, 4], and: [
				'zoomC', 'x0C', 'y0C', 'xEnd0C', 'yEnd0C', 'x1C', 'y1C', 'xEnd1C', 'yEnd1C',
				'zoomB', 'x0B', 'y0B', 'xEnd0B', 'yEnd0B', 'x1B', 'y1B', 'xEnd1B', 'yEnd1B',
				true, 'secondZoom',
				'fromXLow0', 'fromYLow0', 'toXLow0', 'toYLow0',
				'fromXLow1', 'fromYLow1', 'toXLow1', 'toYLow1',
			]}},
		]},
		'',
		{op: 'return', and: {op: 'array', multiline: 9, and: [
			'zoomC', 'x0C', 'y0C', 'xEnd0C', 'yEnd0C', 'x1C', 'y1C', 'xEnd1C', 'yEnd1C',
			'zoomB', 'x0B', 'y0B', 'xEnd0B', 'yEnd0B', 'x1B', 'y1B', 'xEnd1B', 'yEnd1B',
		]}},
	]},
	{op: 'func', id: 'getZoom', args: ['flip0', 'flip1', 'isInverse'], type: 'zoom', and: [
		{op: '=', multiline: [9, 9, 10], id: [
			'zoomC', 'fromX0C', 'fromY0C', 'toX0C', 'toY0C', 'fromX1C', 'fromY1C', 'toX1C', 'toY1C',
			'zoomB', 'fromX0B', 'fromY0B', 'toX0B', 'toY0B', 'fromX1B', 'fromY1B', 'toX1B', 'toY1B',
			'hasA', 'zoomA', 'fromX0A', 'fromY0A', 'toX0A', 'toY0A', 'fromX1A', 'fromY1A', 'toX1A', 'toY1A',
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
				{op: '?', and: [
					'hasA',
					{op: 'call', id: 'getIntersectZoom', and: [
						'zoomA', 'fromX0A', 'fromY0A', 'toX0A', 'toY0A', 'fromX1A', 'fromY1A', 'toX1A', 'toY1A', 'isInverse', {
							op: '-', and: [
								1,
								{op: '/', and: ['zoomA', 'zoomB']},
							],
						},
					]},
					0,
				]},
			],
		}},
	]},
];

export default {
	System,
	start() {
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
			content: 'Tripled Down',
			style: {textAlign: 'center'},
		},
		'So single-line rails don\'t work too well, double-line has issues... is third line the charm?',
		[
			'The prior system can be fixed by adding a "connecting rail" between the others.',
			'This rail can be used to ensure the preferred origin rail direction is usable.',
			'Like in the prior system, origin rail start zoom depends on when the first pair of image corners first contacts the viewport rim.',
			'Connecting rail start zoom is similar, but depends on the remaining pair of image corners.',
			'Connecting rails are directed at viewport corners to keep both image corners visible.',
		],
		[
			'It\'s possible for a lock rail to intersect with its origin rail before its connector.',
			'In these instances, the connector is discarded.',
		],
		{
			tag: 'h2',
			content: 'Pan-Limit Maths',
			style: {textAlign: 'center'},
		},
		// todo
		getCode(code, [
			{op: '=', id: [
				'thirdZoom0', 'thirdX0', 'thirdY0', 'thirdZoom1', 'thirdX1', 'thirdY1',
				'firstZoom', 'firstEndX0', 'firstEndY0', 'firstEndX1', 'firstEndY1',
				'secondZoom', 'secondIsFlipped',
				'hasSecond0', 'secondX0', 'secondY0', 'secondEndX0', 'secondEndY0',
				'hasSecond1', 'secondX1', 'secondY1', 'secondEndX1', 'secondEndY1',
			], and: {
				op: 'call', id: 'getZoomPoints',
			}},
			'',
			{op: '=', id: ['topLeftX', 'topLeftY'], and: {
				op: 'call', id: 'getBound', and: [
					'thirdZoom0', 'thirdX0', 'thirdY0', -0.5,
					'firstZoom', 'firstEndX0', 'firstEndY0',
					'secondZoom', 'hasSecond0', 'secondX0', 'secondY0', 'secondEndX0', 'secondEndY0',
				],
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
				op: 'call', id: 'getBound', and: [
					'thirdZoom1', 'thirdX1', 'thirdY1', 0.5,
					'firstZoom', 'firstEndX1', 'firstEndY1',
					'secondZoom', 'hasSecond1', 'secondX1', 'secondY1', 'secondEndX1', 'secondEndY1',
				],
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
			'All of the prior system\'s pan-limiting flaws are fixed.',
			'Bound changes are now perfectly fluid, providing a more consistent and reliable experience.',
			'Besides patching issues, the connecting rails even enhance the system\'s ability to show two corners simultaneously!',
		],
		[
			'I find this system to be a satisfactory improvement over "Double-Line" too.',
			'It provides tighter pan-limits without sacrificing image visibility.',
			'The changes have been successful in facilitating efficient panning paths.',
		],
		[
			'Zoomful systems have unavoidable drawbacks.',
			'Bounds are less inheritently less intuitive when they move around, and, especially when handling rotation, users are granted less viewfinding freedom.',
			'Plus, there\'s obviously a huge efficiency dropoff from the good old days of',
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
		[
			'to the monster we have here.',
			'Because of this, I still prefer "Viewport Center" as a pan-limiter.',
		],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		// todo
		getCode(code, [
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
			'This system is fixes the prior system\'s inconsistency;',
			'I\'d be comfortable calling it an improved snap-panning system.',
			'"Double-Line", on the other hand, has no obvious flaw to fix.',
			'Since both exhibit acceptable behaviour, Double-Line\'s efficiency makes the preferable standalone snap-panner.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'We did it!',
			'Presented here is a system that succeeds on both fronts.',
			'Like I mentioned at the start of our rotation odyssey, it\'s much harder to identify "perfect" behaviour here than with the early systems.',
			'No doubt a different approach could produce a better system, but this one lacks an obvious flaw.',
		],
		[
			'Although this page represents the culmination of my labour, it\'s more conceptually interesting than practically useful.',
			'Nevertheless, I\'m glad to have done the work.',
			'This all started from an idea for a userscript and a feeling that I ',
			{
				tag: 'i',
				content: 'should',
			},
			' be able to code it.',
			'From there, fixation became obsession and my project\'s scope ballooned way beyond what was sensible.',
			'Still, having broke the surface of this abyss, I\'m proud to have pushed my limits so far.',
		],
		{style: {textAlign: 'center', font: '1.8em EnsuredVinerHandITC'}, content: 'Thanks for reading ✌'},
	),
};
