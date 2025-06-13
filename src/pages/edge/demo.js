import Demo, {WEIGHTS} from '@/demo';
import Rails from '@/demo/lines/rails';
import Tangents from '@/demo/lines/tangents';

import {CORNERS} from '../consts';
import {getBound} from '../rotation/axis/demo';

export default class extends Demo {
	rails = new Rails(this, true, true);
	tangents = new Tangents(this, 8);
	
	setRailsProgress() {
		if (!this.bound) {
			this.rails.setProgress(0, 0);
		} else if ('c' in this.bound) {
			this.rails.setProgress(this.bound[this.lowAxis] / this.zoomPoints[1][this.lowAxis], 0);
		} else {
			this.rails.setProgress(1, 1 - this.zoomPoints[1].z / this.zoom);
		}
	}
	
	getXTangents(topLeft, topRight, bottomLeft, bottomRight) {
		if (!this.bound || this.bound.x <= 0) {
			return [];
		}
		
		const top = {
			right: {c: this.bound.y, m: Infinity, ...topRight},
			left: {c: this.bound.y, m: Infinity, ...topLeft},
			isHigh: true,
			isSide: false,
		};
		
		const bottom = {
			right: {c: -this.bound.y, m: Infinity, ...bottomRight},
			left: {c: -this.bound.y, m: Infinity, ...bottomLeft},
			isHigh: false,
			isSide: false,
		};
		
		return [
			[topLeft, top, 'left'],
			[topRight, top, 'right'],
			[bottomLeft, bottom, 'left'],
			[bottomRight, bottom, 'right'],
		];
	}
	
	getYTangents(topLeft, topRight, bottomLeft, bottomRight) {
		if (!this.bound || this.bound.y <= 0) {
			return [];
		}
		
		const right = {
			top: {c: this.bound.y, m: 0, ...topRight},
			bottom: {c: -this.bound.y, m: 0, ...bottomRight},
			isHigh: true,
			isSide: true,
		};
		
		const left = {
			top: {c: this.bound.y, m: 0, ...topLeft},
			bottom: {c: -this.bound.y, m: 0, ...bottomLeft},
			isHigh: false,
			isSide: true,
		};
		
		return [
			[topLeft, left, 'top'],
			[bottomLeft, left, 'bottom'],
			[topRight, right, 'top'],
			[bottomRight, right, 'bottom'],
		];
	}
	
	setTangents(...args) {
		const tangents = [...this.getXTangents(...args), ...this.getYTangents(...args)];
		
		this.tangents.hide(tangents.length);
		
		for (const [i, tangent] of tangents.entries()) {
			this.tangents[i].set(...tangent);
		}
	}
	
	setZoomPoints() {
		const zoomX = this.ratioImage / this.ratioViewport;
		const zoomY = this.ratioViewport / this.ratioImage;
		
		if (zoomX > zoomY) {
			this.zoomPoints = [
				{x: 0, y: 0, z: 1},
				{x: 0.5 - 0.5 / zoomX, y: 0, z: zoomX, vpEnd: {x: 0.5, y: 0}},
			];
			
			this.lowAxis = 'x';
		} else {
			this.zoomPoints = [
				{x: 0, y: 0, z: 1},
				{x: 0, y: 0.5 - 0.5 / zoomY, z: zoomY, vpEnd: {x: 0, y: 0.5}},
			];
			
			this.lowAxis = 'y';
		}
		
		this.rails.set(
			[{x: 0, y: 0}, this.zoomPoints[1], true],
			[this.zoomPoints[1], CORNERS.TOP_RIGHT, true],
		);
	}
	
	setBounds() {
		this.bound = getBound(this.zoom, ...this.zoomPoints);
		
		this.setRailsProgress();
		
		if (!this.bound) {
			this.constructor.bounds.set();
			
			this.tangents.hide();
		} else {
			const topLeft = {x: -this.bound.x, y: this.bound.y};
			const topRight = {x: this.bound.x, y: this.bound.y};
			const bottomLeft = {x: -this.bound.x, y: -this.bound.y};
			const bottomRight = {x: this.bound.x, y: -this.bound.y};
			
			this.constructor.bounds.set(this, topLeft, topRight, bottomRight, bottomLeft);
			this.setTangents(topLeft, topRight, bottomLeft, bottomRight);
		}
	}
	
	constrainPosition(weight = 2) {
		switch (weight) {
			case WEIGHTS.RATIO:
				this.setZoomPoints();
			
			// eslint-disable-next-line no-fallthrough
			case WEIGHTS.ZOOM:
				this.setBounds();
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
			this.viewportDimensions.width / this.imageDimensions.width / 2 / (0.5 - Math.abs(x)),
			this.viewportDimensions.height / this.imageDimensions.height / 2 / (0.5 - Math.abs(y)),
		);
	}
	
	constrainZoom() {
		this.zoom = this.getConstrainedZoom();
		
		this.setBounds();
	}
}
