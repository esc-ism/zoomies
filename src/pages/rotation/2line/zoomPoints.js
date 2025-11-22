import {DEGREES} from '@/shared';

import {CORNERS} from '../../consts';

import {getAllStartZooms} from '../demo';
import {getAxisIntersectY, getGenericIntersection, getM, getPoints, getProgressAngles, getQuadrantAngle} from '../shared';

const getIntersection = (line, corner, middle) => {
	const {x, y} = getGenericIntersection([{x: 0, y: 0}, middle], [line, corner]);
	const progress = (y - line.y) / (corner.y - line.y);
	
	return {x, y, z: line.z / (1 - progress), c: line.y};
};

const getIntersect = (z, yIntersect, corner, target, backup) => {
	const end = {...((Math.abs(getM(yIntersect, corner)) < 1) !== (Math.abs(target.y / target.x) < 1)) ? target : backup};
	const point = getIntersection(yIntersect, corner, end);
	
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

const getSecond = (demo, cornerSide, cornerBase, startZooms, quadrantAngle) => {
	const progressAngles = getProgressAngles(quadrantAngle, demo.ratioViewport, demo.ratioViewportInverse);
	
	const yIntersectSide = getAxisIntersectY(demo.sizesImage, demo.sizesViewport.halfWidth, quadrantAngle + progressAngles.side, progressAngles.side);
	const yIntersectBase = getAxisIntersectY(demo.sizesImage, demo.sizesViewport.halfHeight, DEGREES[90] - quadrantAngle - progressAngles.base, progressAngles.base);
	
	const points = getPoints(demo, startZooms, quadrantAngle);
	
	return [
		...getIntersect(startZooms[0], yIntersectSide, cornerSide, points[0], points[1]),
		...getIntersect(startZooms[1], yIntersectBase, cornerBase, points[1], points[0]),
	];
};

export default (demo, allStartZooms = getAllStartZooms(demo)) => {
	const startZooms = [
		Math.min(allStartZooms[0].x, allStartZooms[1].x),
		Math.min(allStartZooms[0].y, allStartZooms[1].y),
	];
	
	const isEvenQuadrant = Math.floor(demo.rotation / DEGREES[90]) % 2 !== 0;
	const quadrantAngle = getQuadrantAngle(demo.rotation, isEvenQuadrant);
	
	const [cornerSide, cornerBase] = isEvenQuadrant ? [CORNERS.TOP_LEFT, CORNERS.TOP_RIGHT] : [CORNERS.TOP_RIGHT, CORNERS.TOP_LEFT];
	
	const [firstSide, secondSide, firstBase, secondBase] = getSecond(demo, cornerSide, cornerBase, startZooms, quadrantAngle, isEvenQuadrant);
	
	return isEvenQuadrant ?
			[...[firstSide, secondSide], ...[firstBase, secondBase]] :
			[...[firstBase, secondBase], ...[firstSide, secondSide]];
};
