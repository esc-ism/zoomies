import getZoomPoints from '../../zoomPoints';
import getSecond from '../zoomPoints';

export default getZoomPoints.bind(null, (data) => getSecond(data, true));
