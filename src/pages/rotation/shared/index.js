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
	
	// todo === 0 condition seems unnecessary
	if (zoom <= first.z || (second.x === 0 && second.y === 0)) {
		return false;
	}
	
	return {
		...getZoomProgressed(first, second.vpEnd, zoom),
		axis: first.axis,
		isFirst: true,
	};
};
