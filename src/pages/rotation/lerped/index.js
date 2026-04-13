import demo from '@/demo';
import {DEGREES} from '@/shared';

import {CLASS_MATH_LOOSE, getTweenOptionsBound, TWEEN_OPTIONS_SETUP, TWEEN_OPTIONS_YOYO} from '../../consts';
import {register as registerFunctions, cleanup} from '../../code';
import {getText, getCode, getInstruction, getMath, getInputDependent, getLink, getDialogue, getConnectedPunctuation} from '../../shared';
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
	], description: [
		'The first rail\'s start zoom at 0° rotation',
		'The second rail\'s start zoom at 0° rotation',
		'The first rail\'s start zoom at 90° rotation',
		'The second rail\'s start zoom at 90° rotation',
		'True if the first rail follows the y-axis',
		'0 for the 0° rotation state, 1 for the 90° rotation state, or something in-between',
	], and: [
		{op: '=', id: 'z0t', description: 'The first rail\'s start zoom', type: 'zoom', and: {op: '+', and: ['from0', {op: '*', and: [{op: '-', and: ['to0', 'from0']}, 't']}]}},
		{op: '=', id: 'z1t', description: 'The second rail\'s start zoom', type: 'zoom', and: {op: '+', and: ['from1', {op: '*', and: [{op: '-', and: ['to1', 'from1']}, 't']}]}},
		'',
		{op: '=', id: ['x0', 'y0'], description: [
			'The x-coordinate of the first rail\'s horizon',
			'The y-coordinate of the first rail\'s horizon',
		], type: ['x', 'y'], pair: ['y0', 'x0'], and: {op: '?', and: ['isHighX', {op: 'array', and: [0, 0.5]}, {op: 'array', and: [0.5, 0]}]}},
		'',
		{op: 'return', and: {op: 'array', multiline: [3], and: [
			'z0t', 'x0', 'y0',
			'z1t', {op: '...', and: {op: 'call', id: 'getProgressed', and: [0, 0, 'x0', 'y0', 'z0t', 'z1t']}},
		]}},
	]},
	{op: 'func', id: 'getRails', type: ['zoom', 'x', 'y', 'zoom', 'x', 'y'], pair: [,2, 1,, 5, 4], and: [
		{op: '=', id: 'is▚', description: 'True if the image is rotated between 90° and 180°, or between 270° and 360°', and: {
			op: '!=', and: [{op: '%', and: [{op: 'floor', and: {op: '/', and: ['rotation', '½π']}}, 2]}, 0],
		}},
		'',
		{op: '=', id: 'zX', description: 'The zoom at which the image\'s left and right sides touch the viewport\'s edge at 0° rotation', type: 'zoom', and: {op: '/', and: ['viewportWidth', 'imageWidth']}},
		{op: '=', id: 'zY', description: 'The zoom at which the image\'s top and bottom sides touch the viewport\'s edge at 0° rotation', type: 'zoom', and: {op: '/', and: ['viewportHeight', 'imageHeight']}},
		{op: '=', id: 'isHighX', description: 'True if the first rail follows the y-axis at 0° rotation', and: {op: '>', and: ['zX', 'zY']}},
		{op: '=', id: ['z0', 'z1'], description: [
			'The first rail\'s start zoom at 0° rotation',
			'The second rail\'s start zoom at 0° rotation',
		], type: ['zoom', 'zoom'], and: {op: '?', and: ['isHighX', {op: 'array', and: ['zY', 'zX']}, {op: 'array', and: ['zX', 'zY']}]}},
		'',
		{op: '=', id: 'zX↷', description: 'The zoom at which the image\'s left and right sides touch the viewport\'s edge at 90° rotation', type: 'zoom', and: {op: '/', and: ['viewportHeight', 'imageWidth']}},
		{op: '=', id: 'zY↷', description: 'The zoom at which the image\'s top and bottom sides touch the viewport\'s edge at 90° rotation', type: 'zoom', and: {op: '/', and: ['viewportWidth', 'imageHeight']}},
		{op: '=', id: 'isHighX↷', description: 'True if the first rail follows the y-axis at 90° rotation', and: {op: '>', and: ['zX↷', 'zY↷']}},
		{op: '=', id: ['z0↷', 'z1↷'], description: [
			'The first rail\'s start zoom at 90° rotation',
			'The second rail\'s start zoom at 90° rotation',
		], type: ['zoom', 'zoom'], and: {op: '?', and: ['isHighX↷', {op: 'array', and: ['zY↷', 'zX↷']}, {op: 'array', and: ['zX↷', 'zY↷']}]}},
		'',
		{op: 'if', and: [
			{op: '==', and: ['isHighX', 'isHighX↷']},
			{op: '=', id: 't', description: 'The rotation\'s progress from the 90° multiple below it to the one above it', and: {op: '/', and: [{op: '%', and: [{op: '+', and: ['rotation', '2π']}, '½π']}, '½π']}},
			'',
			{op: 'return', and: {op: 'call', id: 'getRailsProgressed', multiline: [5], and: [
				'z0', 'z0↷', 'z1', 'z1↷',
				'isHighX', {op: '?', and: ['is▚', 't', {op: '-', and: [1, 't']}]},
			]}},
		]},
		'',
		{op: '=', id: 'θ', description: '0 when the image is perfectly right-side-up or upside-down, and 1 when the image is perfectly sideways', and: {op: 'call', id: 'getθ'}},
		{op: '=', id: 'progress', description: 'The rotation\'s progress towards being perfectly sideways', and: {op: '/', and: ['θ', '½π']}},
		'',
		{op: '=', id: 'scale', description: 'A measurement of how far the second rail\'s start point is from (0, 0) at 0° rotation', and: {op: 'log2', and: {op: '/', and: ['z1', 'z0']}}},
		{op: '=', id: 'scale↷', description: 'A measurement of how far the second rail\'s start point is from (0, 0) at 90° rotation', and: {op: 'log2', and: {op: '/', and: ['z1↷', 'z0↷']}}},
		{op: '=', id: 'threshold', description: 'The "progress" value at which the second rail\'s start point should be (0, 0)', and: {op: '/', and: ['scale', {op: '+', and: ['scale', 'scale↷']}]}},
		{op: '=', id: 'zAvg0', description: 'The second rail\'s start zoom when its start point is (0, 0)', type: 'zoom', and: {op: '+', and: [{op: '*', and: ['threshold', {op: '-', and: ['z0↷', 'z0']}]}, 'z0']}},
		'',
		{op: 'return', and: {op: '?', multiline: true, and: [
			{op: '<=', and: ['progress', 'threshold']},
			{op: 'call', id: 'getRailsProgressed', multiline: [5], and: [
				'z0', 'zAvg0', 'z1', 'zAvg0',
				'isHighX', {op: '/', and: ['progress', 'threshold']},
			]},
			{op: 'call', id: 'getRailsProgressed', multiline: [5], and: [
				'zAvg0', 'z0↷', 'zAvg0', 'z1↷',
				'isHighX↷', {op: '/', and: [{op: '-', and: ['progress', 'threshold']}, {op: '-', and: [1, 'threshold']}]},
			]},
		]}},
	]},
	{op: 'func', id: 'getBound', type: ['x', 'y'], pair: [1, 0], and: [
		{op: 'if', and: [
			{op: '>', and: ['zoom', 'z1']},
			{op: '=', id: 'progress', description: 'The scale increase from the second rail\'s start zoom', and: {op: '/', and: ['zoom', 'z1']}},
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
			op: 'call', id: 'getProgressed', and: [{op: 'pseudo', type: 'x', and: 0}, {op: 'pseudo', type: 'y', and: 0}, 'x0', 'y0', 'z0', 'zoom'],
		}},
	]},
];

const getHorizonArgs = () => demo.ratioViewport <= 1 ?
		{ratio: 0.5, zoom: 2, x: 0.25, y: 0} :
		{ratio: 2, zoom: 2, x: 0, y: 0.25};

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
				{tag: 'li', content: 'When rotation or aspect ratios change, calculate rail data.'},
				{tag: 'li', content: 'When either the first step runs or zoom is changed, use rail data to set bounds.'},
			]},
			'By precalculating rail data for zooms and snap-pans, those operations can be handled more efficiently.',
		],
		getDialogue('"rail data"? bit vague'),
		[
			'Internally, rails are defined as a "start zoom", a "start point", and a "horizon".',
			'Let\'s define those properties.',
		],
		[
			'Bounds calculations take a rail and, for a given zoom, output the bound\'s position on the rail.',
			'Rails begin at their "start point", which is the bound calculation ouput at the rail\'s "start zoom".',
			'Start points are either the origin or intersections with other rails.',
			'Bounds ',
			getButton('start progressing', [
				(zoom) => [{zoom, position: 0}, TWEEN_OPTIONS_SETUP],
				(zoom) => [{zoom: zoom * 1.1}, TWEEN_OPTIONS_YOYO],
			], {
				getParam: () => {
					const {zoomPoints} = demo.system;
					
					return zoomPoints[zoomPoints[0].z < zoomPoints[1].z ? 0 : 1].z;
				},
			}),
			' along a rail when zoom climbs above its start zoom.',
		],
		[
			'As zoom rises, bounds tend towards rail "horizons".',
			'Specifically, past a rail\'s start zoom, doubling zoom will halve the distance between bound and horizon.',
			'For rails that end at image corners, their horizons are these corners.',
			'All other rails are different;',
			'although their playground depictions end at their ',
			getButton('intersection', [
				({ratio}) => [{ratio, zoom: 1, rotation: DEGREES[90], position: 0}, TWEEN_OPTIONS_SETUP],
				({zoom}) => [{zoom}],
				({x, y}) => [{x, y}, {ease: 'bounce.out'}],
			], {
				getParam: getHorizonArgs,
			}),
			' with another rail, they are defined internally as ending at some more distant point.',
			'In this system, these unseen horizons are image edge ',
			getConnectedPunctuation(getButton('midpoints', [
				({x, y, zoom, ratio}) => [{ratio, zoom, x, y}, TWEEN_OPTIONS_SETUP],
				({x, y}) => [{x: x * 2, y: y * 2}],
			], {
				getParam: getHorizonArgs,
			}), ','),
			' like ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
				{tag: 'mo', xmlns, content: '('},
				{tag: 'mn', xmlns, content: '0.5'},
				{tag: 'mo', xmlns, content: ','},
				{tag: 'mn', xmlns, content: '0'},
				{tag: 'mo', xmlns, content: ')'},
			]},
			' and ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
				{tag: 'mo', xmlns, content: '('},
				{tag: 'mn', xmlns, content: '0'},
				{tag: 'mo', xmlns, content: ','},
				{tag: 'mn', xmlns, content: '0.5'},
				{tag: 'mo', xmlns, content: ')'},
			]},
			'.',
		],
		[
			'Now that we\'re done with definitions, let\'s transition into the transitioning!',
			'Rails are calculated for the 0° and 90° rotation states, then transitioned between for other rotations.',
			'Transitional states are found via the ',
			getLink('linear interpolation', 'https://en.wikipedia.org/wiki/Linear_interpolation#Programming_language_support'),
			' formula.',
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
			'In the code snippet below, this rotation-based rail interpolation is performed by ',
			{tag: 'i', content: 'getRailsProgressed'},
			', which is called within ',
			{tag: 'i', content: 'getRails'},
			'.',
			'Note that angle values in code are measured in ', getLink('radians', 'https://en.wikipedia.org/wiki/Radian'), '.',
		],
		getInstruction([
			'This code snippet includes custom functions. ',
			getInputDependent((isMouse) => isMouse ? 'Click' : 'Tap'),
			' a function\'s name (e.g. ', {tag: 'i', content: 'getRails'}, ') to unfold it, and ',
			getInputDependent((isMouse) => isMouse ? 'click' : 'tap'),
			' the ', {tag: 'i', content: 'function'}, ' text to re-fold.',
		]),
		getCode(code, [
			{op: '=', id: ['z0', 'x0', 'y0', 'z1', 'x1', 'y1'], description: [
				'The first rail\'s start zoom',
				'The x-coordinate of the first rail\'s horizon',
				'The y-coordinate of the first rail\'s horizon',
				'The second rail\'s start zoom',
				'The x-coordinate of the second rail\'s start point',
				'The y-coordinate of the second rail\'s start point',
			], and: {op: 'call', id: 'getRails'}},
			'',
			{op: '=', id: ['boundX', 'boundY'], description: [
				'The x-coordinate of the right-side bound',
				'The y-coordinate of the top-side bound',
			], and: {
				op: 'call', id: 'getBound',
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
				({zoom}) => [{zoom}, getTweenOptionsBound(1, 'bound')],
				({rotation}) => [{rotation}, {duration: 0.5, delay: 0.3, ...getTweenOptionsBound(1, 'bound')}],
				({from}) => [{...from}, {duration: 0.2, delay: 0.6}],
				({x, y}) => [{x, y}, {ease: 'bounce.out', duration: 0.4, delay: 0.1}],
			], {getParam: () => {
				// avoids the viewport edge that obscures less
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
			{op: '=', id: ['zX', 'zY'], description: [
				'The zoom at which bounds start progressing along the x-axis',
				'The zoom at which bounds start progressing along the y-axis',
			], type: ['zoom', 'zoom'], and: {op: '?', and: [
				{op: '==', and: ['y0', 0]},
				{op: 'array', and: ['z0', 'z1']},
				{op: 'array', and: ['z1', 'z0']},
			]}},
			'',
			{op: '=', id: 'snapZoom', description: 'The minimum zoom at which (x, y) is in-bounds', type: 'zoom', and: {op: 'max', multiline: true, and: [
				{op: '*', and: [{op: '/', and: [0.5, {op: '-', and: [0.5, {op: 'abs', and: 'x'}]}]}, 'zX']},
				{op: '*', and: [{op: '/', and: [0.5, {op: '-', and: [0.5, {op: 'abs', and: 'y'}]}]}, 'zY']},
			]}},
		]),
		{
			tag: 'h2',
			content: 'Snap-Pan Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'Honestly, it surprises me how little this modification helps.',
			'Make sure your viewport isn\'t square-shaped if you want to see the issues.',
		],
		[
			'Consider ',
			getButton('this', [
				() => [{ratio: demo.ratioViewport, rotation: DEGREES[45], zoom: 1, position: 0}, TWEEN_OPTIONS_SETUP],
			]),
			' state.',
			'As the viewport gets less square, you\'ll find that one pair of corners becomes visible.',
			'Since bounds must grow towards both corners in tandem, pans towards a corner that\'s less obscured by the viewport won\'t be adequately restricted.',
			'Crucially, ',
			getButton('snap-pans', getSnapOptions(), {getParam: () => {
				const data = getVarGetter(DEGREES[45], demo.ratioViewport)();
				const position = {x: demo.ratioViewport > 1 ? 0.25 : -0.25, y: 0.25};
				const [lowAxis, ...zoomPoints] = data.zoomPoints;
				
				return {...data, position, startZoom: 1, zoom: getConstrainedZoom({x: 0.25, y: 0.25}, lowAxis, zoomPoints)};
			}}),
			' towards these corners will provide low snap zooms — exactly what we ', {tag: 'strong', content: 'don\'t'}, ' want.',
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
