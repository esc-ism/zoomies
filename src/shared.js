export const DEGREES = {
	45: Math.PI / 4,
	90: Math.PI / 2,
	180: Math.PI,
	270: Math.PI / 2 * 3,
	360: Math.PI * 2,
};

export const getTheta = (fromX, fromY, toX, toY) => Math.atan2(toY - fromY, toX - fromX);

export const ERROR_ALLOWANCE = 0.001;
