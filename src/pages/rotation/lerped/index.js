import demo from '@/demo';
import {DEGREES} from '@/shared';

import {CLASS_MATH_EQUATION, TWEEN_OPTIONS_YOYO, CLASS_MATH_LOOSE, TWEEN_OPTIONS_SETUP} from '../../consts';
import getRefreshButton from '../../code/buttons/refresh';
import {register as registerFunctions, cleanup} from '../../code';
import {getText, getCode, getInstruction, getMath, getInputDependent, getLink, getDialogue} from '../../shared';
import {xmlns} from '../../shared/math';
import {getPageButton, IDS} from '../../shared/page';
import {getButton, clearButton} from '../../shared/button';
import {getSnapOptions} from '../../shared/tween';

import * as mock from '../mock';

import System, {getConstrainedZoom, getZoomPoints} from './demo';

const getVarGetter = mock.getVarGetter.bind(null, getZoomPoints);

const code = [
	{op: 'func', id: 'getZoomPoints', type: ['zoom', 'x', 'y', 'zoom', 'x', 'y'], pair: [,2, 1,, 5, 4], multilineResult: [3], and: [
		
	]},
	// const isEvenQuadrant = Math.floor(rotation / DEGREES[90]) % 2 !== 0;
	
	// const normX = sizesViewport.width / sizesImage.width;
	// const normY = sizesViewport.height / sizesImage.height;
	// const isNormX = normX > normY;
	// const [norm0, norm1] = isNormX ? [normY, normX] : [normX, normY];
	
	// const invX = sizesViewport.height / sizesImage.width;
	// const invY = sizesViewport.width / sizesImage.height;
	// const isInvX = invX > invY;
	// const [inv0, inv1] = isInvX ? [invY, invX] : [invX, invY];
	
	// const avg0 = (norm0 + inv0) / 2;
	
	// if (isNormX === isInvX) {
	// 	const progress = isEvenQuadrant ?
	// 			(((rotation + DEGREES[360]) % DEGREES[90]) / DEGREES[90]) :
	// 			(1 - (((rotation + DEGREES[360]) % DEGREES[90]) / DEGREES[90]));
	
	// 	const z0 = norm0 + (inv0 - norm0) * progress;
	// 	const z1 = norm1 + (inv1 - norm1) * progress;
	
	// 	if (isNormX) {
	// 		return [
	// 			'y',
	// 			{x: 0, y: 0, z: z0, end: {x: 0, y: 0.5}},
	// 			{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0, y: 0.5}, z1), z: z1},
	// 		];
	// 	}
	
	// 	return [
	// 		'x',
	// 		{y: 0, x: 0, z: z0, end: {x: 0.5, y: 0}},
	// 		{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0.5, y: 0}, z1), z: z1},
	// 	];
	// }
	
	// const quadrantAngle = getQuadrantAngle(rotation, isEvenQuadrant);
	// const progress = quadrantAngle / DEGREES[90];
	
	// const flipP = (norm1 - 1) / ((inv1 - 1) + (norm1 - 1));
	
	// if (progress <= flipP) {
	// 	const progressNorm = progress / flipP;
	
	// 	const z0 = norm0 + (avg0 - norm0) * progressNorm;
	// 	const z1 = norm1 + (avg0 - norm1) * progressNorm;
	
	// 	if (isNormX) {
	// 		return [
	// 			'y',
	// 			{x: 0, y: 0, z: z0, end: {x: 0, y: 0.5}},
	// 			{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0, y: 0.5}, z1), z: z1},
	// 		];
	// 	}
	
	// 	return [
	// 		'x',
	// 		{y: 0, x: 0, z: z0, end: {x: 0.5, y: 0}},
	// 		{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0.5, y: 0}, z1), z: z1},
	// 	];
	// }
	
	// const progressInv = (progress - flipP) / (1 - flipP);
	
	// const z0 = avg0 + (inv0 - avg0) * progressInv;
	// const z1 = avg0 + (inv1 - avg0) * progressInv;
	
	// if (isInvX) {
	// 	return [
	// 		'y',
	// 		{x: 0, y: 0, z: z0, end: {x: 0, y: 0.5}},
	// 		{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0, y: 0.5}, z1), z: z1},
	// 	];
	// }
	
	// return [
	// 	'x',
	// 	{y: 0, x: 0, z: z0, end: {x: 0.5, y: 0}},
	// 	{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0.5, y: 0}, z1), z: z1},
	// ];
	
];

export default {
	System,
	start() {
		registerFunctions();
		
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
			content: 'Viewport Edge+',
			style: {textAlign: 'center'},
		},
		[
			'First, let\'s see if we can modify ', getPageButton(IDS.EDGE), ' to make its snap-panning work for any rotation.',
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
		// todo
		'to do',
		{
			tag: 'h2',
			content: 'Bound Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'As expected, bounds work perfectly with rotation values that are multiples of 90°, but ',
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
		{
			tag: 'h2',
			content: 'Snap-Pan Maths',
			style: {textAlign: 'center'},
		},
		// todo
		'to do',
		{
			tag: 'h2',
			content: 'Snap-Pan Effectiveness',
			style: {textAlign: 'center'},
		},
		[
			'Make sure your viewport isn\'t square-shaped if you want to see the snap-panning issues.',
			'Honestly, I\'m surprised by how little the modification has helped...',
		],
		[
			'Consider ',
			getButton('this', [
				() => [{ratio: demo.ratioViewport, rotation: DEGREES[45], zoom: 1, position: 0}],
			]),
			' state.',
			'For non-square viewports, you\'ll find that only one pair of corners is hidden, but bounds grow towards both in tandem.',
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
			'in ', {tag: 'i', content: 'any'}, ' state with non-90°-multiple rotation and a non-square viewport, one corner will be easier to see than the other.',
			'Snap-pans are inconsistent in all such states.',
		],
		{
			tag: 'h2',
			content: 'Conclusion',
			style: {textAlign: 'center'},
		},
		[
			'The modifications have given this system a ', {tag: 'i', content: 'slightly'}, ' broader use-case, but they haven\'t achieved their purpose.',
			'Bounding effectiveness is no longer limited by aspect ratio, but snap-panning still only works well with square viewports.',
		],
		[
			'Unfortunately, it\'s going to take more than a tweak to ', getPageButton(IDS.EDGE), ' to handle rotation effectively.',
			'It\'s time for some trigonometry!',
		],
	),
};
