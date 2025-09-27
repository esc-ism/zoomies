import {DEGREES} from '@/shared';
import {getFlipped, getLine, getLineX, getLineY, getM, isAbove, isRight} from '.';

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
	const getTangents = (m, point, ratioImage) => {
		const isSide = Math.abs(m) < 1;
		const line = getLine(m, point);
		const rotation = Math.atan(m / ratioImage);
		
		return [
			[point, {line, rotation: rotation - Math.PI, isSide, isHigh: false}, 'line'],
			[point, {line, rotation, isSide, isHigh: true}, 'line'],
		];
	};
	
	const getBasicConstrainer = (main, sub, point) => {
		const limit = Math.abs(point[main]);
		
		return ({[main]: value}) => ({[main]: Math.max(-limit, Math.min(limit, value)), [sub]: 0});
	};
	
	return (point, ratioImage) => {
		const flipped = getFlipped(point);
		const line = {
			...(point.x < 0 ? flipped : point),
			m: point.y / point.x,
			c: 0,
		};
		
		const tangentM = -Math.pow(ratioImage, 2) / line.m;
		
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
			[point, flipped], getTangents(tangentM, point, ratioImage),
		];
	};
})();

const getFrame = (() => {
	const isHighSide = (lines, high, low) => Number.isFinite(lines[high].m) ?
			(lines[high].c < lines[low].c) === (lines[high].m > 0) :
			(lines[high].y < lines[low].y);
	const isHighTop = (lines, high, low) => Number.isFinite(lines[high].m) ?
			(lines[high].c > lines[low].c) :
			(lines[high].x > lines[low].x);
	
	const setHighTangent = (rotation, source, a, b, ...copies) => {
		const isHigh = source.isSide ? isHighTop : isHighSide;
		const [low, high] = isHigh(source, a, b) ? [b, a] : [a, b];
		
		const rotationIsHigh = source.isSide ? (Math.abs(rotation) < DEGREES[90]) : (rotation > 0);
		
		for (const tangent of [source, ...copies]) {
			tangent.low = tangent[low];
			tangent.high = tangent[high];
			
			tangent[low].isHigh = false;
			tangent[high].isHigh = true;
			
			tangent.rotation = (rotationIsHigh !== tangent.isHigh) ? (rotation - Math.PI) : rotation;
		}
	};
	
	const swap = (array, i0, i1) => {
		const temp = array[i0];
		
		array[i0] = array[i1];
		array[i1] = temp;
	};
	
	return (point0, point1, ratioImage) => {
		const flipped0 = getFlipped(point0);
		const flipped1 = getFlipped(point1);
		
		const m0 = getM(point0, point1);
		const m1 = getM(flipped0, point1);
		
		const tangentM0 = -Math.pow(ratioImage, 2) / m0;
		const tangentM1 = -Math.pow(ratioImage, 2) / m1;
		
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
		
		tangents.top.isSide = tangents.bottom.isSide = Math.abs(m0) > 1;
		tangents.top.isHigh = (tangents.top.isSide ? isHighSide : isHighTop)(lines, 'top', 'bottom');
		tangents.bottom.isHigh = !tangents.top.isHigh;
		
		tangents.right.isSide = tangents.left.isSide = Math.abs(m1) > 1;
		tangents.right.isHigh = (tangents.right.isSide ? isHighSide : isHighTop)(lines, 'right', 'left');
		tangents.left.isHigh = !tangents.right.isHigh;
		
		setHighTangent(Math.atan(tangentM0 / ratioImage), tangents.top, 'left', 'right', tangents.bottom);
		setHighTangent(Math.atan(tangentM1 / ratioImage), tangents.right, 'bottom', 'top', tangents.left);
		
		// checking for flips in complete viewport-axis
		// maybe doesn't work in crazy edge cases?
		// something like `(...) || (tangents.bottom.isSide && (tangents.bottom.isHigh === isEvenQuadrant))` will be bulletproof
		if (tangents.bottom.isHigh && !tangents.bottom.isSide) {
			swap(points, 'topLeft', 'bottomLeft');
			swap(points, 'topRight', 'bottomRight');
			
			swap(lines, 'top', 'bottom');
			
			swap(tangents, 'top', 'bottom');
			swap(tangents.left, 'top', 'bottom');
			swap(tangents.right, 'top', 'bottom');
		}
		
		if (tangents.left.isHigh && tangents.left.isSide) {
			swap(points, 'bottomLeft', 'bottomRight');
			swap(points, 'topLeft', 'topRight');
			
			swap(lines, 'right', 'left');
			
			swap(tangents, 'right', 'left');
			swap(tangents.top, 'right', 'left');
			swap(tangents.bottom, 'right', 'left');
		}
		
		return [points, lines, tangents];
	};
})();

export default (point0, point1, ratioImage) => {
	if (!point0 && !point1) {
		return [() => ({x: 0, y: 0}), [], []];
	}
	
	if (!point0 || !point1) {
		return get1DConstrainer(point0 || point1, ratioImage);
	}
	
	if (point0.isFirst && point1.isFirst && point0.axis === point1.axis) {
		return get1DConstrainer(point0.p > point1.p ? point0 : point1, ratioImage);
	}
	
	const [points, lines, tangents] = getFrame(point0, point1, ratioImage);
	
	return [
		get2DConstrained.bind(null, points, lines, tangents), Object.values(points), [
			[points.topLeft, tangents.top, 'left'],
			[points.topRight, tangents.top, 'right'],
			[points.topLeft, tangents.left, 'top'],
			[points.topRight, tangents.right, 'top'],
		],
	];
};
