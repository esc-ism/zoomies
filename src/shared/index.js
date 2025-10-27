export const DEGREES = {
	'45_2': Math.PI / 8,
	45: Math.PI / 4,
	90: Math.PI / 2,
	135: Math.PI / 4 * 3,
	180: Math.PI,
	225: Math.PI / 4 * 5,
	270: Math.PI / 2 * 3,
	315: Math.PI / 4 * 7,
	360: Math.PI * 2,
};

export const getTheta = (toX, toY, fromX = 0, fromY = 0) => Math.atan2(toY - fromY, toX - fromX);

export const ALLOWANCE_ERROR = 0.001;

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export const SUB_PIXEL_BS = 1 / window.devicePixelRatio;

export const getAngleDiff = (a, b) => {
	const diff = a - b;
	
	if (diff > DEGREES[180]) {
		return DEGREES[360] - diff;
	}
	
	if (diff < -DEGREES[180]) {
		return -DEGREES[360] - diff;
	}
	
	return diff;
};
