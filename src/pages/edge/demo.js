import demo from '@/demo';
import Bounds from '@/demo/bounds';
import Rails from '@/demo/lines/rails';
import Tangents from '@/demo/lines/tangents';

import {CORNERS} from '../consts';
import {getBound} from '../rotation/shared';
import {DEGREES} from '@/shared';

export default class {
	bounds = new Bounds();
	
	rails = new Rails(2, true, true, true);
	tangents = new Tangents(2, true, true, true);
	
	setRailsProgress() {
		if (!this.bound) {
			this.rails.setProgress(0, 0);
		} else if (this.bound.isFirst) {
			this.rails.setProgress(this.bound[this.lowAxis] / this.zoomPoints[1][this.lowAxis], 0);
		} else {
			this.rails.setProgress(1, 1 - this.zoomPoints[1].z / demo.zoom);
		}
	}
	
	setTangents(topRight) {
		const tangents = [];
		
		if (this.bound) {
			if (this.bound.x > 0) {
				tangents.push([topRight, {rotation: DEGREES[90]}]);
			}
			
			if (this.bound.y > 0) {
				tangents.push([topRight, {rotation: 0}]);
			}
		}
		
		this.tangents.set(...tangents);
	}
	
	setZoomPoints() {
		if (demo.ratio < 1) {
			this.zoomPoints = [
				{x: 0, y: 0, z: 1, end: {x: 0.5, y: 0}},
				{x: 0.5 - 0.5 / demo.ratioInverse, y: 0, z: demo.ratioInverse},
			];
			
			this.lowAxis = 'x';
		} else {
			this.zoomPoints = [
				{x: 0, y: 0, z: 1, end: {x: 0, y: 0.5}},
				{x: 0, y: 0.5 - 0.5 / demo.ratio, z: demo.ratio},
			];
			
			this.lowAxis = 'y';
		}
		
		this.rails.set(
			[{x: 0, y: 0}, this.zoomPoints[1], true],
			[this.zoomPoints[1], CORNERS.TOP_RIGHT, true],
		);
	}
	
	applyZoomPoints() {
		this.bound = getBound(demo.zoom, ...this.zoomPoints);
		
		this.setRailsProgress();
		
		if (!this.bound) {
			this.bounds.set();
			
			this.tangents.hide();
		} else {
			const topLeft = {x: -this.bound.x, y: this.bound.y};
			const topRight = {x: this.bound.x, y: this.bound.y};
			const bottomLeft = {x: -this.bound.x, y: -this.bound.y};
			const bottomRight = {x: this.bound.x, y: -this.bound.y};
			
			this.bounds.set(topLeft, topRight, bottomRight, bottomLeft);
			this.setTangents(topRight);
		}
	}
	
	constrainPosition({ratio, zoom, position}) {
		let fallthrough = ratio;
		
		if (fallthrough) {
			this.setZoomPoints();
		}
		
		if (fallthrough || zoom) {
			this.applyZoomPoints();
			
			fallthrough = true;
		}
		
		if (!fallthrough && !position) {
			return;
		}
		
		if (!this.bound) {
			demo.position.x = demo.position.y = 0;
			
			return;
		}
		
		demo.position.x = Math.max(-this.bound.x, Math.min(this.bound.x, demo.position.x));
		demo.position.y = Math.max(-this.bound.y, Math.min(this.bound.y, demo.position.y));
	}
	
	getConstrainedZoom({x, y} = demo.position) {
		return Math.max(
			demo.sizesViewport.width / demo.sizesImage.width / 2 / (0.5 - Math.abs(x)),
			demo.sizesViewport.height / demo.sizesImage.height / 2 / (0.5 - Math.abs(y)),
		);
	}
	
	constrainZoom() {
		demo.zoom = this.getConstrainedZoom();
		
		this.setZoomPoints();
		this.applyZoomPoints();
	}
	
	remove() {
		this.bounds.remove();
		this.rails.remove();
		this.tangents.remove();
	}
}
