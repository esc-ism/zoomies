import demo from '@/demo';
import {DEGREES} from '@/shared';

import {CLASS_MATH_LOOSE, TWEEN_OPTIONS_SETUP} from '../../consts';
import {register as registerFunctions, cleanup} from '../../code';
import {getText, getCode, getInstruction, getMath, getInputDependent, getLink, getConnectedPunctuation} from '../../shared';
import {xmlns} from '../../shared/math';
import {getPageButton, IDS} from '../../shared/page';
import {getButton, clearButton} from '../../shared/button';
import {getSnapOptions} from '../../shared/tween';

import * as mock from '../mock';
import {LERP as SHARED_FUNCTIONS} from '../code';

import System, {getConstrainedZoom, getZoomPoints} from './demo';

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const code = [];

const functions = [
	...SHARED_FUNCTIONS,
	{op: 'func', id: 'getRailsProgressed', type: ['zoom', 'x', 'y', 'zoom', 'x', 'y'], pair: [,2, 1,, 5, 4], args: [
		'from0', 'to0', 'from1', 'to1', 'isHighX', 't',
	], and: [
		{op: '=', id: 'z0t', type: 'zoom', and: {op: '+', and: ['from0', {op: '*', and: [{op: '-', and: ['to0', 'from0']}, 't']}]}},
		{op: '=', id: 'z1t', type: 'zoom', and: {op: '+', and: ['from1', {op: '*', and: [{op: '-', and: ['to1', 'from1']}, 't']}]}},
		'',
		{op: '=', id: ['x0', 'y0'], type: ['x', 'y'], pair: ['y0', 'x0'], and: {op: '?', and: ['isHighX', {op: 'array', and: [0, 0.5]}, {op: 'array', and: [0.5, 0]}]}},
		'',
		{op: 'return', and: {op: 'array', multiline: [3], and: [
			'z0t', 'x0', 'y0',
			'z1t', {op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'x0', 'y0', 'z0t', 'z1t']}},
		]}},
	]},
	{op: 'func', id: 'getRails', type: ['zoom', 'x', 'y', 'zoom', 'x', 'y'], pair: [,2, 1,, 5, 4], and: [
		{op: '=', id: 'isEvenQuadrant', and: {
			op: '!=', and: [{op: '%', and: [{op: 'floor', and: {op: '/', and: ['rotation', '½π']}}, 2]}, 0],
		}},
		'',
		{op: '=', id: 'zX', type: 'zoom', and: {op: '/', and: ['viewportWidth', 'imageWidth']}},
		{op: '=', id: 'zY', type: 'zoom', and: {op: '/', and: ['viewportHeight', 'imageHeight']}},
		{op: '=', id: 'isHighX', and: {op: '>', and: ['zX', 'zY']}},
		{op: '=', id: ['z0', 'z1'], type: ['zoom', 'zoom'], and: {op: '?', and: ['isHighX', {op: 'array', and: ['zY', 'zX']}, {op: 'array', and: ['zX', 'zY']}]}},
		'',
		{op: '=', id: 'zXFlipped', type: 'zoom', and: {op: '/', and: ['viewportHeight', 'imageWidth']}},
		{op: '=', id: 'zYFlipped', type: 'zoom', and: {op: '/', and: ['viewportWidth', 'imageHeight']}},
		{op: '=', id: 'isHighXFlipped', and: {op: '>', and: ['zXFlipped', 'zYFlipped']}},
		{op: '=', id: ['z0Flipped', 'z1Flipped'], type: ['zoom', 'zoom'], and: {op: '?', and: ['isHighXFlipped', {op: 'array', and: ['zYFlipped', 'zXFlipped']}, {op: 'array', and: ['zXFlipped', 'zYFlipped']}]}},
		'',
		{op: 'if', and: [
			{op: '==', and: ['isHighX', 'isHighXFlipped']},
			{op: '=', id: 't', and: {op: '/', and: [{op: '%', and: [{op: '+', and: ['rotation', '2π']}, '½π']}, '½π']}},
			'',
			{op: 'return', and: {op: 'call', id: 'getRailsProgressed', multiline: [5], and: [
				'z0', 'z0Flipped', 'z1', 'z1Flipped',
				'isHighX', {op: '?', and: ['isEvenQuadrant', 't', {op: '-', and: [1, 't']}]},
			]}},
		]},
		'',
		{op: '=', id: 'θ', and: {op: 'call', id: 'getθ', and: ['isEvenQuadrant']}},
		{op: '=', id: 'progress', and: {op: '/', and: ['θ', '½π']}},
		'',
		{op: '=', id: 'scale', and: {op: '/', and: ['z1', 'z0']}},
		{op: '=', id: 'scaleFlipped', and: {op: '/', and: ['z1Flipped', 'z0Flipped']}},
		{op: '=', id: 'threshold', and: {op: '/', and: ['scale', {op: '+', and: ['scale', 'scaleFlipped']}]}},
		'',
		{op: '=', id: 'zAvg0', type: 'zoom', and: {op: '/', and: [{op: '+', and: ['z0', 'z0Flipped']}, 2]}},
		'',
		{op: 'return', and: {op: '?', multiline: true, and: [
			{op: '<=', and: ['progress', 'threshold']},
			{op: 'call', id: 'getRailsProgressed', multiline: [5], and: [
				'z0', 'zAvg0', 'z1', 'zAvg0',
				'isHighX', {op: '/', and: ['progress', 'threshold']},
			]},
			{op: 'call', id: 'getRailsProgressed', multiline: [5], and: [
				'zAvg0', 'z0Flipped', 'zAvg0', 'z1Flipped',
				'isHighXFlipped', {op: '/', and: [{op: '-', and: ['progress', 'threshold']}, {op: '-', and: [1, 'threshold']}]},
			]},
		]}},
	]},
	{op: 'func', id: 'getBound', args: ['z0', 'x0', 'y0', 'z1', 'x1', 'y1'], type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '>', and: ['zoom', 'z1']},
			{op: '=', id: 'progress', and: {op: '/', and: ['zoom', 'z1']}},
			'',
			{op: 'return', and: {op: 'array', multiline: true, and: [
				{op: '-', and: [0.5, {op: '/', and: [{op: '-', and: [0.5, 'x1']}, 'progress']}]},
				{op: '-', and: [0.5, {op: '/', and: [{op: '-', and: [0.5, 'y1']}, 'progress']}]},
			]}},
		]},
		'',
		{op: 'if', and: [
			{op: '<=', and: ['zoom', 'z0']},
			{op: 'return', and: {op: 'array', and: [0, 0]}},
		]},
		'',
		{op: 'return', and: {
			op: 'call', id: 'getProgressed', and: [0, 0, 'x0', 'y0', 'z0', 'zoom'],
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
		
		clearButton();
	},
	text: getText(
		{
			tag: 'h1',
			content: IDS.EDGER,
			style: {textAlign: 'center'},
		},
		[
			'Let\'s see if we can modify ', getPageButton(IDS.EDGE), ' to make its snap-panning work for any rotation.',
			'Its bounding won\'t be useful, but we can ignore that for now.',
		],
		[
			'Finding correct bounds for images rotated 90° is straightforward —',
			'just swap the viewport dimensions used to find ', {tag: 'i', content: 'boundX'}, ' and ', {tag: 'i', content: 'boundY'}, '.',
			'Would transitioning between these 0° and 90° bounds free the system of its limitations?',
			'Let\'s try it!',
		],
		{
			tag: 'h2',
			content: 'Bound Maths',
			style: {textAlign: 'center'},
		},
		[
			'Now that rotation is a factor in calculations, it\'s useful to split the process of finding bounds into two steps:',
			{tag: 'ol', content: [
				{tag: 'li', content: 'When rotation or aspect ratios change, calculate rail data (endpoints and start zooms).'},
				{tag: 'li', content: 'When either the first step runs or zoom is changed, use rail data to set bounds.'},
			]},
			'By precalculating rail data for zooms and snap-pans, those operations can be handled more efficiently.',
		],
		[
			'The transition between 0° and 90° bounds is done via the ',
			getLink('linear interpolation', 'https://en.wikipedia.org/wiki/Linear_interpolation#Programming_language_support'),
			' formula, where ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: {tag: 'mi', xmlns, content: 't'}},
			' determines progress from ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: {tag: 'mi', xmlns, content: 'start'}},
			' to ',
			getConnectedPunctuation({tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: {tag: 'mi', xmlns, content: 'end'}}, '.'),
			getMath({
				content: {tag: 'mtable', xmlns, content: [
					{tag: 'mtr', xmlns, content: [
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'value'},
						]},
						{tag: 'mo', xmlns, content: '='},
						{tag: 'mtd', xmlns, content: [
							{tag: 'mi', xmlns, content: 'start'},
							{tag: 'mo', xmlns, content: '+'},
							{tag: 'mi', xmlns, content: 't'},
							{tag: 'mo', xmlns, content: '('},
							{tag: 'mi', xmlns, content: 'end'},
							{tag: 'mo', xmlns, content: '-'},
							{tag: 'mi', xmlns, content: 'start'},
							{tag: 'mo', xmlns, content: ')'},
						]},
					]},
				]},
			}),
		],
		[
			'In the code snippet below, linear interpolation is used in ',
			{tag: 'i', content: 'getRailsProgressed'},
			' to find the minimum and maximum zooms for which bounds are 1-dimensional.',
			'Note that angles are measured in ', getLink('radians', 'https://en.wikipedia.org/wiki/Radian'), '.',
			'The ', {tag: 'i', content: 'rotation'}, ' variable holds the angle between the image\'s positive y-axis and an un-rotated positive x-axis, which is ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
				{tag: 'mn', xmlns, content: '½'},
				{tag: 'mi', xmlns, content: 'π'},
			]},
			' at zero rotation.',
		],
		getInstruction([
			'This code snippet includes custom functions. ',
			getInputDependent((isMouse) => isMouse ? 'Click' : 'Tap'),
			' a function\'s name (e.g. ', {tag: 'i', content: 'getRails'}, ') to unfold it, and ',
			getInputDependent((isMouse) => isMouse ? 'click' : 'tap'),
			' the ', {tag: 'i', content: 'function'}, ' text to re-fold.',
		]),
		getCode(code, [
			{op: '=', id: ['z0', 'x0', 'y0', 'z1', 'x1', 'y1'], and: {op: 'call', id: 'getRails'}},
			'',
			{op: '=', id: ['boundX', 'boundY'], and: {
				op: 'call', id: 'getBound', and: ['z0', 'x0', 'y0', 'z1', 'x1', 'y1'],
			}},
		]),
		{
			tag: 'h2',
			content: 'Bound Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'The outcome here is exactly as expected.',
			'Bounds now work perfectly with rotation values that are multiples of 90°, regardless of viewport aspect ratio.',
			'They still ',
			getButton('fail', [
				({ratio}) => [{zoom: 1, position: 0, rotation: DEGREES[90], ratio}, TWEEN_OPTIONS_SETUP],
				({x, y}) => [{x, y}],
				({zoom, rotation}) => [{zoom, rotation}, {position: '<30%'}],
				({from}) => [{...from}, {duration: 0.2, delay: 0.6}],
				({x, y}) => [{x, y}, {ease: 'bounce.out', duration: 0.4, delay: 0.1}],
			], {getParam: () => {
				const data = getVarGetter(demo.ratioViewport > 1 ? (DEGREES[90] + DEGREES[45]) : DEGREES[45], 1)();
				
				const x = 0.5 - (0.5 - data.zoomPoints[2].x) / 2;
				const y = 0.5 - (0.5 - data.zoomPoints[2].y) / 2;
				
				const from = {
					x: 0.2 * (data.zoomPoints[2].x - x) + x,
					y: 0.2 * (data.zoomPoints[2].y - y) + y,
				};
				
				return {...data, x, y, from, zoom: data.zoomPoints[2].z * 2};
			}}),
			' elsewhere.',
		],
		['A minor improvement, but not the priority.',
			'Let\'s see if the system can succeed where it matters...'],
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		[
			'Given rail data, calculating snap zooms is pretty straightforward.',
			'Like before, a zoom is found for each axis, and the solution is whichever\'s larger.',
		],
		getCode(code, [
			{op: '=', id: ['zX', 'xX', 'zY', 'yY'], type: ['zoom', 'x', 'zoom', 'y'], and: {op: '?', multiline: true, and: [
				{op: '==', and: ['y0', 0]},
				{op: 'array', and: ['z0', 0, 'z1', 'y1']},
				{op: 'array', and: ['z1', 'x1', 'z0', 0]},
			]}},
			'',
			{op: '=', id: 'snapZoom', type: 'zoom', and: {op: 'max', multiline: true, and: [
				{op: '*', and: [{op: '/', and: [{op: '-', and: [0.5, 'xX']}, {op: '-', and: [0.5, {op: 'abs', and: 'x'}]}]}, 'zX']},
				{op: '*', and: [{op: '/', and: [{op: '-', and: [0.5, 'yY']}, {op: '-', and: [0.5, {op: 'abs', and: 'y'}]}]}, 'zY']},
			]}},
		]),
		{
			tag: 'h2',
			content: 'Snap-Pan Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'Honestly, I\'m surprised by how little the modification has helped.',
			'Make sure your viewport isn\'t square-shaped if you want to see the issues.',
		],
		[
			'Consider ',
			getButton('this', [
				() => [{ratio: demo.ratioViewport, rotation: DEGREES[45], zoom: 1, position: 0}],
			]),
			' state.',
			'As the viewport gets less square, you\'ll find that one pair of corners becomes visible.',
			'Since bounds must grow towards both corners in tandem, they fail to adequately restrict pans towards the one that\'s unobscured.',
			'If you ',
			getButton('snap-pan', getSnapOptions(), {getParam: () => {
				const data = getVarGetter(DEGREES[45], demo.ratioViewport)();
				const position = {x: demo.ratioViewport > 1 ? 0.25 : -0.25, y: 0.25};
				const [lowAxis, ...zoomPoints] = data.zoomPoints;
				
				return {...data, position, startZoom: 1, zoom: getConstrainedZoom({x: 0.25, y: 0.25}, lowAxis, zoomPoints)};
			}}),
			' towards a visible corner, the system will fail to provide a high enough zoom.',
		],
		[
			'This isn\'t an insignificant issue;',
			'in ', {tag: 'i', content: 'any'}, ' state with non-90°-multiple rotation and a non-square viewport, one corner will be less obscured than the other.',
			'Snap-pans are inconsistent in all such states.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'The modifications have given this system a ', {tag: 'i', content: 'slightly'}, ' broader use case, but they haven\'t achieved their purpose.',
			'Bounding effectiveness is no longer limited by aspect ratio, but snap-panning still only works well with square viewports.',
		],
		[
			'Unfortunately, it\'s going to take more than a tweak to ', getPageButton(IDS.EDGE), ' to handle rotation effectively.',
			'It\'s time for some trigonometry!',
		],
	),
};
