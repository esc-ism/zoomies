import {CORNERS} from '@/pages/consts';
import {getAllStartZooms} from '../demo';

import {DEGREES} from '@/shared';

export const getPoints = ({rotation, sizesImage, sizesViewport, startZooms, quadrantAngle}) => {
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

export const getGenericIntersection = (line0, line1) => {
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

// the angle from 0,0 to the center of the image edge angled towards the viewport's upper-right corner
export const getQuadrantAngle = (rotation, isEvenQuadrant) => {
	const angle = (rotation + DEGREES[360]) % DEGREES[90];
	
	return isEvenQuadrant ? angle : DEGREES[90] - angle;
};

export const getProgressAngles = (quadrantAngle, viewportRatio, viewportRatioInverse) => {
	const progress = quadrantAngle / DEGREES[90] * -2 + 1;
	
	return {
		side: Math.atan(progress * viewportRatioInverse),
		base: Math.atan(progress * viewportRatio),
	};
};

export const getAxisIntersectY = (image, viewportSize, cornerAngle, progressAngle) => ({
	x: 0,
	y: (image.halfHeight - image.halfWidth * Math.tan(cornerAngle)) / image.height,
	z: viewportSize / (Math.cos(progressAngle) * Math.abs(image.halfWidth / Math.cos(cornerAngle))),
});

export const getAxisIntersectX = (image, viewportSize, cornerAngle, progressAngle) => ({
	x: (image.halfWidth - image.halfHeight * Math.tan(cornerAngle)) / image.width,
	y: 0,
	z: viewportSize / (Math.cos(progressAngle) * Math.abs(image.halfHeight / Math.cos(cornerAngle))),
});

export const getRelevantDemo = ({
	rotation,
	sizesViewport,
	sizesImage,
	ratioViewport = sizesViewport.width / sizesViewport.height,
	ratioViewportInverse = 1 / ratioViewport,
	ratioImage = sizesImage.width / sizesImage.height,
	ratioImageInverse = 1 / ratioImage,
	ratio = ratioViewport / ratioImage,
	ratioInverse = 1 / ratio,
}) => ({sizesViewport, ratioViewport, ratioViewportInverse, rotation, sizesImage, ratioImage, ratioImageInverse, ratio, ratioInverse});

export default (demo, allStartZooms = getAllStartZooms(demo.rotation, demo.sizesViewport, demo.sizesImage)) => {
	const startZooms = [
		Math.min(allStartZooms[0].x, allStartZooms[1].x),
		Math.min(allStartZooms[0].y, allStartZooms[1].y),
	];
	
	const isEvenQuadrant = Math.floor(demo.rotation / DEGREES[90]) % 2 !== 0;
	const quadrantAngle = getQuadrantAngle(demo.rotation, isEvenQuadrant);
	
	const progressAngles = getProgressAngles(quadrantAngle, demo.ratioViewport, demo.ratioViewportInverse);
	
	// todo replace the vpEnd stuff with 3line format
	//  also needs to be done for edge pan-limiting
	const [firstSide, firstBase] = startZooms.map((z) => ({x: 0, y: 0, z}));
	
	const [cornerSide, cornerBase] = isEvenQuadrant ? [CORNERS.TOP_LEFT, CORNERS.TOP_RIGHT] : [CORNERS.TOP_RIGHT, CORNERS.TOP_LEFT];
	
	const [secondSide, secondBase] = getSecond({
		...demo, cornerSide, cornerBase, startZooms, quadrantAngle, isEvenQuadrant,
		yIntersectSide: getAxisIntersectY(demo.sizesImage, demo.sizesViewport.halfWidth, quadrantAngle + progressAngles.side, progressAngles.side),
		yIntersectBase: getAxisIntersectY(demo.sizesImage, demo.sizesViewport.halfHeight, DEGREES[90] - quadrantAngle - progressAngles.base, progressAngles.base),
	});
	
	return isEvenQuadrant ?
			[...[firstSide, secondSide], ...[firstBase, secondBase]] :
			[...[firstBase, secondBase], ...[firstSide, secondSide]];
};
