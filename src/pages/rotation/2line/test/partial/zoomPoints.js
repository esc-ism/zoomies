import {getSecond} from '../../axisViewport/zoomPoints';
import getZoomPoints from '../../zoomPoints';
import {mod} from '../zoomPoints';

export default getZoomPoints.bind(null, (data) => {
	const [secondSide, secondBase] = getSecond(data);
	
	if (secondSide.y < 0 && secondBase.y < 0) {
		return [
			mod({...data.yIntersectSide}, data.cornerSide, data.startZooms[0]),
			mod({...data.yIntersectBase}, data.cornerBase, data.startZooms[1]),
		];
	}
	
	return [secondSide, secondBase];
});
