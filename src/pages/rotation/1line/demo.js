import demo from '@/demo';
import Rails from '@/demo/lines/rails';

import {CORNERS} from '../../consts';

import Demo, {getAllStartZooms} from '../demo';
import {isAbove, getProgressedLine, getIntersectProgress} from '../shared';
import getConstrainerFromPoints from '../shared/constrain';

export const getZoomPoints = (demo, startZooms = getAllStartZooms(demo.rotation, demo.sizesViewport, demo.sizesImage)) => startZooms.map(({x, y}) => ({x: 0, y: 0, z: Math.min(x, y)}));

export const getBound = (zoom, point, isTopLeft) => {
	if (zoom <= point.z) {
		return false;
	}
	
	const progress = zoom / point.z;
	
	return {
		x: isTopLeft ? -0.5 - -0.5 / progress : 0.5 - 0.5 / progress,
		y: 0.5 - 0.5 / progress,
	};
};

const getSnappedZoom = (_point0, point1, {x, y}) => {
	const point0 = {..._point0, x: -_point0.x};
	const absPosition = {x: Math.abs(x), y: Math.abs(y)};
	
	const getPairings = (end0, end1) => point0.z >= point1.z ?
			[point0.z, [point0, end0], getProgressedLine([point1, end1], point0)] :
			[point1.z, getProgressedLine([point0, end0], point1), [point1, end1]];
	
	const [z, lineA, lineB, doFlip = false] = (() => {
		if ((x >= 0) === (y >= 0)) {
			return isAbove({m: 1, c: 0}, absPosition) ?
					getPairings({x: -0.5, y: 0.5}, {x: 0.5, y: 0.5}) :
					[...getPairings({x: 0.5, y: -0.5}, {x: 0.5, y: 0.5}), true];
		}
		
		return isAbove({m: 1, c: 0}, absPosition) ?
				[...getPairings({x: 0.5, y: 0.5}, {x: -0.5, y: 0.5}), true] :
				getPairings({x: 0.5, y: 0.5}, {x: 0.5, y: -0.5});
	})();
	
	const p = getIntersectProgress(absPosition, lineA, lineB, doFlip);
	
	return p >= 0 ? z / (1 - p) : z;
};

const getRailProgresses = [
	() => [0, 0],
	([{x, y}]) => {
		const progress = Math.abs(y) / 0.5;
		
		return (x > 0) === (y > 0) ? [0, progress] : [progress, 0];
	},
	(bounds) => {
		const progresses = [];
		
		for (const {y} of bounds) {
			if (y > 0) {
				progresses.push(y / 0.5);
			}
		}
		
		return progresses;
	},
];

export default class extends Demo {
	rails = new Rails(2, false, false, true);
	
	setRails() {
		this.rails.set(
			[{x: 0, y: 0}, CORNERS.TOP_LEFT],
			[{x: 0, y: 0}, CORNERS.TOP_RIGHT],
		);
	}
	
	setRailsProgress(bounds) {
		this.rails.setProgress(...getRailProgresses[bounds.length / 2](bounds));
	}
	
	getPositionConstrainer() {
		return getConstrainerFromPoints(
			getBound(demo.zoom, this.zoomPoints[0], true),
			getBound(demo.zoom, this.zoomPoints[1], false),
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
