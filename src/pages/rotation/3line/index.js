import {DEGREES} from '@/shared';

import {MULTI_LINE as SHARED_FUNCTIONS} from '../code';
import {register as registerFunctions} from '../../code';
import {getText, getCode, getButton, registerDemo} from '../../shared';

import Demo from './demo';

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getGenericIntersection', args: ['from0X', 'from0Y', 'to0X', 'to0Y', 'from1X', 'from1Y', 'to1X', 'to1Y'], type: ['x', 'y'], pair: [1, 0], and: [
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
		{op: 'return', and: [
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
		]},
	]},
	{op: 'func', id: 'getIntersection', args: ['zoom0', 'from0X', 'from0Y', 'to0X', 'to0Y', 'from1X', 'from1Y', 'to1X', 'to1Y'], type: ['zoom', 'x', 'y'], pair: [1, 0], and: [
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
		{op: 'return', and: [
			{op: '/', and: [
				'zoom0',
				{op: '-', and: [1, 'progress']},
			]},
			'intersectX',
			'intersectY',
		]},
	]},
	{op: 'func', id: 'getProgressedMiddle', args: ['x', 'y', 'zoom0', 'zoom1'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: '=', id: 'mult', and: {
			op: '/', and: ['zoom0', 'zoom1'],
		}},
		'',
		{op: 'return', and: [
			{op: '*', and: ['x', 'mult']},
			{op: '*', and: ['y', 'mult']},
		]},
	]},
	{op: 'func', id: 'getSecond', args: ['firstZoom', 'firstEndX', 'firstEndY', 'secondZoom', 'offsetX', 'offsetY'], type: ['x', 'y', 'x', 'y'], pair: [1, 0, 3, 2], and: [
		{op: '=', id: ['secondX', 'secondY'], type: ['x', 'y'], and: {
			op: 'call', id: 'getProgressed', and: [0, 0, 'firstEndX', 'firstEndY', 'firstZoom', 'secondZoom'],
		}},
		{op: '=', id: 'mult', and: {
			op: '/', and: ['firstZoom', 'secondZoom'],
		}},
		'',
		{op: 'return', and: [
			'secondX', 'secondY',
			{op: '+', and: [{op: '*', and: ['firstEndX', 'mult']}, 'offsetX', 'secondX']},
			{op: '+', and: [{op: '*', and: ['firstEndY', 'mult']}, 'offsetY', 'secondY']},
		]},
	]},
	{op: 'func', id: 'getXIntersect', args: ['viewportSize', 'cornerAngle', 'progressAngle'], type: ['x', 'zoom'], and: [
		{op: 'return', multiline: true, and: [
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
		]},
	]},
	{op: 'func', id: 'getAxisIntersects', args: ['isEvenQuadrant'], type: ['x', 'y', 'x', 'y'], pair: [1, 0, 3, 2], and: [
		{op: '=', id: 'quadrantAngle', type: 'angle', and: {
			op: 'call', id: 'getQuadrantAngle', and: ['isEvenQuadrant'],
		}},
		'',
		{op: '=', id: ['angleBase', 'angleSide'], and: {
			op: 'call', id: 'getProgressAngles', and: ['quadrantAngle'],
		}},
		'',
		{op: 'if', and: [
			{op: '>=', and: ['isEvenQuadrant', '¼π']},
			{op: 'return', multiline: true, and: [
				0,
				{op: '...', and: {
					op: 'call', id: 'getYIntersect', multiline: true, and: [
						'½viewportWidth',
						{op: '+', and: ['quadrantAngle', 'angleSide']},
						'angleSide',
					],
				}},
				0,
				{op: '...', and: {
					op: 'call', id: 'getYIntersect', multiline: true, and: [
						'½viewportHeight',
						{op: '-', and: ['½π', 'quadrantAngle', 'angleBase']},
						'angleBase',
					],
				}},
			]},
		]},
		'',
		// todo make functions that don't return zoom
		{op: '=', id: ['axisIntersectSideX'], and: {
			op: 'call', id: 'getXIntersect', multiline: true, and: [
				'½viewportWidth',
				{op: '-', and: ['½π', 'quadrantAngle', 'angleSide']},
				'angleSide',
			],
		}},
		{op: '=', id: ['axisIntersectBaseX'], and: {
			op: 'call', id: 'getXIntersect', multiline: true, and: [
				'½viewportHeight',
				{op: '+', and: ['quadrantAngle', 'angleBase']},
				'angleBase',
			],
		}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', multiline: 2, and: [
				{op: '-', and: 'axisIntersectSideX'}, 0,
				'axisIntersectBaseX', 0,
			]},
		]},
		'',
		{op: 'return', multiline: 2, and: [
			'axisIntersectSideX', 0,
			{op: '-', and: 'axisIntersectBaseX'}, 0,
		]},
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
			op: '==', multiline: true, and: [
				{op: '==', and: [
					{op: '>', and: ['mFirst', 0]},
					{op: '<', and: ['mThird', 'mFirst']},
				]},
				{op: '?', and: [
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
	], pair: [,,3, 2, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14, 17, 16, 19, 18, 21, 20, 23, 22, 25, 24], args: [
		'isEvenQuadrant', 'zoomSide', 'zoomBase', 'rightXRaw', 'rightYRaw', 'topXRaw', 'topYRaw',
		'axisIntersectXSide', 'axisIntersectYSide', 'axisIntersectXBase', 'axisIntersectYBase',
		'cornerXSide', 'cornerXBase',
	], and: [
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
		{op: '=', id: ['firstZoom', 'secondZoom', 'firstEndX', 'firstEndY', 'offsetX', 'offsetY', 'thirdX', 'thirdY', 'thirdEndX'], and: {
			op: '?', and: [
				'isHorizontalFirst',
				{op: 'array', and: ['zoomSide', 'zoomBase', 'rightX', 'rightY', 'topX', 'topY', 'axisIntersectXSide', 'axisIntersectYSide', 'cornerXSide']},
				{op: 'array', and: ['zoomBase', 'zoomSide', 'topX', 'topY', 'rightX', 'rightY', 'axisIntersectXBase', 'axisIntersectYBase', 'cornerXBase']},
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
				{op: 'array', and: [
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
				{op: 'array', and: [
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
		'firstZoom', 'firstEndX', 'firstEndY',
		'firstEndXFlipped', 'firstEndYFlipped',
		'secondZoom', 'secondX', 'secondY', 'secondEndX', 'secondEndY',
		'secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped',
	], type: [
		'zoom', 'x', 'y', 'xvp', 'yvp',,
		'x', 'y', 'x', 'y',
	], pair: [,2, 1, 4, 3,,7, 6, 9, 8], and: [
		{op: 'if', and: [
			{op: '>=', and: ['thirdZoom', 'secondZoom']},
			{op: 'return', and: [
				'thirdZoom', 'thirdX', 'thirdY', 'firstEndX', 'firstEndY',
				true, 'secondX', 'secondY', 'secondEndX', 'secondEndY',
			]},
		]},
		'',
		{op: '=', id: ['thirdZoomFlipped', 'thirdXFlipped', 'thirdYFlipped'], and: {
			op: 'call', id: 'getIntersection', and: [
				'secondZoom', 'secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped',
				'thirdX', 'thirdY', 'cornerX', 0.5,
			],
		}},
		'',
		{op: 'if', and: [
			{op: '>=', and: ['thirdZoomFlipped', 'secondZoom']},
			{op: 'return', and: [
				'thirdZoomFlipped', 'thirdXFlipped', 'thirdYFlipped', 'firstEndXFlipped', 'firstEndYFlipped',
				true, 'secondXFlipped', 'secondYFlipped', 'secondEndXFlipped', 'secondEndYFlipped',
			]},
		]},
		'',
		{op: 'return', and: [
			{op: '...', and: {
				op: 'call', id: 'getIntersection', and: [
					'firstZoom', 0, 0, 'firstEndX', 'firstEndY',
					'thirdX', 'thirdY', 'cornerX', 0.5,
				],
			}},
			'firstEndX', 'firstEndY',
		]},
	]},
	{op: 'func', id: 'getAll', type: [
		'zoom', 'x', 'y', 'zoom', 'x', 'y',
		'zoom', 'xvp', 'yvp', 'xvp', 'yvp',
		'zoom',,
		'x', 'y', 'x', 'y',,
		'x', 'y', 'x', 'y',
	], pair: [,2, 1,,5, 4,,8, 7, 10, 9,,,14, 13, 16, 15,,19, 18, 21, 20], args: ['isEvenQuadrant'], and: [
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
			'axisIntersectXSide', 'axisIntersectYSide',
			'axisIntersectXBase', 'axisIntersectYBase',
		], and: {
			op: 'call', id: 'getAxisIntersects', and: ['quadrantAngle'],
		}},
		'',
		{op: '=', id: ['cornerXSide', 'cornerXBase'], type: ['x', 'x'], and: {
			op: '?', and: ['isEvenQuadrant', {op: 'array', and: [-0.5, 0.5]}, {op: 'array', and: [0.5, -0.5]}],
		}},
		'',
		{op: '=', multiline: 18, id: [
			'firstZoom', 'secondZoom',
			'firstEndXSide', 'firstEndYSide',
			'firstEndXBase', 'firstEndYBase',
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
			op: 'call', id: 'getIntersection', multiline: 2, and: [
				'secondZoom', 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
				'axisIntersectXSide', 'axisIntersectYSide', 'cornerXSide', 0.5,
			],
		}},
		{op: '=', id: ['thirdZoomBase', 'thirdXBase', 'thirdYBase'], and: {
			op: 'call', id: 'getIntersection', multiline: 2, and: [
				'secondZoom', 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
				'axisIntersectXBase', 'axisIntersectYBase', 'cornerXBase', 0.5,
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
				{op: 'return', multiline: 2, and: [
					{op: '...', and: {
						op: 'call', id: 'getIntersection', and: [
							'firstZoom', 0, 0, 'firstEndXSide', 'firstEndYSide',
							'axisIntersectXSide', 'axisIntersectYSide', 'cornerXSide', 0.5,
						],
					}},
					{op: '...', and: {
						op: 'call', id: 'getIntersection', and: [
							'firstZoom', 0, 0, 'firstEndXBase', 'firstEndYBase',
							'axisIntersectXBase', 'axisIntersectYBase', 'cornerXBase', 0.5,
						],
					}},
					'firstZoom', 'firstEndXSide', 'firstEndYSide', 'firstEndXBase', 'firstEndYBase',
				]},
			]},
			'',
			// todo you need to implement bespoke multiline groups
			//  maybe via empty strings
			{op: 'return', and: [
				{op: '...', and: {
					op: 'call', id: 'getIntersection', and: [
						'secondZoom', 'secondXSideFlipped', 'secondYSideFlipped', 'secondEndXSideFlipped', 'secondEndYSideFlipped',
						'axisIntersectXSide', 'axisIntersectYSide', 'cornerXSide', 0.5,
					],
				}},
				{op: '...', and: {
					op: 'call', id: 'getIntersection', and: [
						'secondZoom', 'secondXBaseFlipped', 'secondYBaseFlipped', 'secondEndXBaseFlipped', 'secondEndYBaseFlipped',
						'axisIntersectXBase', 'axisIntersectYBase', 'cornerXBase', 0.5,
					],
				}},
				'firstZoom', 'firstEndXSideFlipped', 'firstEndYSideFlipped', 'firstEndXBaseFlipped', 'firstEndYBaseFlipped',
				'secondZoom',
				true, 'secondXSideFlipped', 'secondYSideFlipped', 'secondEndXSideFlipped', 'secondEndYSideFlipped',
				true, 'secondXBaseFlipped', 'secondYBaseFlipped', 'secondEndXBaseFlipped', 'secondEndYBaseFlipped',
			]},
		]},
		'',
		{op: 'if', and: [
			{op: '<=', and: ['thirdZoomBase', 'thirdZoomSide']},
			{op: '=', id: [
				'thirdZoomFixed', 'thirdXFixed', 'thirdYFixed', 'firstEndXFixed', 'firstEndYFixed',
				'hasSecondFixed', 'secondXFixed', 'secondYFixed', 'secondEndXFixed', 'secondEndYFixed',
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
			{op: 'return', and: [
				'thirdZoomSide', 'thirdXSide', 'thirdYSide', 'thirdZoomFixed', 'thirdXFixed', 'thirdYFixed',
				'firstZoom', 'firstEndXSide', 'firstEndYSide', 'firstEndXFixed', 'firstEndYFixed',
				'secondZoom',
				true, 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
				'hasSecondFixed', 'secondXFixed', 'secondYFixed', 'secondEndXFixed', 'secondEndYFixed',
			]},
		]},
		'',
		{op: '=', id: [
			'thirdZoomFixed', 'thirdXFixed', 'thirdYFixed', 'firstEndXFixed', 'firstEndYFixed',
			'hasSecondFixed', 'secondXFixed', 'secondYFixed', 'secondEndXFixed', 'secondEndYFixed',
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
		{op: 'return', and: [
			'thirdZoomFixed', 'thirdXFixed', 'thirdYFixed', 'thirdZoomBase', 'thirdXBase', 'thirdYBase',
			'firstZoom', 'firstEndXFixed', 'firstEndYFixed', 'firstEndXBase', 'firstEndYBase',
			'secondZoom',
			'hasSecondFixed', 'secondXFixed', 'secondYFixed', 'secondEndXFixed', 'secondEndYFixed',
			true, 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
		]},
	]},
	{op: 'func', id: 'getZoomPoints', type: [
		'zoom', 'x', 'y', 'zoom', 'x', 'y',
		'zoom', 'xvp', 'yvp', 'xvp', 'yvp',
		'zoom',,
		'x', 'y', 'x', 'y',,
		'x', 'y', 'x', 'y',
	], pair: [,2, 1,,5, 4,,8, 7, 10, 9,,,14, 13, 16, 15,,19, 18, 21, 20], and: [
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
		{op: '=', multiline: 4, id: [
			'thirdZoomSide', 'thirdXSide', 'thirdYSide', 'thirdZoomBase', 'thirdXBase', 'thirdYBase',
			'firstZoom', 'firstEndXSide', 'firstEndYSide', 'firstEndXBase', 'firstEndYBase',
			'secondZoom',
			'hasSecondSide', 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
			'hasSecondBase', 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
		], and: {op: 'call', id: 'getAll', and: ['isEvenQuadrant']}},
		'',
		{op: 'if', and: [
			'isEvenQuadrant',
			{op: 'return', multiline: 4, and: [
				'thirdZoomSide', 'thirdXSide', 'thirdYSide', 'thirdZoomBase', 'thirdXBase', 'thirdYBase',
				'firstZoom', 'firstEndXSide', 'firstEndYSide', 'firstEndXBase', 'firstEndYBase',
				'secondZoom',
				'hasSecondSide', 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
				'hasSecondBase', 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
			]},
		]},
		'',
		{op: 'return', multiline: 4, and: [
			'thirdZoomBase', 'thirdXBase', 'thirdYBase', 'thirdZoomSide', 'thirdXSide', 'thirdYSide',
			'firstZoom', 'firstEndXBase', 'firstEndYBase', 'firstEndXSide', 'firstEndYSide',
			'secondZoom',
			'hasSecondBase', 'secondXBase', 'secondYBase', 'secondEndXBase', 'secondEndYBase',
			'hasSecondSide', 'secondXSide', 'secondYSide', 'secondEndXSide', 'secondEndYSide',
		]},
	]},
];

export default (wrapper) => {
	const demo = new Demo();
	
	registerDemo(demo);
	registerFunctions(demo, functions);
	
	wrapper.append(
		demo.constructor.element,
		getText(
			{
				tag: 'h1',
				content: 'Triple-Line Rotation',
				style: {textAlign: 'center'},
			},
			'So 1 line doesn\'t work too well, 2 lines has issues... is third line the charm?',
			[
				'We can solve the 2-line panning issue by always using the preferred axis line, but adding a connector to the corner line.',
				'In this system, the connecting line keeps two image corners on the viewport\'s edge.',
				'It achieves this by starting as soon as an image corner would become unobservable and travelling directly towards a viewport corner.',
			],
			[
				'It\'s possible for corner lines to intersect with an axis line rather than the connector.',
				'In these instances, the axis line and the connector will have the same start zoom.',
			],
			{
				tag: 'h2',
				content: 'Pan-Limit Maths',
				style: {textAlign: 'center'},
			},
			getCode([
				{op: '=', multiline: 2, id: [
					'thirdZoom0', 'thirdX0', 'thirdY0', 'thirdZoom1', 'thirdX1', 'thirdY1',
					'firstZoom', 'firstEndX0', 'firstEndY0', 'firstEndX1', 'firstEndY1',
					'secondZoom',
					'hasSecond0', 'secondX0', 'secondY0', 'secondEndX0', 'secondEndY0',
					'hasSecond1', 'secondX1', 'secondY1', 'secondEndX1', 'secondEndY1',
				], and: {
					op: 'call', id: 'getZoomPoints',
				}},
			]),
			{
				tag: 'h2',
				content: 'Pan-Limit Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'Tradeoffs have been made regarding the system\'s best-case;',
				'Opportunities to take optimal panning paths to individual corners are rarer, but viewing adjacent corners simultaneously is now possible at higher zooms.',
				'Its worse-case, on the other hand, is leagues ahead, always expanding bounds sensibly and excelling on extreme aspect ratios.',
			],
			[
				'Bound changes are now perfectly fluid, providing a more consistent and reliable experience.',
			],
			{
				tag: 'h2',
				content: 'Snap-Pan Maths',
				style: {textAlign: 'center'},
			},
			// getCode([
			// 	{op: '=', multiline: 2, id: [
			// 		'thirdZoom0', 'thirdX0', 'thirdY0', 'thirdZoom1', 'thirdX1', 'thirdY1',
			// 		'firstZoom', 'firstEndX0', 'firstEndY0', 'firstEndX1', 'firstEndY1',
			// 		'secondZoom',
			// 		'hasSecond0', 'secondX0', 'secondY0', 'secondEndX0', 'secondEndY0',
			// 		'hasSecond1', 'secondX1', 'secondY1', 'secondEndX1', 'secondEndY1',
			// 	], and: {
			// 		op: 'call', id: 'getZoomPoints',
			// 	}},
			// ]),
			{
				tag: 'h2',
				content: 'Snap-Pan Effectiveness',
				style: {textAlign: 'center'},
			},
			[
				'This system is not significantly worse nor better at snap-panning than the prior.',
				'If you try a snap-pan here and then hit your left arrow key, you\'ll see that differences are negligible.',
				'If we\'re picking nits, however, the choppiness of the prior system\'s pan limits do lead to some slight inconsistency in span pans.',
				'This system excises that inconsistency at the expense of less efficient code.',
			],
			'The balance of consistency and efficiency must be weighed to judge a victor.',
			{
				tag: 'h2',
				content: 'Conclusion',
				style: {textAlign: 'center'},
			},
			[
				'I think this is close to a flawless system.',
				'Like I mentioned at the start of our rotation odyssey, however, it\'s much harder to identify "perfect" behaviour here than with the earlier systems.',
				'No doubt a different approach could produce a better system, but this is the best I\'ve found.',
			],
			[
				'In handling rotation, we sacrifice code efficiency and intuitive bounds relative to those "perfect" systems.',
				'To reiterate, I recommend using the "Viewport Center" system for pan-limiting since it\'s unbeatable on those two fronts.',
				'Furthermore, the difference between this system and the prior as a snap-pan facilitator is negligible;',
				'If pan-limiting isn\'t a concern, both have valid candidacy for implementation.',
			],
			[
				'Although the use cases for my more complex work are limited, I\'m glad to have done it.',
				'This all started from an idea for a userscript and a feeling that I ',
				{
					tag: 'i',
					content: 'should',
				},
				' be able to code it.',
				'From there, my obsessive, self-injurious drive blew this project\'s scope way beyond what was sensible.',
				'Still, having broke the surface of this abyss, I\'m proud to have pushed my limits so far.',
			],
		),
	);
	
	return demo;
};
