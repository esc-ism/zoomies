import {DEGREES} from '@/shared';

import getZoomPoints from '../zoomPoints';

const getPoints = (rotation, image, viewport, startZooms, doFlip) => {
	const rightX = viewport.halfWidth / startZooms[0];
	const topY = viewport.halfHeight / startZooms[1];
	
	const rightTheta = DEGREES[90] - rotation;
	const topTheta = rightTheta + DEGREES[90];
	
	return [
		{
			x: rightX * Math.cos(rightTheta) / image.width,
			y: rightX * Math.sin(rightTheta) / image.height,
			axis: doFlip ? 'y' : 'x',
		},
		{
			x: topY * Math.cos(topTheta) / image.width,
			y: topY * Math.sin(topTheta) / image.height,
			axis: doFlip ? 'x' : 'y',
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

const getIntersection = (viewport, image, line, corner, middle) => {
	const {x, y} = getGenericIntersection([{x: 0, y: 0}, middle], [line, corner]);
	const progress = (y - line.y) / (corner.y - line.y);
	
	return {x, y, z: line.z / (1 - progress), c: line.y};
};

const getIntersect = (viewport, image, yIntersect, corner, right, top) => {
	const point0 = getIntersection(viewport, image, yIntersect, corner, right);
	const point1 = getIntersection(viewport, image, yIntersect, corner, top);
	
	const [point, vpEnd] = point0.z > point1.z ? [point0, {...right}] : [point1, {...top}];
	
	// todo do you need to reference the specific axis?
	//  can you just say if either axis' sign isn't equal?
	//  if so get rid of the axis assignments
	// if (Math.sign(point[vpEnd.axis]) !== Math.sign(vpEnd[vpEnd.axis])) {
	// 	vpEnd.x = -vpEnd.x;
	// 	vpEnd.y = -vpEnd.y;
	// }
	
	const axis = Math.abs(vpEnd.x) > Math.abs(vpEnd.y) ? 'x' : 'y';
	
	return {...point, vpEnd, p: vpEnd[axis] / point[axis]};
};

export const getSecond = ({rotation, viewport, image, yIntersectSide, yIntersectBase, cornerSide, cornerBase, startZooms, quadrantAngle}) => {
	const points = getPoints(rotation, image, viewport, startZooms, quadrantAngle >= DEGREES[45]);
	
	return [
		getIntersect(viewport, image, yIntersectSide, cornerSide, ...points),
		getIntersect(viewport, image, yIntersectBase, cornerBase, ...points),
	];
};

export default getZoomPoints.bind(null, getSecond);
