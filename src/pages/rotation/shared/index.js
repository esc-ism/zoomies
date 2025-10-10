import {DEGREES} from '@/shared';

// logarithmic progress from "low" to infinity
export const getProgress = (low, target) => 1 - low / target;
export const getProgressed = (from, to, p) => ({x: p * (to.x - from.x) + from.x, y: p * (to.y - from.y) + from.y, p});
export const getZoomProgressed = ({z: lowZ, ...from}, to, targetZ) => getProgressed(from, to, getProgress(lowZ, targetZ));

export const getDistance = (from, to) => Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));

const perfectSlopes = [0, Infinity, -Infinity];

export const getLineY = ({m, c, y}, x) => perfectSlopes.includes(m) ? y : m * x + c; // y = mx + c
export const getLineX = ({m, c, x}, y) => perfectSlopes.includes(m) ? x : (y - c) / m; // x = (y - c) / m
export const getLineC = ({m, x, y}) => perfectSlopes.includes(m) ? y : y - m * x; // c = y - mx

export const isAbove = (line, {x, y}) => y > getLineY(line, x);
export const isRight = (line, {x, y}) => x > getLineX(line, y);

export const getM = (from, to) => (to.y - from.y) / (to.x - from.x);
export const getLine = (m, {x, y}) => ({c: getLineC({m, x, y}), m, x, y});
export const getFlipped = ({x, y, ...data}) => ({...data, x: -x, y: -y});

export const getIntersectProgress = ({x, y}, [{x: d, y: e}, {x: f, y: g}], [{x: h, y: i}, {x: j, y: k}], doFlip) => {
	const a = g * j + e * h + k * d + i * f - g * h - j * e - k * f - i * d;
	const b = g * h + e * x + j * e + k * x + i * d * 2 + f * y + h * y - g * x - e * h * 2 - j * y - k * d - i * x - f * i - d * y;
	const c = h * e + i * x + d * y - e * x - h * y - d * i;
	
	return (doFlip ? -b - Math.sqrt(b * b - 4 * a * c) : -b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
};

export const getZoomPairSecond = ([z, ...pair], position, doFlip, maxP = 1) => {
	if (maxP >= 0) {
		const p = getIntersectProgress(position, ...pair, doFlip);
		
		if (p >= 0 && p <= maxP) {
			// I don't think the >= 1 check is necessary but best be safe
			return p >= 1 ? Number.MAX_SAFE_INTEGER : z / (1 - p);
		}
	}
	
	return null;
};

// line with progressed start point
export const getProgressedLine = (line, {z}) => [getZoomProgressed(...line, z), line[1]];

export const getBound = (zoom, first, second, isTopLeft) => {
	if (zoom > second.z) {
		const progress = zoom / second.z;
		
		return {
			x: isTopLeft ? -0.5 - (-0.5 - second.x) / progress : 0.5 - (0.5 - second.x) / progress,
			y: 0.5 - (0.5 - second.y) / progress,
		};
	}
	
	if (zoom <= first.z || (second.x === 0 && second.y === 0)) {
		return false;
	}
	
	return {
		...getZoomProgressed(first, first.end, zoom),
		axis: first.end.axis,
		isFirst: true,
	};
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

export const getPoints = ({rotation, sizesImage, sizesViewport}, startZooms, quadrantAngle) => {
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
