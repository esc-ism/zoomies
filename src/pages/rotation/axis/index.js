import {DEGREES} from '@/shared';

import {getText, getCode, getButton} from '../../shared';
import {badTweens} from '../origin';

import Demo, {getSnappedZoom, getZoomPoints} from './demo';

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

const getVarGetter = (demo, rotation = DEGREES[90], ratio = 1) => () => {
	const [first, second] = getZoomPoints(
		rotation,
		demo.viewportDimensions,
		getDimensions(ratio, demo.viewportDimensions),
	).slice(2);
	
	return {first, second, rotation, ratio};
};

const getCornerProgressTweens = (rotation) => [
	[{ratio: 1, zoom: 1, position: 0.5}],
	[{rotation}, {delay: 0.2}],
];

const getLimitedPosition = (limit = 0.4) => Math.max(-limit, Math.min(limit, Math.random() - 0.5));

const getSnapVars = (demo, getRatio) => {
	const ratio = getRatio();
	const rotation = Math.random() * DEGREES[180];
	const position = {x: getLimitedPosition(), y: getLimitedPosition()};
	
	const zoomPoints = getZoomPoints(
		rotation,
		demo.viewportDimensions,
		getDimensions(ratio, demo.viewportDimensions),
	);
	
	const zoom = getSnappedZoom(...zoomPoints, position);
	
	return {ratio, rotation, fitZoom: Math.min(zoomPoints[0].z, zoomPoints[2].z), zoom, position};
};

export const getSnapTweens = (demo, getRatio) => [
	[
		({rotation, ratio, fitZoom}) => [{rotation, ratio, zoom: fitZoom, position: 0}],
		({position}) => [{position}],
		({zoom}) => [{zoom}, {duration: 0}],
	],
	{getParam: getSnapVars.bind(null, demo, getRatio)},
];

export default (wrapper) => {
	const demo = new Demo();
	
	const getTraceVars = getVarGetter(demo, DEGREES[90] - 0.4, 0.75);
	const getDirectVars = getVarGetter(demo, DEGREES[90] - 0.4);
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h2',
				content: 'Good Rotation',
			},
			[
				'Let\'s start by seeing how that ',
				getButton('problematic demo state', demo, [[badTweens]]),
				' looks on this new system',
			],
			[
				'Much better!',
				'This system is equivalent to the prior with shared aspect ratio, but handles ',
				getButton('decoupling', demo, [
					[{...badTweens, ratio: 2, zoom: 1.5}],
					[{ratio: 0.5}, {duration: 5, ease: 'none'}],
				]),
				' much better.',
			],
			[
				'This system keeps each image corner on a different viewport edge.',
				'The corners\' distance along each edge is a ratio based on rotation angle;',
				'if an image corner maps to one viewport corner at ',
				getButton('0°', demo, getCornerProgressTweens(DEGREES[90])),
				' and another at ',
				getButton('90°', demo, getCornerProgressTweens(0)),
				', it travels linearly between them for ',
				getButton('intermediate angles', demo, [
					...getCornerProgressTweens(DEGREES[90]),
					[{rotation: 0}, {ease: 'none', duration: 3}],
				]),
				'.',
			],
			[
				'This is only half of the system, however.',
				'Since points no longer travel directly from the origin towards image corners, we need a smart way to move them from the origin.',
			],
			[
				'This is accomplished here by having them trace along the ',
				getButton('viewport\'s axes', demo, [
					({rotation, ratio, first}) => [{position: 0, ratio, rotation, zoom: first.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				' until they can take a ',
				getButton('corner-bound', demo, [
					({rotation, ratio, second}) => [{position: second, ratio, rotation, zoom: second.z}],
					[{position: 0.5}, {delay: 0.5}],
					({second}) => [{zoom: second.z * 2}, {duration: 3, position: '<'}],
				], {getParam: getTraceVars}),
				'  path.',
			],
			[
				'This latter part of the system has upsides and downsides.',
				'On one hand, users can take the most direct possible path when ',
				getButton('panning', demo, [
					({rotation, ratio, second}) => [{rotation, ratio, zoom: second.z, position: 0}],
					({second}) => [{position: second}, {delay: 0.5}],
					({second}) => [{position: second.vpEnd}, {duration: 0}],
				], {getParam: getDirectVars}),
				' to an offscreen corner.',
				'On the other, extreme aspect ratio differentials can cause ',
				getButton('odd behaviour', demo, [
					[{position: 0.5}, {duration: 0}],
					[{ratio: 0.25, zoom: 1}],
					[{rotation: DEGREES[90]}, {duration: 2, delay: 0.2}],
					[{rotation: 0}, {ease: 'none', duration: 5}],
				], {getParam: getDirectVars}),
				' when rotating.',
			],
			[
				'No doubt there\'s a clever way around this flaw; using the image\'s axes instead of the viewport\'s would probably work.',
				'However, acting as a perfect pan-limiting system is beyond the system\'s scope.',
				'Its purpose is to facilitate snap panning, and in this role it\'s hard to fault.',
				'Of course it performs fine on ',
				getButton('similar', demo, ...getSnapTweens(demo, () => Math.random() / 5 + 0.9)),
				' aspect ratios,',
				'but even ',
				getButton('distant', demo, ...getSnapTweens(demo, () => Math.random() / 10 + 0.2)),
				' aspect ratios reveal no flaw in its ability to derive sensible zoom levels.',
			],
		),
	);
	
	return demo;
};
