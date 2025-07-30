import {getSecond, isPartialTarget} from '../../axisViewport/zoomPoints';
import getZoomPoints from '../../zoomPoints';
import {mod} from '../zoomPoints';

export default getZoomPoints.bind(null, (data) => {
	const [secondSide, secondBase] = getSecond(data);
	
	return [
		isPartialTarget(secondSide, data.cornerSide) ? mod({...data.yIntersectSide}, data.cornerSide, data.startZooms[0]) : secondSide,
		isPartialTarget(secondBase, data.cornerBase) ? mod({...data.yIntersectBase}, data.cornerBase, data.startZooms[1]) : secondBase,
	];
});
