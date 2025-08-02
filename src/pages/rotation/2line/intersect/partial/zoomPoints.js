import {getSecond} from '../../axisViewport/zoomPoints';
import getZoomPoints from '../../zoomPoints';
import {replaceVpEnd} from '../zoomPoints';

export default getZoomPoints.bind(null, (data) => {
	const [secondSide, secondBase] = getSecond(data);
	
	if (
		(secondSide.y < 0 && secondBase.y < 0)
		|| (Math.sign(secondSide.x) !== Math.sign(data.cornerSide.x) && Math.sign(secondBase.x) !== Math.sign(data.cornerBase.x))
	) {
		return replaceVpEnd(data);
	}
	
	return [secondSide, secondBase];
});
