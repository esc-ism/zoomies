import {CORNERS} from '@/pages/consts';
import {getAllStartZooms} from '../demo';

import {DEGREES} from '@/shared';
import {getFlipped, getM, getZoomProgressed} from '../shared';

export {getRelevantDemo} from '../2line/zoomPoints';

const getQuadrantAngle = (rotation, isEvenQuadrant) => {
	const angle = (rotation + DEGREES[360]) % DEGREES[90];
	
	return isEvenQuadrant ? angle : DEGREES[90] - angle;
};

const getProgressAngles = (quadrantAngle, viewportRatio, viewportRatioInverse) => {
	const progress = quadrantAngle / DEGREES[90] * -2 + 1;
	
	return {
		side: Math.atan(progress * viewportRatioInverse),
		base: Math.atan(progress * viewportRatio),
	};
};

const getYIntersect = (image, viewportSize, cornerAngle, progressAngle) => ({
	x: 0,
	y: (image.halfHeight - image.halfWidth * Math.tan(cornerAngle)) / image.height,
	z: viewportSize / (Math.cos(progressAngle) * Math.abs(image.halfWidth / Math.cos(cornerAngle))),
});

const getRight = ({rotation, sizesImage, sizesViewport, startZooms, quadrantAngle}, zoom = startZooms[0]) => {
	const axis = quadrantAngle >= DEGREES[45] ? 'y' : 'x';
	const x = sizesViewport.halfWidth / zoom;
	const theta = DEGREES[90] - rotation;
	
	return {
		x: x * Math.cos(theta) / sizesImage.width,
		y: x * Math.sin(theta) / sizesImage.height,
		axis,
	};
};

const getTop = ({rotation, sizesImage, sizesViewport, startZooms, quadrantAngle}, zoom = startZooms[1]) => {
	const axis = quadrantAngle >= DEGREES[45] ? 'x' : 'y';
	const y = sizesViewport.halfHeight / zoom;
	const theta = DEGREES[180] - rotation;
	
	return {
		x: y * Math.cos(theta) / sizesImage.width,
		y: y * Math.sin(theta) / sizesImage.height,
		axis,
	};
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

const addP = ({end, ...first}, point) => {
	const axis = Math.abs(end.x) > Math.abs(end.y) ? 'x' : 'y';
	
	point.p = (end[axis] - first[axis]) / (point[axis] - first[axis]);
	
	return point;
};

const getIntersection = (lineFirst, lineSecond) => {
	const {x, y} = getGenericIntersection(lineFirst, lineSecond);
	const progress = (y - lineSecond[0].y) / (lineSecond[1].y - lineSecond[0].y);
	
	return addP(lineFirst[0], {x, y, z: lineSecond[0].z / (1 - progress), c: lineSecond[0].y, end: lineSecond[1]});
};

const getProgressedMiddle = (middle, fromZ, toZ) => {
	const mult = fromZ / toZ;
	
	return {
		x: middle.x * mult,
		y: middle.y * mult,
	};
};

const getPositionSum = (...positions) => positions.reduce((sum, {x, y}) => ({x: sum.x + x, y: sum.y + y}), {x: 0, y: 0});

const getShared = (data) => {
	const doFlip = getGenericIntersection([data.yIntersectSide, data.cornerSide], [data.yIntersectBase, data.cornerBase]).y < 0;
	// console.log([doFlip, (1 - Math.abs(getM(data.yIntersectSide, data.cornerSide))) + (1 - Math.abs(getM(data.yIntersectBase, data.cornerBase)))]);
	
	const right = getRight(data);
	const top = getTop(data);
	
	if (doFlip !== data.isEvenQuadrant) {
		right.x = -right.x;
		right.y = -right.y;
	}
	
	if (data.rotation < 0 && data.rotation > -DEGREES[180]) {
		right.x = -right.x;
		right.y = -right.y;
		
		top.x = -top.x;
		top.y = -top.y;
	}
	
	const [zoomSide, zoomBase] = data.startZooms;
	const [firstZoom, secondZoom, firstEnd, secondEnd] = zoomSide <= zoomBase ?
			[zoomSide, zoomBase, right, getPositionSum(getProgressedMiddle(right, zoomSide, zoomBase), top)] :
			[zoomBase, zoomSide, top, getPositionSum(right, getProgressedMiddle(top, zoomBase, zoomSide))];
	
	const first = {x: 0, y: 0, end: firstEnd, z: firstZoom};
	const second = addP(first, getZoomProgressed(first, firstEnd, secondZoom));
	
	second.z = secondZoom;
	second.end = getPositionSum(secondEnd, second);
	
	return [first, second, doFlip];
};

const getAllFlipped = (...lines) => lines.map(([a, b]) => [getFlipped(a), getFlipped(b)]);

const getFullFlipped = (point) => ({...getFlipped(point), end: getFlipped(point.end)});

const getAll = (data) => {
	const [first, second, doFlip] = getShared(data);
	
	let firstSide = first;
	let firstBase = first;
	let secondSide = second;
	let secondBase = second;
	let thirdSide;
	let thirdBase;
	
	if (doFlip) {
		thirdSide = getFullFlipped(getIntersection([second, second.end], ...getAllFlipped([data.yIntersectSide, data.cornerSide])));
		thirdBase = getIntersection([second, second.end], [data.yIntersectBase, data.cornerBase]);
		
		firstSide = getFullFlipped(first);
		secondSide = getFullFlipped(second);
	} else {
		thirdSide = getIntersection([second, second.end], [data.yIntersectSide, data.cornerSide]);
		thirdBase = getIntersection([second, second.end], [data.yIntersectBase, data.cornerBase]);
	}
	
	if (thirdSide.z < second.z) {
		thirdSide = getIntersection([first, first.end], [data.yIntersectSide, data.cornerSide]);
	} else if (thirdBase.z < second.z) {
		thirdBase = getIntersection([first, first.end], [data.yIntersectBase, data.cornerBase]);
	}
	
	return [firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase];
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
	
	const data = {
		...demo, cornerSide, cornerBase, startZooms, quadrantAngle, isEvenQuadrant,
		yIntersectSide: getYIntersect(demo.sizesImage, demo.sizesViewport.halfWidth, quadrantAngle + progressAngles.side, progressAngles.side),
		yIntersectBase: getYIntersect(demo.sizesImage, demo.sizesViewport.halfHeight, DEGREES[90] - quadrantAngle - progressAngles.base, progressAngles.base),
	};
	
	const [firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] = getAll(data);
	
	return isEvenQuadrant ?
			[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] :
			[firstBase, secondBase, thirdBase, firstSide, secondSide, thirdSide];
};
