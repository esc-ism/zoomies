import {CORNERS} from '@/pages/consts';
import {getAllStartZooms} from '../demo';

import {DEGREES} from '@/shared';
import {getAxisIntersectY, getGenericIntersection, getPoints, getProgressAngles, getQuadrantAngle} from '../shared';

const getIntersection = (line, corner, middle) => {
	const {x, y} = getGenericIntersection([{x: 0, y: 0}, middle], [line, corner]);
	const progress = (y - line.y) / (corner.y - line.y);
	
	return {x, y, z: line.z / (1 - progress), c: line.y};
};

const getIntersect = (z, yIntersect, corner, right, top) => {
	const point0 = getIntersection(yIntersect, corner, right);
	const point1 = getIntersection(yIntersect, corner, top);
	
	const [point, end] = point0.z > point1.z ? [point0, {...right}] : [point1, {...top}];
	
	if (Math.sign(point[end.axis]) !== Math.sign(end[end.axis])) {
		end.x = -end.x;
		end.y = -end.y;
	}
	
	const axis = Math.abs(end.x) > Math.abs(end.y) ? 'x' : 'y';
	
	return [
		{x: 0, y: 0, z, end},
		{...point, p: end[axis] / point[axis]},
	];
};

const getSecond = (data) => {
	const points = getPoints(data);
	
	return [
		...getIntersect(data.startZooms[0], data.yIntersectSide, data.cornerSide, ...points),
		...getIntersect(data.startZooms[1], data.yIntersectBase, data.cornerBase, ...points),
	];
};

export default (demo, allStartZooms = getAllStartZooms(demo.rotation, demo.sizesViewport, demo.sizesImage)) => {
	const startZooms = [
		Math.min(allStartZooms[0].x, allStartZooms[1].x),
		Math.min(allStartZooms[0].y, allStartZooms[1].y),
	];
	
	const isEvenQuadrant = Math.floor(demo.rotation / DEGREES[90]) % 2 !== 0;
	const quadrantAngle = getQuadrantAngle(demo.rotation, isEvenQuadrant);
	
	const progressAngles = getProgressAngles(quadrantAngle, demo.ratioViewport, demo.ratioViewportInverse);
	
	const [cornerSide, cornerBase] = isEvenQuadrant ? [CORNERS.TOP_LEFT, CORNERS.TOP_RIGHT] : [CORNERS.TOP_RIGHT, CORNERS.TOP_LEFT];
	
	const [firstSide, secondSide, firstBase, secondBase] = getSecond({
		...demo, cornerSide, cornerBase, startZooms, quadrantAngle, isEvenQuadrant,
		yIntersectSide: getAxisIntersectY(demo.sizesImage, demo.sizesViewport.halfWidth, quadrantAngle + progressAngles.side, progressAngles.side),
		yIntersectBase: getAxisIntersectY(demo.sizesImage, demo.sizesViewport.halfHeight, DEGREES[90] - quadrantAngle - progressAngles.base, progressAngles.base),
	});
	
	return isEvenQuadrant ?
			[...[firstSide, secondSide], ...[firstBase, secondBase]] :
			[...[firstBase, secondBase], ...[firstSide, secondSide]];
};
