import {getAllStartZooms} from '../demo';

import {DEGREES} from '@/shared';

// the angle from 0,0 to the center of the image edge angled towards the viewport's upper-right corner
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

export default (getSecond, demo, allStartZooms) => {
	allStartZooms ??= getAllStartZooms(demo.rotation, demo.sizesViewport, demo.sizesImage);
	const startZooms = [
		Math.min(allStartZooms[0].x, allStartZooms[1].x),
		Math.min(allStartZooms[0].y, allStartZooms[1].y),
	];
	
	const isEvenQuadrant = Math.floor(demo.rotation / DEGREES[90]) % 2 !== 0;
	const quadrantAngle = getQuadrantAngle(demo.rotation, isEvenQuadrant);
	
	const progressAngles = getProgressAngles(quadrantAngle, demo.ratioViewport, demo.ratioViewportInverse);
	
	const [firstSide, firstBase] = startZooms.map((z) => ({x: 0, y: 0, z}));
	
	const cornerSide = {x: isEvenQuadrant ? -0.5 : 0.5, y: 0.5};
	const cornerBase = {x: isEvenQuadrant ? 0.5 : -0.5, y: 0.5};
	
	const [secondSide, secondBase] = getSecond({
		...demo, cornerSide, cornerBase, startZooms, quadrantAngle, isEvenQuadrant,
		yIntersectSide: getYIntersect(demo.sizesImage, demo.sizesViewport.halfWidth, quadrantAngle + progressAngles.side, progressAngles.side),
		yIntersectBase: getYIntersect(demo.sizesImage, demo.sizesViewport.halfHeight, DEGREES[90] - quadrantAngle - progressAngles.base, progressAngles.base),
	});
	
	return isEvenQuadrant ?
			[...[firstSide, secondSide], ...[firstBase, secondBase]] :
			[...[firstBase, secondBase], ...[firstSide, secondSide]];
};
