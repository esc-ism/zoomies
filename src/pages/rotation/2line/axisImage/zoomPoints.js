import {getLineX, getM, getProgress} from '../../shared';

const mod = (second, corner, originZoom) => {
	if (second.y < 0) {
		second.x = getLineX({m: getM(second, corner), c: second.y, x: 0}, 0);
		second.y = 0;
		second.z = second.z / (1 - second.x / corner.x);
		
		second.vpEnd = {y: 0, x: second.x / getProgress(originZoom, second.z), axis: 'x'};
		second.p = second.vpEnd.x / second.x;
	} else {
		second.vpEnd = {y: second.y / getProgress(originZoom, second.z), x: 0, axis: 'y'};
		second.p = second.vpEnd.y / second.y;
	}
	
	return second;
};

export const modAll = (data) => [
	mod({...data.yIntersectSide}, data.cornerSide, data.startZooms[0]),
	mod({...data.yIntersectBase}, data.cornerBase, data.startZooms[1]),
];
