import {DEGREES} from '@/shared';
import {getAllStartZooms} from '../demo';
import {getAxisIntersectX, getAxisIntersectY, getFlipped, getProgress, getProgressAngles, getQuadrantAngle} from '../shared';

const getAxisIntersectSide = ({sizesImage, sizesViewport: {halfWidth: sizeViewport}, cornerAngle}, quadrantAngle, isEvenQuadrant, {side: progressAngle}) => {
	const angle = progressAngle + quadrantAngle;
	
	if (angle < (DEGREES[90] - cornerAngle)) {
		return getAxisIntersectY(sizesImage, sizeViewport, angle, progressAngle);
	}
	
	const intersect = getAxisIntersectX(sizesImage, sizeViewport, DEGREES[90] - quadrantAngle - progressAngle, progressAngle);
	
	return isEvenQuadrant ? getFlipped(intersect) : intersect;
};

const getAxisIntersectBase = ({sizesImage, sizesViewport: {halfHeight: sizeViewport}, cornerAngle}, quadrantAngle, isEvenQuadrant, {base: progressAngle}) => {
	const angle = DEGREES[90] - quadrantAngle - progressAngle;
	
	if (angle < (DEGREES[90] - cornerAngle)) {
		return getAxisIntersectY(sizesImage, sizeViewport, angle, progressAngle);
	}
	
	const intersect = getAxisIntersectX(sizesImage, sizeViewport, quadrantAngle + progressAngle, progressAngle);
	
	return isEvenQuadrant ? intersect : getFlipped(intersect);
};

const getImageAxis = (second, originZoom) => {
	const first = {x: 0, y: 0, z: originZoom};
	
	if (second.y === 0) {
		first.end = {x: second.x / getProgress(originZoom, second.z), y: 0, axis: 'x'};
		second.p = first.end.x / second.x;
	} else {
		first.end = {y: second.y / getProgress(originZoom, second.z), x: 0, axis: 'y'};
		second.p = first.end.y / second.y;
	}
	
	return [first, second];
};

export default (demo, allStartZooms = getAllStartZooms(demo.rotation, demo.sizesViewport, demo.sizesImage)) => {
	const startZooms = [
		Math.min(allStartZooms[0].x, allStartZooms[1].x),
		Math.min(allStartZooms[0].y, allStartZooms[1].y),
	];
	
	const isEvenQuadrant = Math.floor(demo.rotation / DEGREES[90]) % 2 !== 0;
	const quadrantAngle = getQuadrantAngle(demo.rotation, isEvenQuadrant);
	const progressAngles = getProgressAngles(quadrantAngle, demo.ratioViewport, demo.ratioViewportInverse);
	
	const [firstSide, secondSide] = getImageAxis(getAxisIntersectSide(demo, quadrantAngle, isEvenQuadrant, progressAngles), startZooms[0]);
	const [firstBase, secondBase] = getImageAxis(getAxisIntersectBase(demo, quadrantAngle, isEvenQuadrant, progressAngles), startZooms[1]);
	
	return isEvenQuadrant ?
			[firstSide, secondSide, firstBase, secondBase] :
			[firstBase, secondBase, firstSide, secondSide];
};
