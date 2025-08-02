import getZoomPoints from '../../zoomPoints';
import {modAll} from '../zoomPoints';

export default getZoomPoints.bind(null, (data) => modAll(data));
