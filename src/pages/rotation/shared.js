import {DEGREES} from '@/shared';

export const getRotatedCorners = (rotation, radius, theta) => {
	const offset = theta - DEGREES[90];
	
	const angle0 = rotation - offset;
	const angle1 = rotation + offset;
	
	return [
		{
			x: Math.abs(radius * Math.cos(angle0)),
			y: Math.abs(radius * Math.sin(angle0)),
		},
		{
			x: Math.abs(radius * Math.cos(angle1)),
			y: Math.abs(radius * Math.sin(angle1)),
		},
	];
};

// logarithmic progress from "low" to infinity
export const getProgress = (low, target) => 1 - low / target;

export const getProgressed = ({x: fromX, y: fromY, z: lowZ}, {x: toX, y: toY}, targetZ) => {
	const p = getProgress(lowZ, targetZ);
	
	return {x: p * (toX - fromX) + fromX, y: p * (toY - fromY) + fromY, p};
};

// y = mx + c
export const getLineY = ({m, c}, x) => m * x + c;

// x = (y - c) / m
export const getLineX = ({m, c, x}, y) => !Number.isFinite(m) || m === 0 ? x : (y - c) / m;

export const getM = (from, to) => (to.y - from.y) / (to.x - from.x);
export const getLine = (m, {x, y}) => ({c: (y - m * x), m, x, y});
export const getFlipped = ({x, y}) => ({x: -x, y: -y});

export const isAbove = ({m, c}, {x, y}) => m * x + c < y;

// requires special case for infinite gradient
const isRight = (line, {x, y}) => {
	const lineX = (y - line.c) / line.m;
	
	return x > (isNaN(lineX) ? line.x : lineX);
};

const get2DConstrained = (() => {
	const isBetween = (() => {
		const isBetweenBase = ({low, high}, position) => {
			return isRight(low, position) && !isRight(high, position);
		};
		
		const isBetweenSide = ({low, high}, position) => {
			return isAbove(low, position) && !isAbove(high, position);
		};
		
		return (line, tangent, position) => {
			if (tangent.isSide) {
				return isBetweenSide(tangent, position) && (tangent.isHigh ? isRight(line, position) : !isRight(line, position));
			}
			
			return isBetweenBase(tangent, position) && (tangent.isHigh ? isAbove(line, position) : !isAbove(line, position));
		};
	})();
	
	const getTangentIntersect = (() => {
		const getX = (line, m, diff, position) => {
			if (line.m === 0) {
				return {x: position.x, y: line.y};
			}
			
			const tangent = getLine(m, position);
			const x = (tangent.c - line.c) / diff;
			
			return {x, y: getLineY(line, x)};
		};
		
		const getY = (line, m, diff, position) => {
			if (m === 0) {
				return {x: line.x, y: position.y};
			}
			
			const tangent = getLine(m, position);
			const y = (m * line.c - line.m * tangent.c) / -diff;
			
			return {y, x: getLineX(line, y)};
		};
		
		return (line, {isSide}, m, diff, position) => isSide ? getY(line, m, diff, position) : getX(line, m, diff, position);
	})();
	
	const isOutside = (tangent, property, position) => {
		if (tangent.isSide) {
			return tangent[property].isHigh ? isAbove(tangent.high, position) : !isAbove(tangent.low, position);
		}
		
		return tangent[property].isHigh ? isRight(tangent.high, position) : !isRight(tangent.low, position);
	};
	
	return (points, lines, tangents, position) => {
		if (isBetween(lines.top, tangents.top, position)) {
			return getTangentIntersect(lines.top, tangents.top, tangents.base, tangents.baseDiff, position);
		}
		
		if (isBetween(lines.bottom, tangents.bottom, position)) {
			return getTangentIntersect(lines.bottom, tangents.bottom, tangents.base, tangents.baseDiff, position);
		}
		
		if (isBetween(lines.right, tangents.right, position)) {
			return getTangentIntersect(lines.right, tangents.right, tangents.side, tangents.sideDiff, position);
		}
		
		if (isBetween(lines.left, tangents.left, position)) {
			return getTangentIntersect(lines.left, tangents.left, tangents.side, tangents.sideDiff, position);
		}
		
		if (isOutside(tangents.top, 'right', position) && isOutside(tangents.right, 'top', position)) {
			return {...points.topRight};
		}
		
		if (isOutside(tangents.bottom, 'right', position) && isOutside(tangents.right, 'bottom', position)) {
			return {...points.bottomRight};
		}
		
		if (isOutside(tangents.top, 'left', position) && isOutside(tangents.left, 'top', position)) {
			return {...points.topLeft};
		}
		
		if (isOutside(tangents.bottom, 'left', position) && isOutside(tangents.left, 'bottom', position)) {
			return {...points.bottomLeft};
		}
		
		return position;
	};
})();

const get1DConstrainer = (() => {
	const getTangents = (m, point, flipped) => {
		const isSide = Math.abs(m) < 1;
		
		const linePoint = getLine(m, point);
		const lineFlipped = getLine(m, flipped);
		
		return [
			[point, {line: linePoint, isSide, isHigh: false}, 'line'],
			[point, {line: linePoint, isSide, isHigh: true}, 'line'],
			[flipped, {line: lineFlipped, isSide, isHigh: false}, 'line'],
			[flipped, {line: lineFlipped, isSide, isHigh: true}, 'line'],
		];
	};
	
	const getBasicConstrainer = (main, sub, point) => {
		const limit = Math.abs(point[main]);
		
		return ({[main]: value}) => ({[main]: Math.max(-limit, Math.min(limit, value)), [sub]: 0});
	};
	
	return (point) => {
		const flipped = getFlipped(point);
		const line = {
			...(point.x < 0 ? flipped : point),
			m: point.y / point.x,
			c: 0,
		};
		
		const tangentM = -1 / line.m;
		
		return [
			(() => {
				if (line.m === 0) {
					return getBasicConstrainer('x', 'y', point);
				}
				
				if (!isFinite(line.m)) {
					return getBasicConstrainer('y', 'x', point);
				}
				
				const mDiff = line.m - tangentM;
				
				return (position) => {
					const x = Math.max(-line.x, Math.min(line.x, line.m === 0 ? position.x : (getLine(tangentM, position).c / mDiff)));
					
					return {x, y: getLineY(line, x)};
				};
			})(),
			[point, flipped], getTangents(tangentM, point, flipped),
		];
	};
})();

const swap = (array, i0, i1) => {
	const temp = array[i0];
	
	array[i0] = array[i1];
	array[i1] = temp;
};

export const getConstrainerFromPoints = (() => {
	const setHighTangent = (tangent, low, high) => {
		tangent.low = tangent[low];
		tangent.high = tangent[high];
		
		tangent[low].isHigh = false;
		tangent[high].isHigh = true;
	};
	
	const getFrame = ({width, height}, point0, point1) => {
		const flipped0 = getFlipped(point0);
		const flipped1 = getFlipped(point1);
		
		const m0 = getM(point0, point1);
		const m1 = getM(flipped0, point1);
		
		const tangentM0 = -1 / m0;
		const tangentM1 = -1 / m1;
		
		const lines = {
			top: getLine(m0, point0),
			bottom: getLine(m0, flipped0),
			
			left: getLine(m1, point0),
			right: getLine(m1, flipped0),
		};
		
		const points = {
			topLeft: point0,
			topRight: point1,
			bottomRight: flipped0,
			bottomLeft: flipped1,
		};
		
		const tangents = {
			top: {
				right: getLine(tangentM0, points.topRight),
				left: getLine(tangentM0, points.topLeft),
			},
			right: {
				top: getLine(tangentM1, points.topRight),
				bottom: getLine(tangentM1, points.bottomRight),
			},
			bottom: {
				right: getLine(tangentM0, points.bottomRight),
				left: getLine(tangentM0, points.bottomLeft),
			},
			left: {
				top: getLine(tangentM1, points.topLeft),
				bottom: getLine(tangentM1, points.bottomLeft),
			},
			baseDiff: m0 - tangentM0,
			sideDiff: m1 - tangentM1,
			base: tangentM0,
			side: tangentM1,
		};
		
		if (width < height) {
			if (getLineX(lines.right, 0) < getLineX(lines.left, 0)) {
				swap(lines, 'right', 'left');
				
				swap(points, 'bottomLeft', 'bottomRight');
				swap(points, 'topLeft', 'topRight');
				
				swap(tangents, 'right', 'left');
				swap(tangents.top, 'right', 'left');
				swap(tangents.bottom, 'right', 'left');
			}
		} else {
			if (lines.top.c < lines.bottom.c) {
				swap(lines, 'top', 'bottom');
				
				swap(points, 'topLeft', 'bottomLeft');
				swap(points, 'topRight', 'bottomRight');
				
				swap(tangents, 'top', 'bottom');
				swap(tangents.left, 'top', 'bottom');
				swap(tangents.right, 'top', 'bottom');
			}
		}
		
		tangents.top.isSide = tangents.bottom.isSide = Math.abs(m0) > 1;
		tangents.top.isHigh = !tangents.top.isSide || (lines.top.c < 0) === (m0 > 0);
		tangents.bottom.isHigh = !tangents.top.isHigh;
		
		if (tangents.top.isSide && tangents.top.isHigh) {
			setHighTangent(tangents.top, 'right', 'left');
			setHighTangent(tangents.bottom, 'right', 'left');
		} else {
			setHighTangent(tangents.top, 'left', 'right');
			setHighTangent(tangents.bottom, 'left', 'right');
		}
		
		tangents.right.isSide = tangents.left.isSide = Math.abs(m1) > 1;
		tangents.right.isHigh = tangents.right.isSide || lines.right.c > 0;
		tangents.left.isHigh = !tangents.right.isHigh;
		
		if (!tangents.right.isSide && tangents.right.isHigh) {
			setHighTangent(tangents.right, 'top', 'bottom');
			setHighTangent(tangents.left, 'top', 'bottom');
		} else {
			setHighTangent(tangents.right, 'bottom', 'top');
			setHighTangent(tangents.left, 'bottom', 'top');
		}
		
		return [points, lines, tangents];
	};
	
	return (image, point0, point1) => {
		if (point0 && point1) {
			const [points, lines, tangents] = getFrame(image, point0, point1);
			
			return [
				get2DConstrained.bind(null, points, lines, tangents), Object.values(points), [
					[points.topLeft, tangents.top, 'left'],
					[points.topRight, tangents.top, 'right'],
					// [points.bottomLeft, tangents.bottom, 'left'],
					// [points.bottomRight, tangents.bottom, 'right'],
					[points.topLeft, tangents.left, 'top'],
					// [points.bottomLeft, tangents.left, 'bottom'],
					[points.topRight, tangents.right, 'top'],
					// [points.bottomRight, tangents.right, 'bottom'],
				],
			];
		}
		
		if (point0 || point1) {
			return get1DConstrainer(point0 || point1);
		}
		
		return [() => ({x: 0, y: 0}), [], []];
	};
})();

// https://math.stackexchange.com/questions/2223691/intersect-2-lines-at-the-same-ratio-through-a-point
export const getIntersectProgress = ({x, y}, [{x: d, y: e}, {x: f, y: g}], [{x: h, y: i}, {x: j, y: k}], doFlip) => {
	const a = g * j + e * h + k * d + i * f - g * h - j * e - k * f - i * d;
	const b = g * h + e * x + j * e + k * x + i * d * 2 + f * y + h * y - g * x - e * h * 2 - j * y - k * d - i * x - f * i - d * y;
	const c = h * e + i * x + d * y - e * x - h * y - d * i;
	
	return (doFlip ? -b - Math.sqrt(b * b - 4 * a * c) : -b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
};

// line with progressed start point
export const getProgressedLine = (line, {z}) => [getProgressed(...line, z), line[1]];
