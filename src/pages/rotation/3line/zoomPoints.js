import {CORNERS} from '@/pages/consts';
import {getAllStartZooms} from '../demo';

import {DEGREES} from '@/shared';
import {getFlipped, getLineC, getLineX, getM, getProgress, getZoomProgressed} from '../shared';

import {
	getRelevantDemo, getQuadrantAngle, getProgressAngles,
	getYIntersect, getPoints, getGenericIntersection,
	getXIntersect,
} from '../2line/zoomPoints';

export {getRelevantDemo};

const getP = ({end, ...first}, point) => {
	const axis = Math.abs(end.x) > Math.abs(end.y) ? 'x' : 'y';
	
	return (end[axis] - first[axis]) / (point[axis] - first[axis]);
};

const getIntersection = (lineFirst, lineSecond) => {
	const point = getGenericIntersection(lineFirst, lineSecond);
	const progress = (point.y - lineSecond[0].y) / (lineSecond[1].y - lineSecond[0].y);
	
	point.p = getP(lineFirst[0], point);
	point.z = lineSecond[0].z / (1 - progress);
	point.end = lineSecond[1];
	
	return point;
};

const getProgressedMiddle = (middle, fromZ, toZ) => {
	const mult = fromZ / toZ;
	
	return {
		x: middle.x * mult,
		y: middle.y * mult,
	};
};

const getPositionSum = (...positions) => positions.reduce((sum, {x, y}) => ({x: sum.x + x, y: sum.y + y}), {x: 0, y: 0});

const getDoFlip = (firstEnd, second, third) => {
	const {axis} = firstEnd;
	
	const {[axis]: positionFar} = getGenericIntersection([{x: 0, y: 0}, firstEnd], third);
	
	const [mThird, position] = [getM(...third), positionFar];
	const mFirst = firstEnd.y / firstEnd.x;
	
	return ((mFirst > 0) === (mThird < mFirst)) === ((second[axis] > 0) === (position < second[axis]));
};

const getSecond = (first, z, offset) => {
	const second = getZoomProgressed(first, first.end, z);
	
	second.p = getP(first, second);
	second.z = z;
	second.end = getPositionSum(getProgressedMiddle(first.end, first.z, z), offset, second);
	
	return second;
};

const getFullFlipped = (point) => ({...getFlipped(point), end: getFlipped(point.end)});

const getShared = ({startZooms: [zoomSide, zoomBase], ...data}) => {
	const isHorizontalFirst = zoomSide <= zoomBase;
	const isVerticalFlip = data.rotation < 0 && data.rotation > -DEGREES[180];
	
	const right = (isVerticalFlip !== data.isEvenQuadrant) ? getFlipped(data.right) : {...data.right};
	const top = isVerticalFlip ? getFlipped(data.top) : {...data.top};
	
	const [firstZoom, secondZoom, firstEnd, secondOffset, third] = isHorizontalFirst ?
			[zoomSide, zoomBase, right, top, [data.yIntersectSide, data.cornerSide]] :
			[zoomBase, zoomSide, top, right, [data.yIntersectBase, data.cornerBase]];
	
	const first = {x: 0, y: 0, z: firstZoom, end: {...firstEnd}};
	const second = getSecond(first, secondZoom, secondOffset);
	
	// flip
	right.x = -right.x;
	right.y = -right.y;
	
	const firstFlipped = {x: 0, y: 0, z: firstZoom, end: firstEnd};
	const secondFlipped = getSecond(firstFlipped, secondZoom, secondOffset);
	
	return getDoFlip(first.end, second, third) ?
			[getFullFlipped(firstFlipped), getFullFlipped(secondFlipped), firstFlipped, secondFlipped, {...first}, {...second}, first, second] :
			[{...first}, {...second}, first, second, getFullFlipped(firstFlipped), getFullFlipped(secondFlipped), firstFlipped, secondFlipped];
};

const mod = (first, second, third, firstFlipped, secondFlipped, yIntersect) => {
	if (third.z >= second.z) {
		return;
	}
	
	Object.assign(third, getIntersection([secondFlipped, secondFlipped.end], yIntersect));
	
	if (Math.abs(third.z) >= Math.abs(second.z)) {
		Object.assign(first, firstFlipped);
		Object.assign(second, secondFlipped, {axis: true});
		
		return;
	}
	
	Object.assign(third, getIntersection([first, first.end], yIntersect));
	third.isFirstInt = true;
};

const getAll = (data) => {
	const [
		firstSide, secondSide, firstBase, secondBase,
		firstSideFlipped, secondSideFlipped, firstBaseFlipped, secondBaseFlipped,
	] = getShared(data);
	
	const thirdSide = getIntersection([secondSide, secondSide.end], [data.yIntersectSide, data.cornerSide]);
	const thirdBase = getIntersection([secondBase, secondBase.end], [data.yIntersectBase, data.cornerBase]);
	
	// deal with rounding errors
	if (thirdSide.z <= secondSide.z && thirdBase.z <= secondBase.z) {
		// true if 90n multiple, false if 90n+45 multiple
		if (Math.abs(data.quadrantAngle - DEGREES[45]) > DEGREES['45_2']) {
			Object.assign(thirdSide, getIntersection([firstSide, firstSide.end], [data.yIntersectSide, data.cornerSide]));
			Object.assign(thirdBase, getIntersection([firstBase, firstBase.end], [data.yIntersectBase, data.cornerBase]));
			
			thirdSide.isFirstInt = thirdBase.isFirstInt = true;
		} else {
			Object.assign(firstSide, firstSideFlipped);
			Object.assign(firstBase, firstBaseFlipped);
			
			Object.assign(secondSide, secondSideFlipped);
			Object.assign(secondBase, secondBaseFlipped);
			
			Object.assign(thirdSide, getIntersection([secondSideFlipped, secondSideFlipped.end], [data.yIntersectSide, data.cornerSide]));
			Object.assign(thirdBase, getIntersection([secondBaseFlipped, secondBaseFlipped.end], [data.yIntersectBase, data.cornerBase]));
		}
	} else if (thirdBase.z <= thirdSide.z) {
		mod(firstBase, secondBase, thirdBase, firstBaseFlipped, secondBaseFlipped, [data.yIntersectBase, data.cornerBase]);
	} else {
		mod(firstSide, secondSide, thirdSide, firstSideFlipped, secondSideFlipped, [data.yIntersectSide, data.cornerSide]);
	}
	
	return [firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase];
};

const getAxisIntersects = ({sizesImage, sizesViewport, ratioViewport, ratioViewportInverse}, quadrantAngle, isEvenQuadrant, allowance = 0.002) => {
	const progressAngles = getProgressAngles(quadrantAngle, ratioViewport, ratioViewportInverse);
	
	if (quadrantAngle >= DEGREES[45]) {
		const yIntersectSide = getYIntersect(sizesImage, sizesViewport.halfWidth, quadrantAngle + progressAngles.side, progressAngles.side);
		const yIntersectBase = getYIntersect(sizesImage, sizesViewport.halfHeight, DEGREES[90] - quadrantAngle - progressAngles.base, progressAngles.base);
		
		return {
			yIntersectSide,
			yIntersectBase,
			intersectsMatch: Math.abs(yIntersectSide.y - yIntersectBase.y) <= allowance,
		};
	}
	
	const intersects = {
	// todo rename
		yIntersectSide: getXIntersect(sizesImage, sizesViewport.halfWidth, DEGREES[90] - quadrantAngle - progressAngles.side, progressAngles.side),
		yIntersectBase: getXIntersect(sizesImage, sizesViewport.halfHeight, quadrantAngle + progressAngles.base, progressAngles.base),
		isXIntersect: true,
	};
	
	intersects.intersectsMatch = Math.abs(intersects.yIntersectSide.x - intersects.yIntersectBase.x) <= allowance;
	
	if (isEvenQuadrant) {
		intersects.yIntersectSide = getFlipped(intersects.yIntersectSide);
	} else {
		intersects.yIntersectBase = getFlipped(intersects.yIntersectBase);
	}
	
	return intersects;
};

const getImageAxis = (intersect, corner, originZoom, isXIntersect = false) => {
	const first = {x: 0, y: 0, z: originZoom};
	const third = {...intersect, end: corner, isFirstInt: true};
	
	if (isXIntersect) {
		if ((intersect.x >= 0) !== (corner.x >= 0)) {
			third.x = 0;
			third.y = getLineC({m: getM(intersect, corner), ...intersect});
			third.z = intersect.z / (1 - third.y / corner.y);
			
			first.end = {x: 0, y: third.y / getProgress(originZoom, third.z)};
			third.p = first.end.y / third.y;
		} else {
			first.end = {x: intersect.x / getProgress(originZoom, intersect.z), y: 0};
			third.p = first.end.x / intersect.x;
		}
	} else {
		if (third.y < 0) {
			third.x = getLineX({m: getM(intersect, corner), c: intersect.y, ...intersect}, 0);
			third.y = 0;
			third.z = intersect.z / (1 - third.x / corner.x);
			
			first.end = {y: 0, x: third.x / getProgress(originZoom, third.z)};
			third.p = first.end.x / third.x;
		} else {
			first.end = {y: intersect.y / getProgress(originZoom, intersect.z), x: 0};
			third.p = first.end.y / intersect.y;
		}
	}
	
	return [first, first, third];
};

export default (demo, allStartZooms = getAllStartZooms(demo.rotation, demo.sizesViewport, demo.sizesImage)) => {
	const startZooms = [
		Math.min(allStartZooms[0].x, allStartZooms[1].x),
		Math.min(allStartZooms[0].y, allStartZooms[1].y),
	];
	
	const isEvenQuadrant = Math.floor(demo.rotation / DEGREES[90]) % 2 !== 0;
	const quadrantAngle = getQuadrantAngle(demo.rotation, isEvenQuadrant);
	
	const [cornerSide, cornerBase] = isEvenQuadrant ? [CORNERS.TOP_LEFT, CORNERS.TOP_RIGHT] : [CORNERS.TOP_RIGHT, CORNERS.TOP_LEFT];
	
	const data = {
		cornerSide, cornerBase, startZooms, quadrantAngle, isEvenQuadrant,
		...demo, ...getAxisIntersects(demo, quadrantAngle, isEvenQuadrant),
	};
	
	[data.right, data.top] = getPoints(data);
	
	let firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase;
	
	[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] = getAll(data);
	
	return isEvenQuadrant ?
			[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] :
			[firstBase, secondBase, thirdBase, firstSide, secondSide, thirdSide];
};
