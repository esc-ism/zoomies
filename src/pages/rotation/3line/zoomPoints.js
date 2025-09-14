import {CORNERS} from '@/pages/consts';
import {getAllStartZooms} from '../demo';

import {DEGREES, ERROR_ALLOWANCE} from '@/shared';
import {getFlipped, getLine, getLineC, getLineX, getM, getProgress, getZoomProgressed} from '../shared';

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

const addP = (first, point) => {
	point.p = getP(first, point);
	
	return point;
};

const getIntersection = (lineFirst, lineSecond) => {
	const {x, y} = getGenericIntersection(lineFirst, lineSecond);
	const progress = (y - lineSecond[0].y) / (lineSecond[1].y - lineSecond[0].y);
	
	return addP(lineFirst[0], {
		// todo unnecessarily adding a c?
		...getLine(getM(...lineSecond), {x, y}),
		z: lineSecond[0].z / (1 - progress),
		end: lineSecond[1],
	});
};

const getProgressedMiddle = (middle, fromZ, toZ) => {
	const mult = fromZ / toZ;
	
	return {
		x: middle.x * mult,
		y: middle.y * mult,
	};
};

const getPositionSum = (...positions) => positions.reduce((sum, {x, y}) => ({x: sum.x + x, y: sum.y + y}), {x: 0, y: 0});

const getDoFlip = (firstEnd, second, thirdFar, thirdNear) => {
	const {axis} = firstEnd;
	
	const {[axis]: positionFar} = getGenericIntersection([{x: 0, y: 0}, firstEnd], thirdFar);
	const {[axis]: positionNear} = getGenericIntersection([{x: 0, y: 0}, firstEnd], thirdNear);
	
	const [mThird, position] = [getM(...thirdFar), positionFar];
	// const [mThird, position] = Math.abs(positionFar) < Math.abs(positionNear) ? [getM(...thirdNear), positionNear] : [getM(...thirdFar), positionFar];
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

const getShared = ({startZooms: [zoomSide, zoomBase], ...data}) => {
	const isHorizontalFirst = zoomSide <= zoomBase;
	const isVerticalFlip = data.rotation < 0 && data.rotation > -DEGREES[180];
	
	const right = (isVerticalFlip !== data.isEvenQuadrant) ? getFlipped(data.right) : {...data.right};
	const top = isVerticalFlip ? getFlipped(data.top) : {...data.top};
	
	const [firstZoom, secondZoom, firstEnd, secondOffset, thirdFar, thirdNear] = isHorizontalFirst ?
			[zoomSide, zoomBase, right, top, [data.yIntersectSide, data.cornerSide], [data.yIntersectBase, data.cornerBase]] :
			[zoomBase, zoomSide, top, right, [data.yIntersectBase, data.cornerBase], [data.yIntersectSide, data.cornerSide]];
	
	const first = {x: 0, y: 0, z: firstZoom, end: {...firstEnd}};
	const second = getSecond(first, secondZoom, secondOffset);
	const doFlip = getDoFlip(firstEnd, second, thirdFar, thirdNear);
	
	// flip
	right.x = -right.x;
	right.y = -right.y;
	
	const firstFlipped = {x: 0, y: 0, z: firstZoom, end: firstEnd};
	const secondFlipped = getSecond(firstFlipped, secondZoom, secondOffset);
	
	return doFlip ?
			[getFullFlipped(firstFlipped), getFullFlipped(secondFlipped), firstFlipped, secondFlipped, {...first}, {...second}, first, second] :
			[{...first}, {...second}, first, second, getFullFlipped(firstFlipped), getFullFlipped(secondFlipped), firstFlipped, secondFlipped];
};

const getFullFlipped = (point) => ({...getFlipped(point), end: getFlipped(point.end)});

const getAll = (data) => {
	const [
		firstSide, secondSide, firstBase, secondBase,
		firstSideFlipped, secondSideFlipped, firstBaseFlipped, secondBaseFlipped,
	] = getShared(data);
	
	let thirdSide = getIntersection([secondSide, secondSide.end], [data.yIntersectSide, data.cornerSide]);
	let thirdBase = getIntersection([secondBase, secondBase.end], [data.yIntersectBase, data.cornerBase]);
	
	if (thirdBase.z <= thirdSide.z) {
		if (thirdBase.z < secondBase.z) {
			thirdBase = getIntersection([firstBase, firstBase.end], [data.yIntersectBase, data.cornerBase]);
			
			thirdBase.isFirstInt = true;
		}
	} else {
		if (thirdSide.z < secondSide.z) {
			thirdSide = getIntersection([firstSide, firstSide.end], [data.yIntersectSide, data.cornerSide]);
			
			thirdSide.isFirstInt = true;
		}
	}
	
	if (thirdSide.isFirstInt) {
		if (Math.abs(thirdSide.y) > Math.abs(secondBase.y)) {
			Object.assign(firstSide, firstSideFlipped);
			Object.assign(secondSide, secondSideFlipped, {axis: true});
			
			thirdSide = getIntersection([secondSide, secondSide.end], [data.yIntersectSide, data.cornerSide]);
		}
	} else if (thirdBase.isFirstInt) {
		if (Math.abs(thirdBase.y) > Math.abs(secondSide.y)) {
			Object.assign(firstBase, firstBaseFlipped);
			Object.assign(secondBase, secondBaseFlipped, {axis: true});
			
			thirdBase = getIntersection([secondBase, secondBase.end], [data.yIntersectBase, data.cornerBase]);
		}
	}
	
	// todo necessary?
	thirdSide.p = Math.abs(thirdSide.p);
	thirdBase.p = Math.abs(thirdBase.p);
	
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
	
	// mitigates bugginess from rounding errors
	// if (data.intersectsMatch && (Math.abs(quadrantAngle - DEGREES[45]) > 0 || Math.abs(startZooms[0] - startZooms[1]) < 0.01)) {
	// 	[firstSide, secondSide, thirdSide] = getImageAxis(data.yIntersectSide, data.cornerSide, startZooms[0], data.isXIntersect);
	// 	[firstBase, secondBase, thirdBase] = getImageAxis(data.yIntersectBase, data.cornerBase, startZooms[1], data.isXIntersect);
	// } else {
	[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] = getAll(data);
	
	return isEvenQuadrant ?
			[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] :
			[firstBase, secondBase, thirdBase, firstSide, secondSide, thirdSide];
};
