import {CORNERS} from '@/pages/consts';
import {getAllStartZooms} from '../demo';

import {DEGREES, ERROR_ALLOWANCE} from '@/shared';
import {getFlipped, getLine, getLineC, getLineX, getLineY, getM, getProgress, getZoomProgressed} from '../shared';

import {
	getRelevantDemo, getQuadrantAngle, getProgressAngles,
	getYIntersect, getPoints, getGenericIntersection,
	getXIntersect,
} from '../2line/zoomPoints';

export {getRelevantDemo};

const addP = ({end, ...first}, point) => {
	const axis = Math.abs(end.x) > Math.abs(end.y) ? 'x' : 'y';
	
	point.p = (end[axis] - first[axis]) / (point[axis] - first[axis]);
	
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

const getShared = (data, doFlip) => {
	const right = {...data.right};
	const top = {...data.top};
	
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
	
	return [first, second];
};

const getFullFlipped = (point) => ({...getFlipped(point), end: getFlipped(point.end)});

const getAll = (data, doFlip) => {
	const [firstBase, secondBase] = getShared(data, doFlip);
	const [firstSide, secondSide] = doFlip ? [getFullFlipped(firstBase), getFullFlipped(secondBase)] : [firstBase, secondBase];
	
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
	const third = {...intersect, end: corner};
	
	if (isXIntersect) {
		if ((third.x >= 0) !== (corner.x >= 0)) {
			third.x = 0;
			third.y = getLineC({m: getM(third, corner), ...third});
			third.z = third.z / (1 - third.y / corner.y);
			
			first.end = {x: 0, y: third.y / getProgress(originZoom, third.z)};
			third.p = first.end.y / third.y;
		} else {
			first.end = {x: third.x / getProgress(originZoom, third.z), y: 0};
			third.p = first.end.x / third.x;
		}
	} else {
		if (third.y < 0) {
			third.x = getLineX({m: getM(third, corner), c: third.y, ...third}, 0);
			third.y = 0;
			third.z = third.z / (1 - third.x / corner.x);
			
			first.end = {y: 0, x: third.x / getProgress(originZoom, third.z)};
			third.p = first.end.x / third.x;
		} else {
			first.end = {y: third.y / getProgress(originZoom, third.z), x: 0};
			third.p = first.end.y / third.y;
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
	if (data.intersectsMatch && (Math.abs(quadrantAngle - DEGREES[45]) > 0 || Math.abs(startZooms[0] - startZooms[1]) < 0.01)) {
		[firstSide, secondSide, thirdSide] = getImageAxis(data.yIntersectSide, data.cornerSide, startZooms[0], data.isXIntersect);
		[firstBase, secondBase, thirdBase] = getImageAxis(data.yIntersectBase, data.cornerBase, startZooms[1], data.isXIntersect);
	} else {
		[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] = getAll(data, false);
		
		if (
			(thirdSide.p < 0 && (!thirdSide.isFirstInt || -thirdSide.p < secondBase.p))
			|| (thirdBase.p < 0 && (!thirdBase.isFirstInt || -thirdBase.p < secondSide.p))
		) {
			[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] = getAll(data, true);
		}
	}
	
	// todo necessary?
	thirdSide.p = Math.abs(thirdSide.p);
	thirdBase.p = Math.abs(thirdBase.p);
	
	return isEvenQuadrant ?
			[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] :
			[firstBase, secondBase, thirdBase, firstSide, secondSide, thirdSide];
};
