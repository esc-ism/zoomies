import Rails from '@/demo/lines/rails';
import Demo from '../demo';

import {getBound, getProgressedLine, getProgress} from '../shared';
import getConstrainerFromPoints from '../shared/constrain';

import {CORNERS} from '@/pages/consts';
import getZoomPoints from './zoomPoints';
import {getDirected, getFirstPairing, getSecondPairings, getZoom, isValidZoom} from '../shared/snapZoom';

export const getSnappedZoom = (first0, second0, first1, second1, position) => {
	const getPairings = (flip0, flip1) => {
		const [lineFirst0, lineSecond0] = getDirected(first0, second0, flip0, -0.5);
		const [lineFirst1, lineSecond1] = getDirected(first1, second1, flip1, 0.5);
		
		const pairings = getSecondPairings(second0, second1, lineFirst0, lineFirst1, lineSecond0, lineSecond1);
		
		if (first0.end.axis !== first1.end.axis) {
			pairings.unshift(getFirstPairing(first0, first1, lineFirst0, lineFirst1));
		}
		
		return pairings;
	};
	
	return Math.max(...[
		getZoom(position, false, ...getPairings(false, false)),
		getZoom(position, true, ...getPairings(false, true)),
		getZoom(position, true, ...getPairings(true, false)),
		getZoom(position, false, ...getPairings(true, true)),
	].filter(isValidZoom));
};

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
	rails = new Rails(4, this, false, false, true);
	
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
			...getRailProgress(this.zoom, this.zoomPoints[0], this.zoomPoints[1]),
			...getRailProgress(this.zoom, this.zoomPoints[2], this.zoomPoints[3]),
		);
	}
	
	getPositionConstrainer() {
		return getConstrainerFromPoints(
			this.bound0 = getBound(this.zoom, this.zoomPoints[0], this.zoomPoints[1], true),
			this.bound1 = getBound(this.zoom, this.zoomPoints[2], this.zoomPoints[3], false),
			this.ratioImage,
		);
	}
	
	getZoomPoints() {
		return getZoomPoints(this, this.getAllStartZooms());
	}
	
	getSnappedZoom() {
		return getSnappedZoom(...this.zoomPoints, this.position);
	}
}
