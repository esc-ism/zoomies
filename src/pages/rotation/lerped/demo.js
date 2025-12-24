import demo from '@/demo';
import {DEGREES} from '@/shared';

import {CORNERS} from '../../consts';
import Demo from '../../edge/demo';

import {getQuadrantAngle, getZoomProgressed} from '../shared';

const getFinalZoomPoints = (isNormX, from0, to0, from1, to1, progress) => {
	const z0 = from0 + (to0 - from0) * progress;
	const z1 = from1 + (to1 - from1) * progress;
	
	const [lowAxis, end] = isNormX ? ['y', {x: 0, y: 0.5}] : ['x', {x: 0.5, y: 0}];
	
	return [
		lowAxis,
		{x: 0, y: 0, z: z0, end},
		{...getZoomProgressed({z: z0, x: 0, y: 0}, end, z1), z: z1},
	];
};

export const getZoomPoints = ({rotation, sizesViewport, sizesImage}) => {
	const isEvenQuadrant = Math.floor(rotation / DEGREES[90]) % 2 !== 0;
	
	const normX = sizesViewport.width / sizesImage.width;
	const normY = sizesViewport.height / sizesImage.height;
	const isNormX = normX > normY;
	const [norm0, norm1] = isNormX ? [normY, normX] : [normX, normY];
	
	const invX = sizesViewport.height / sizesImage.width;
	const invY = sizesViewport.width / sizesImage.height;
	const isInvX = invX > invY;
	const [inv0, inv1] = isInvX ? [invY, invX] : [invX, invY];
	
	if (isNormX === isInvX) {
		const progress = ((rotation + DEGREES[360]) % DEGREES[90]) / DEGREES[90];
		
		return getFinalZoomPoints(isNormX, norm0, inv0, norm1, inv1, isEvenQuadrant ? progress : (1 - progress));
	}
	
	const quadrantAngle = getQuadrantAngle(rotation, isEvenQuadrant);
	const progress = quadrantAngle / DEGREES[90];
	
	const scale = Math.log2(norm1 / norm0);
	const scaleInv = Math.log2(inv1 / inv0);
	const threshold = scale / (scale + scaleInv);
	const avg0 = threshold * (inv0 - norm0) + norm0;
	
	return progress <= threshold ?
			getFinalZoomPoints(isNormX, norm0, avg0, norm1, avg0, progress / threshold) :
			getFinalZoomPoints(isInvX, avg0, inv0, avg0, inv1, (progress - threshold) / (1 - threshold));
};

export const getConstrainedZoom = ({x, y}, lowAxis, zoomPoints) => {
	const [xZoomPoint, yZoomPoint] = lowAxis === 'y' ? [zoomPoints[1], zoomPoints[0]] : zoomPoints;
	
	return Math.max(
		0.5 / (0.5 - Math.abs(x)) * xZoomPoint.z,
		0.5 / (0.5 - Math.abs(y)) * yZoomPoint.z,
	);
};

export default class extends Demo {
	setZoomPoints() {
		[this.lowAxis, ...this.zoomPoints] = getZoomPoints(demo);
		
		this.rails.set(
			[{x: 0, y: 0}, this.zoomPoints[1], true],
			[this.zoomPoints[1], CORNERS.TOP_RIGHT, true],
		);
	}
	
	getConstrainedZoom(position = demo.position) {
		return getConstrainedZoom(position, this.lowAxis, this.zoomPoints);
	}
	
	constrainPosition(effects) {
		super.constrainPosition({...effects, ratio: effects.ratio || effects.rotation});
	}
}
