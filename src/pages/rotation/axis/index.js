import {DEGREES} from '@/shared';

import {getText, getCode, getButton} from '../../shared';
import {badTweens} from '../origin';

import Demo, {getZoomPoints} from './demo';

const getDimensions = (vpRatio, ratio = vpRatio) => {
	const width = Math.min(vpRatio, vpRatio / ratio);
	const height = Math.min(1 / vpRatio, vpRatio * ratio);
	
	return {
		width, height,
		halfWidth: width / 2,
		halfHeight: height / 2,
	};
};

export default (wrapper) => {
	const demo = new Demo();
	
	const getTraceVars = () => {
		const rotation = DEGREES[90] - 0.4;
		const ratio = 0.75;
		const vpRatio = demo.viewportDimensions.width / demo.viewportDimensions.height;
		const [first, second] = getZoomPoints(
			rotation,
			getDimensions(vpRatio),
			getDimensions(vpRatio, ratio),
		).slice(2);
		
		return {first, second, rotation, ratio};
	};
	
	wrapper.append(
		demo.element,
		
		getText(
			{
				tag: 'h2',
				content: 'Good Rotation',
			},
			[
				'Let\'s start by seeing how that ',
				getButton('problematic demo state', demo, Object.values(badTweens)),
				' looks on this new system',
			],
			[
				'Much better!',
				'This system is equivalent to the prior with shared aspect ratio, but handles ',
				getButton('decoupling', demo, [
					['zoom', 1.5],
					['ratio', 2],
					badTweens.rotation,
					badTweens.position,
					['ratio', 0.5, {duration: 5, ease: 'none', delay: '>'}],
				]),
				' much better.',
			],
			[
				'This system keeps each image corner on a different viewport edge.',
				'The corners\' distance along each edge is a ratio based on rotation angle;',
				'if an image corner maps to one viewport corner at ',
				getButton('0°', demo, [
					['position', 0.5, {duration: 0}],
					['ratio', 1],
					['zoom', 1],
					['rotation', DEGREES[90], {delay: '>+=0.3'}],
				]),
				' and another at ',
				getButton('90°', demo, [
					['position', 0.5, {duration: 0}],
					['ratio', 1],
					['zoom', 1],
					['rotation', 0, {duration: 2, delay: '>+=0.3'}],
				]),
				', it travels linearly between them for ',
				getButton('intermediate angles', demo, [
					['position', 0.5, {duration: 0}],
					['ratio', 1],
					['zoom', 1],
					['rotation', DEGREES[90], {duration: 2, delay: '>+=0.3'}],
					['rotation', 0, {ease: 'none', duration: 5, delay: '>'}],
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
					['position', 0],
					({rotation}) => ['rotation', rotation],
					({ratio}) => ['ratio', ratio],
					({first}) => ['zoom', first.z],
					['position', 0.5, {delay: '>0.5'}],
					({second}) => ['zoom', second.z, {duration: 3, delay: '<'}],
				], {getParam: getTraceVars}),
				' until they can take a ',
				getButton('corner-bound', demo, [
					({second}) => ['position', second],
					({rotation}) => ['rotation', rotation],
					({ratio}) => ['ratio', ratio],
					({second}) => ['zoom', second.z],
					['position', 0.5, {delay: '>0.5'}],
					({second}) => ['zoom', second.z * 2, {duration: 3, delay: '<'}],
				], {getParam: getTraceVars}),
				'  path.',
			],
		),
	);
	
	return demo;
};
