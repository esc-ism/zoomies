import Demo from '@/demo';
import Bounds from '@/demo/bounds';
import Rails from '@/demo/lines/rails';
import Tangents from '@/demo/lines/tangents';

import {CORNERS} from '../consts';
import {getBound} from '../rotation/2line/demo';

export default class extends Demo {
	bounds = new Bounds(this);
	
	rails = new Rails(2, this, true, true, true);
	tangents = new Tangents(2, this, true, true, true);
	
	setRailsProgress() {
		if (!this.bound) {
			this.rails.setProgress(0, 0);
		} else if ('c' in this.bound) {
			this.rails.setProgress(this.bound[this.lowAxis] / this.zoomPoints[1][this.lowAxis], 0);
		} else {
			this.rails.setProgress(1, 1 - this.zoomPoints[1].z / this.zoom);
		}
	}
	
	getXTangents(topLeft, topRight) {
		if (!this.bound || this.bound.x <= 0) {
			return [];
		}
		
		return [
			[
				topRight, {
					value: {c: this.bound.y, m: Infinity, ...topRight},
					isHigh: true,
					isSide: false,
				}, 'value',
			],
		];
	}
	
	getYTangents(topLeft, topRight) {
		if (!this.bound || this.bound.y <= 0) {
			return [];
		}
		
		return [
			[
				topRight, {
					value: {c: this.bound.y, m: 0, ...topRight},
					isHigh: true,
					isSide: true,
				}, 'value',
			],
		];
	}
	
	setTangents(...args) {
		this.tangents.set(...this.getXTangents(...args), ...this.getYTangents(...args));
	}
	
	setZoomPoints() {
		if (this.ratio < 1) {
			this.zoomPoints = [
				{x: 0, y: 0, z: 1},
				{x: 0.5 - 0.5 / this.ratioInverse, y: 0, z: this.ratioInverse, vpEnd: {x: 0.5, y: 0}},
			];
			
			this.lowAxis = 'x';
		} else {
			this.zoomPoints = [
				{x: 0, y: 0, z: 1},
				{x: 0, y: 0.5 - 0.5 / this.ratio, z: this.ratio, vpEnd: {x: 0, y: 0.5}},
			];
			
			this.lowAxis = 'y';
		}
		
		this.rails.set(
			[{x: 0, y: 0}, this.zoomPoints[1], true],
			[this.zoomPoints[1], CORNERS.TOP_RIGHT, true],
		);
	}
	
	applyZoomPoints() {
		this.bound = getBound(this.zoom, ...this.zoomPoints);
		
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
			this.setTangents(topLeft, topRight, bottomLeft, bottomRight);
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
			this.position.x = this.position.y = 0;
			
			return;
		}
		
		this.position.x = Math.max(-this.bound.x, Math.min(this.bound.x, this.position.x));
		this.position.y = Math.max(-this.bound.y, Math.min(this.bound.y, this.position.y));
	}
	
	getConstrainedZoom({x, y} = this.position) {
		return Math.max(
			this.sizesViewport.width / this.sizesImage.width / 2 / (0.5 - Math.abs(x)),
			this.sizesViewport.height / this.sizesImage.height / 2 / (0.5 - Math.abs(y)),
		);
	}
	
	constrainZoom() {
		this.zoom = this.getConstrainedZoom();
		
		this.setZoomPoints();
		this.applyZoomPoints();
	}
}
