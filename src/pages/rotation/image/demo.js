import demo from '@/demo';

import {CORNERS} from '../../consts';

import Demo from '../2line/demo';
import {getLine, getFlipped, getM, isAbove as _isAbove} from '../shared';
import {getPairings, getZoom} from '../shared/snapZoom';

import getZoomPoints from './zoomPoints';

const getQuadrant = (second0, second1, position) => {
	const isAbove = (second, corner) => _isAbove(getLine(getM(second, corner), corner), position);
	
	if (position.x > 0) {
		if (position.y > 0) {
			return [!isAbove(second1, CORNERS.TOP_RIGHT), false];
		}
		
		return [true, !isAbove(getFlipped(second0), CORNERS.BOTTOM_RIGHT)];
	}
	
	if (position.y > 0) {
		return [false, !isAbove(second0, CORNERS.TOP_LEFT)];
	}
	
	return [!isAbove(getFlipped(second1), CORNERS.BOTTOM_LEFT), true];
};

export const getSnappedZoom = (first0, second0, first1, second1, position) => {
	const [flip0, flip1] = getQuadrant(second0, second1, position);
	
	return getZoom(position, flip0 !== flip1, ...getPairings(first0, second0, flip0, first1, second1, flip1));
};

export default class extends Demo {
	getZoomPoints() {
		return getZoomPoints(demo, this.getAllStartZooms());
	}
	
	getSnappedZoom() {
		return getSnappedZoom(...this.zoomPoints, demo.position);
	}
}
