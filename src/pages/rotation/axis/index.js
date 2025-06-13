import {DEGREES} from '@/shared';

import {getText, getCode, getButton} from '../../shared';
import {badTweens} from '../origin';

import Demo, {getImageFit} from './demo';

export default (wrapper) => {
	const demo = new Demo();
	
	const getFitZoom = () => Math.max(...getImageFit(0, demo.viewportDimensions, demo.imageDimensions));
	
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
					['zoom', 1],
					['ratio', 0.5],
					badTweens.rotation,
					badTweens.position,
					['ratio', 1.5, {duration: 5, ease: 'none', delay: '>'}],
				]),
				' much better.',
			],
			[
				'This system keeps each image corner on a different viewport edge.',
				'The corners\' distance along each edge is a ratio based on rotation angle;',
				'if an image corner maps to one viewport corner at ',
				getButton('0°', demo, [
					['position', 0.5, {duration: 0}],
					() => ['zoom', getFitZoom()],
					['rotation', DEGREES[90], {delay: '>+=0.3'}],
				]),
				' and another at ',
				getButton('90°', demo, [
					['position', 0.5, {duration: 0}],
					() => ['zoom', getFitZoom()],
					['rotation', 0, {duration: 2, delay: '>+=0.3'}],
				]),
				', it travels linearly between them for ',
				getButton('intermediate angles', demo, [
					['position', 0.5, {duration: 0}],
					() => ['zoom', getFitZoom()],
					['rotation', DEGREES[90], {duration: 2, delay: '>+=0.3'}],
					['rotation', 0, {ease: 'none', duration: 5, delay: '>'}],
				]),
				'.',
			],
			[
				'This is only half of the system, however.',
				'Since points no longer travel directly from the origin towards image corners, we need some way of ',
			],
		),
	);
};
