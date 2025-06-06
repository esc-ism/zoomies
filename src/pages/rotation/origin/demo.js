import Demo from '../demo';

import {getTheta} from '@/shared';

import {getRotatedCorners, getConstrainerFromPoints, isAbove, getProgressedLine, getIntersectProgress} from '../shared';

const getBound = (zoom, point, isTopLeft) => {
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

export default class extends Demo {
	getPositionConstrainer() {
		return getConstrainerFromPoints(
			this.imageDimensions,
			getBound(this.zoom, this.zoomPoints[0], true),
			getBound(this.zoom, this.zoomPoints[1], false),
		);
	}
	
	getZoomPoints() {
		const {width, height} = this.imageDimensions;
		
		return getRotatedCorners(
			this.rotation,
			Math.sqrt(width * width / 4 + height * height / 4),
			getTheta(0, 0, width, height),
		).map(({x, y}) => ({x: 0, y: 0, z: 0.5 / Math.max(x / this.viewportDimensions.width, y / this.viewportDimensions.height)}));
	}
	
	getSnappedZoom() {
		return getSnappedZoom(...this.zoomPoints, this.position);
	}
}
