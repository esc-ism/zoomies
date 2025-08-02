import {getIntersectProgress, getLineX, getM, getProgress, getProgressed, getProgressedLine, isAbove} from '../../shared';

const get = ({yIntersectSide, yIntersectBase, cornerSide, cornerBase, startZooms, isEvenQuadrant}) => {
	const [startZ, lineA, lineB] = yIntersectSide.z >= yIntersectBase.z ?
			[yIntersectSide.z, [yIntersectSide, cornerSide], getProgressedLine([yIntersectBase, cornerBase], yIntersectSide)] :
			[yIntersectBase.z, getProgressedLine([yIntersectSide, cornerSide], yIntersectBase), [yIntersectBase, cornerBase]];
	
	console.log([
		getIntersectProgress({x: 0, y: 0}, lineA, lineB, isEvenQuadrant),
		getIntersectProgress({x: 0, y: 0}, lineA, lineB, !isEvenQuadrant),
	]);
	
	const r = getIntersectProgress({x: 0, y: 0}, lineA, lineB, !isEvenQuadrant);
	const z = startZ / (1 - r);
	
	const getVpEnd = ([start, end], startZoom) => {
		const vpInt = getProgressed(start, end, r);
		const p = getProgress(startZoom, z);
		
		const vpEnd = {
			x: vpInt.x / p,
			y: vpInt.y / p,
		};
		
		return {...vpInt, vpEnd, p: vpEnd.y / start.y, z};
	};
	
	return [
		getVpEnd(lineA, startZooms[0]),
		getVpEnd(lineB, startZooms[1]),
	];
};

export const modAll = (data) => get(data);
