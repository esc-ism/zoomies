import {CORNERS} from '@/pages/consts';
import {getAllStartZooms} from '../demo';

import {DEGREES} from '@/shared';
import {getFlipped, getZoomProgressed} from '../shared';

import {getRelevantDemo, getQuadrantAngle, getProgressAngles, getYIntersect} from '../2line/zoomPoints';
import {getPoints, getGenericIntersection} from '../2line/axisViewport/zoomPoints';

export {getRelevantDemo};

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

const getShared = (data, doFlip) => {
	const [right, top] = getPoints(data);
	
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
	
	const first = {x: 0, y: 0, end: firstEnd, z: firstZoom, axis: firstEnd.axis};
	const second = addP(first, getZoomProgressed(first, firstEnd, secondZoom));
	
	second.z = secondZoom;
	second.end = getPositionSum(secondEnd, second);
	
	return [first, second, doFlip];
};

const getFullFlipped = (point) => ({...getFlipped(point), end: getFlipped(point.end)});

const getAll = (data, doFlip) => {
	let [first, second] = getShared(data, doFlip);
	
	let thirdSide = getIntersection([second, second.end], [data.yIntersectSide, data.cornerSide]);
	let thirdBase = getIntersection([second, second.end], [data.yIntersectBase, data.cornerBase]);
	let firstSide = first;
	let firstBase = first;
	let secondSide = second;
	let secondBase = second;
	
	if (doFlip) {
		thirdSide = getFullFlipped(getIntersection([second, second.end], [getFlipped(data.yIntersectSide), getFlipped(data.cornerSide)]));
		
		firstSide = getFullFlipped(first);
		secondSide = getFullFlipped(second);
	} else {
		thirdSide = getIntersection([second, second.end], [data.yIntersectSide, data.cornerSide]);
	}
	
	if (thirdSide.z < second.z) {
		thirdSide = getIntersection([first, first.end], [data.yIntersectSide, data.cornerSide]);
		
		thirdSide.isFirstInt = true;
	} else if (thirdBase.z < second.z) {
		thirdBase = getIntersection([first, first.end], [data.yIntersectBase, data.cornerBase]);
		
		thirdBase.isFirstInt = true;
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
	
	let [firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] = getAll(data, false);
	
	if (
		(thirdSide.p < 0 && (!thirdSide.isFirstInt || -thirdSide.p < secondBase.p))
		|| (thirdBase.p < 0 && (!thirdBase.isFirstInt || -thirdBase.p < secondSide.p))
	) {
		[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] = getAll(data, true);
	}
	
	return isEvenQuadrant ?
			[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] :
			[firstBase, secondBase, thirdBase, firstSide, secondSide, thirdSide];
};
