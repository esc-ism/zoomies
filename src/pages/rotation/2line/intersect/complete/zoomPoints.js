import getZoomPoints from '../../zoomPoints';
import {replaceVpEnd} from '../zoomPoints';

export default getZoomPoints.bind(null, (data) => replaceVpEnd(data));
