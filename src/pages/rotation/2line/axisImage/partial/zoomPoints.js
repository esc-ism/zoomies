import {getSecond, isPartialTarget} from '../../axisViewport/zoomPoints';
import getZoomPoints from '../../zoomPoints';
import {modAll} from '../zoomPoints';

export default getZoomPoints.bind(null, (data) => {
	const [secondSide, secondBase] = getSecond(data);
	
	if (isPartialTarget(secondSide, secondBase, data)) {
		return modAll(data);
	}
	
	return [secondSide, secondBase];
});
