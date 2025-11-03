import demo from '@/demo';
import Rails from '@/demo/lines/rails';
import Demo from '../demo';

import {getBound, getProgress} from '../shared';
import getConstrainerFromPoints from '../shared/constrain';

import {CORNERS} from '@/pages/consts';
import getZoomPoints from './zoomPoints';
import {getZoom, isValidZoom, getPairings} from '../shared/snapZoom';

export const getSnappedZoom = (first0, second0, first1, second1, position) => Math.max(...[
	getZoom(position, false, ...getPairings(first0, second0, false, first1, second1, false)),
	getZoom(position, true, ...getPairings(first0, second0, false, first1, second1, true)),
	getZoom(position, true, ...getPairings(first0, second0, true, first1, second1, false)),
	getZoom(position, false, ...getPairings(first0, second0, true, first1, second1, true)),
].filter(isValidZoom));

export const getRailProgress = (zoom, first, second) => {
	if (zoom <= first.z) {
		return [0, 0];
	}
	
	if (zoom <= second.z) {
		return [getProgress(first.z, zoom) * second.p, 0];
	}
	
	return [1, getProgress(second.z, zoom)];
};

export default class extends Demo {
	rails = new Rails(4, false, false, true);
	
	setRails() {
		this.rails.set(
			[{x: 0, y: 0}, this.zoomPoints[1]],
			[this.zoomPoints[1], CORNERS.TOP_LEFT],
			[{x: 0, y: 0}, this.zoomPoints[3]],
			[this.zoomPoints[3], CORNERS.TOP_RIGHT],
		);
	}
	
	setRailsProgress() {
		this.rails.setProgress(
			...getRailProgress(demo.zoom, this.zoomPoints[0], this.zoomPoints[1]),
			...getRailProgress(demo.zoom, this.zoomPoints[2], this.zoomPoints[3]),
		);
	}
	
	getPositionConstrainer() {
		return getConstrainerFromPoints(
			this.bound0 = getBound(demo.zoom, this.zoomPoints[0], this.zoomPoints[1], true),
			this.bound1 = getBound(demo.zoom, this.zoomPoints[2], this.zoomPoints[3], false),
			demo.ratioImage,
		);
	}
	
	getZoomPoints() {
		return getZoomPoints(demo, this.getAllStartZooms());
	}
	
	getSnappedZoom() {
		return getSnappedZoom(...this.zoomPoints, demo.position);
	}
}
