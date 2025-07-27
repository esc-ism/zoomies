import {getSecond, isPartialTarget} from '../../axisViewport/zoomPoints';
import getZoomPoints from '../../zoomPoints';
import {replaceVpEnd} from '../zoomPoints';

export default getZoomPoints.bind(null, (data) => {
	const [secondSide, secondBase] = getSecond(data);
	
	if (isPartialTarget(secondSide, secondBase, data)) {
		return replaceVpEnd(secondSide, secondBase, data);
	}
	
	return [secondSide, secondBase];
});
