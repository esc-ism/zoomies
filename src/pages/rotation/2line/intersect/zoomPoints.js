import {CORNERS} from '@/pages/consts';
import {getFlipped, getProgress, getDistance} from '../../shared';

const getGenericIntersection = (line0, line1) => {
	const a0 = line0[0].y - line0[1].y;
	const b0 = line0[1].x - line0[0].x;
	const c0 = line0[1].x * line0[0].y - line0[0].x * line0[1].y;
	
	const a1 = line1[0].y - line1[1].y;
	const b1 = line1[1].x - line1[0].x;
	const c1 = line1[1].x * line1[0].y - line1[0].x * line1[1].y;
	
	const d = a0 * b1 - b0 * a1;
	
	return {
		x: (c0 * b1 - b0 * c1) / d,
		y: (a0 * c1 - c0 * a1) / d,
	};
};

export const replaceVpEnd = (() => {
	const getModdedSecond = (intersection, second, end, firstZoom) => {
		const z = second.z / (1 - (intersection.x - second.x) / (end.x - second.x));
		const zoomProgress = getProgress(firstZoom, z);
		const vpEnd = {x: intersection.x / zoomProgress, y: intersection.y / zoomProgress};
		
		return {
			...intersection,
			vpEnd,
			p: Math.abs(vpEnd.x / intersection.x),
			z,
		};
	};
	
	const getEnds = (secondSide, secondBase, {cornerSide, cornerBase, isEvenQuadrant, ratioImage}) => {
		if (getDistance(secondSide, cornerSide) + getDistance(secondBase, cornerBase) <= Math.SQRT2) {
			return [cornerSide, cornerBase];
		}
		
		return isEvenQuadrant ?
				[CORNERS.BOTTOM_RIGHT, CORNERS.TOP_RIGHT, Object.assign(secondSide, getFlipped(secondSide))] :
				[CORNERS.TOP_RIGHT, CORNERS.BOTTOM_RIGHT, Object.assign(secondBase, getFlipped(secondBase))];
	};
	
	return (data) => {
		const secondSide = {...data.yIntersectSide};
		const secondBase = {...data.yIntersectBase};
		const [endSide, endBase, flipped] = getEnds(secondSide, secondBase, data);
		const intersection = getGenericIntersection([secondSide, endSide], [secondBase, endBase]);
		
		Object.assign(secondSide, getModdedSecond(intersection, secondSide, endSide, data.startZooms[0]));
		Object.assign(secondBase, getModdedSecond(intersection, secondBase, endBase, data.startZooms[1]));
		
		if (flipped) {
			flipped.vpEnd = getFlipped(flipped.vpEnd);
			Object.assign(flipped, getFlipped(flipped));
		}
		
		return [secondSide, secondBase];
	};
})();
