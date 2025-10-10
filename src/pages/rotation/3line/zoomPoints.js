import {CORNERS} from '@/pages/consts';
import {DEGREES} from '@/shared';

import {
	getFlipped, getM, getZoomProgressed, getQuadrantAngle, getProgressAngles,
	getAxisIntersectY, getPoints, getGenericIntersection, getAxisIntersectX,
} from '../shared';
import {getAllStartZooms} from '../demo';

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

const getDoFlip = (firstEnd, second, third) => {
	const {axis} = firstEnd;
	
	const {[axis]: position} = getGenericIntersection([{x: 0, y: 0}, firstEnd], third);
	
	const mThird = getM(...third);
	const mFirst = firstEnd.y / firstEnd.x;
	
	return ((mFirst > 0) === (mThird < mFirst)) === ((second[axis] > 0) === (position < second[axis]));
};

const getSecond = (first, z, offset) => {
	const second = getZoomProgressed(first, first.end, z);
	const mult = first.z / z;
	
	second.p = getP(first, second);
	second.z = z;
	second.end = {
		x: first.end.x * mult + offset.x + second.x,
		y: first.end.y * mult + offset.y + second.y,
	};
	
	return second;
};

const getFullFlipped = (point) => ({...getFlipped(point), end: getFlipped(point.end)});

const getShared = ({startZooms: [zoomSide, zoomBase], ...data}) => {
	const isVerticalFlip = data.rotation < 0 && data.rotation > -DEGREES[180];
	
	const right = (isVerticalFlip !== data.isEvenQuadrant) ? getFlipped(data.right) : {...data.right};
	const top = isVerticalFlip ? getFlipped(data.top) : {...data.top};
	
	const [firstZoom, secondZoom, firstEnd, secondOffset, third] = (zoomSide <= zoomBase) ?
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
			[
				getFullFlipped(firstFlipped), getFullFlipped(secondFlipped), firstFlipped, secondFlipped,
				{...first}, {...second}, first, second,
			] :
			[
				{...first}, {...second}, first, second,
				getFullFlipped(firstFlipped), getFullFlipped(secondFlipped), firstFlipped, secondFlipped,
			];
};

const mod = (first, second, third, firstFlipped, secondFlipped, yIntersect) => {
	if (third.z >= second.z) {
		return;
	}
	
	Object.assign(third, getIntersection([secondFlipped, secondFlipped.end], yIntersect));
	
	if (third.z >= second.z) {
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
			// don't know why this happens 🤷‍♂️
			if ((firstSide.end[firstSide.end.axis] < 0) !== (data.cornerSide[firstSide.end.axis] < 0)) {
				Object.assign(firstSide, firstSideFlipped);
			}
			
			if ((firstBase.end[firstBase.end.axis] < 0) !== (data.cornerBase[firstBase.end.axis] < 0)) {
				Object.assign(firstBase, firstBaseFlipped);
			}
			
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

const getAxisIntersects = ({sizesImage, sizesViewport, ratioViewport, ratioViewportInverse}, quadrantAngle, isEvenQuadrant) => {
	const progressAngles = getProgressAngles(quadrantAngle, ratioViewport, ratioViewportInverse);
	
	if (quadrantAngle >= DEGREES[45]) {
		const yIntersectSide = getAxisIntersectY(sizesImage, sizesViewport.halfWidth, quadrantAngle + progressAngles.side, progressAngles.side);
		const yIntersectBase = getAxisIntersectY(sizesImage, sizesViewport.halfHeight, DEGREES[90] - quadrantAngle - progressAngles.base, progressAngles.base);
		
		return {
			yIntersectSide,
			yIntersectBase,
		};
	}
	
	const intersects = {
		// todo rename
		yIntersectSide: getAxisIntersectX(sizesImage, sizesViewport.halfWidth, DEGREES[90] - quadrantAngle - progressAngles.side, progressAngles.side),
		yIntersectBase: getAxisIntersectX(sizesImage, sizesViewport.halfHeight, quadrantAngle + progressAngles.base, progressAngles.base),
	};
	
	if (isEvenQuadrant) {
		intersects.yIntersectSide = getFlipped(intersects.yIntersectSide);
	} else {
		intersects.yIntersectBase = getFlipped(intersects.yIntersectBase);
	}
	
	return intersects;
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
	
	[data.right, data.top] = getPoints(demo, startZooms, quadrantAngle);
	
	const [firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] = getAll(data);
	
	return isEvenQuadrant ?
			[firstSide, secondSide, thirdSide, firstBase, secondBase, thirdBase] :
			[firstBase, secondBase, thirdBase, firstSide, secondSide, thirdSide];
};
