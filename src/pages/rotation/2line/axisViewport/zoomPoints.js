import {DEGREES} from '@/shared';

import getZoomPoints from '../zoomPoints';

const isPositiveM = (to, from = {x: 0, y: 0}) => (to.x > from.x) === (to.y > from.y);

export const isPartialTarget = (second, corner) => isPositiveM(corner, second) !== isPositiveM(second.vpEnd);

const getPoints = ({rotation, sizesImage, sizesViewport, startZooms, quadrantAngle}) => {
	const [axisRight, axisTop] = quadrantAngle >= DEGREES[45] ? ['y', 'x'] : ['x', 'y'];
	
	const xRight = sizesViewport.halfWidth / startZooms[0];
	const yTop = sizesViewport.halfHeight / startZooms[1];
	
	const thetaRight = DEGREES[90] - rotation;
	const thetaTop = thetaRight + DEGREES[90];
	
	return [
		{
			x: xRight * Math.cos(thetaRight) / sizesImage.width,
			y: xRight * Math.sin(thetaRight) / sizesImage.height,
			axis: axisRight,
		},
		{
			x: yTop * Math.cos(thetaTop) / sizesImage.width,
			y: yTop * Math.sin(thetaTop) / sizesImage.height,
			axis: axisTop,
		},
	];
};

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

const getIntersection = (line, corner, middle) => {
	const {x, y} = getGenericIntersection([{x: 0, y: 0}, middle], [line, corner]);
	const progress = (y - line.y) / (corner.y - line.y);
	
	return {x, y, z: line.z / (1 - progress), c: line.y};
};

const getIntersect = (yIntersect, corner, right, top) => {
	const point0 = getIntersection(yIntersect, corner, right);
	const point1 = getIntersection(yIntersect, corner, top);
	
	const [point, vpEnd] = point0.z > point1.z ? [point0, {...right}] : [point1, {...top}];
	
	if (Math.sign(point[vpEnd.axis]) !== Math.sign(vpEnd[vpEnd.axis])) {
		vpEnd.x = -vpEnd.x;
		vpEnd.y = -vpEnd.y;
	}
	
	const axis = Math.abs(vpEnd.x) > Math.abs(vpEnd.y) ? 'x' : 'y';
	
	return {...point, vpEnd, p: vpEnd[axis] / point[axis]};
};

export const getSecond = (data) => {
	const points = getPoints(data);
	
	return [
		getIntersect(data.yIntersectSide, data.cornerSide, ...points),
		getIntersect(data.yIntersectBase, data.cornerBase, ...points),
	];
};

export default getZoomPoints.bind(null, getSecond);
