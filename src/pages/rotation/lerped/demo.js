import demo from '@/demo';
import {DEGREES} from '@/shared';

import {CORNERS} from '../../consts';
import Demo from '../../edge/demo';

import {getQuadrantAngle, getZoomProgressed} from '../shared';

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
	
	const avg0 = (norm0 + inv0) / 2;
	
	if (isNormX === isInvX) {
		const progress = isEvenQuadrant ?
				(((rotation + DEGREES[360]) % DEGREES[90]) / DEGREES[90]) :
				(1 - (((rotation + DEGREES[360]) % DEGREES[90]) / DEGREES[90]));
		
		const z0 = norm0 + (inv0 - norm0) * progress;
		const z1 = norm1 + (inv1 - norm1) * progress;
		
		if (isNormX) {
			return [
				'y',
				{x: 0, y: 0, z: z0, end: {x: 0, y: 0.5}},
				{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0, y: 0.5}, z1), z: z1},
			];
		}
		
		return [
			'x',
			{y: 0, x: 0, z: z0, end: {x: 0.5, y: 0}},
			{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0.5, y: 0}, z1), z: z1},
		];
	}
	
	const quadrantAngle = getQuadrantAngle(rotation, isEvenQuadrant);
	const progress = quadrantAngle / DEGREES[90];
	
	const flipP = (norm1 - 1) / ((inv1 - 1) + (norm1 - 1));
	
	if (progress <= flipP) {
		const progressNorm = progress / flipP;
		
		const z0 = norm0 + (avg0 - norm0) * progressNorm;
		const z1 = norm1 + (avg0 - norm1) * progressNorm;
		
		if (isNormX) {
			return [
				'y',
				{x: 0, y: 0, z: z0, end: {x: 0, y: 0.5}},
				{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0, y: 0.5}, z1), z: z1},
			];
		}
		
		return [
			'x',
			{y: 0, x: 0, z: z0, end: {x: 0.5, y: 0}},
			{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0.5, y: 0}, z1), z: z1},
		];
	}
	
	const progressInv = (progress - flipP) / (1 - flipP);
	
	const z0 = avg0 + (inv0 - avg0) * progressInv;
	const z1 = avg0 + (inv1 - avg0) * progressInv;
	
	if (isInvX) {
		return [
			'y',
			{x: 0, y: 0, z: z0, end: {x: 0, y: 0.5}},
			{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0, y: 0.5}, z1), z: z1},
		];
	}
	
	return [
		'x',
		{y: 0, x: 0, z: z0, end: {x: 0.5, y: 0}},
		{...getZoomProgressed({z: z0, x: 0, y: 0}, {x: 0.5, y: 0}, z1), z: z1},
	];
};

export const getConstrainedZoom = ({x, y}, lowAxis, zoomPoints) => {
	const [xZoomPoint, yZoomPoint] = lowAxis === 'y' ? [zoomPoints[1], zoomPoints[0]] : zoomPoints;
	
	return Math.max(
		(0.5 - xZoomPoint.x) / (0.5 - Math.abs(x)) * xZoomPoint.z,
		(0.5 - yZoomPoint.y) / (0.5 - Math.abs(y)) * yZoomPoint.z,
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
