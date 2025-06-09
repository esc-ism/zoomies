import Demo from '@/demo';

export default class extends Demo {
	setPointX() {
		const radius = this.viewportDimensions.halfWidth / this.zoom;
		
		this.pointX = radius >= this.imageDimensions.halfWidth ? 0 : 0.5 - radius / this.imageDimensions.width;
	}
	
	setPointY() {
		const radius = this.viewportDimensions.halfHeight / this.zoom;
		
		this.pointY = radius >= this.imageDimensions.halfHeight ? 0 : 0.5 - radius / this.imageDimensions.height;
	}
	
	setLimits() {
		this.setPointX();
		this.setPointY();
		
		if (this.pointY <= 0 && this.pointX <= 0) {
			this.constructor.limitDisplay.setLimits([], []);
			
			return;
		}
		
		const topLeft = {x: -this.pointX, y: this.pointY};
		const topRight = {x: this.pointX, y: this.pointY};
		const bottomLeft = {x: -this.pointX, y: -this.pointY};
		const bottomRight = {x: this.pointX, y: -this.pointY};
		
		const tangents = {
			top: {
				right: {c: this.pointY, m: Infinity, ...topRight},
				left: {c: this.pointY, m: Infinity, ...topLeft},
				isHigh: true,
				isSide: false,
			},
			right: {
				top: {c: this.pointY, m: 0, ...topRight},
				bottom: {c: -this.pointY, m: 0, ...bottomRight},
				isHigh: true,
				isSide: true,
			},
			bottom: {
				right: {c: -this.pointY, m: Infinity, ...bottomRight},
				left: {c: -this.pointY, m: Infinity, ...bottomLeft},
				isHigh: false,
				isSide: false,
			},
			left: {
				top: {c: this.pointY, m: 0, ...topLeft},
				bottom: {c: -this.pointY, m: 0, ...bottomLeft},
				isHigh: false,
				isSide: true,
			},
		};
		
		this.constructor.limitDisplay.setLimits(
			[topLeft, topRight, bottomRight, bottomLeft],
			[
				...this.pointX <= 0 ?
						[] :
						[
							[topLeft, tangents.top, 'left'],
							[topRight, tangents.top, 'right'],
							[bottomLeft, tangents.bottom, 'left'],
							[bottomRight, tangents.bottom, 'right'],
						],
				...this.pointY <= 0 ?
						[] :
						[
							[topLeft, tangents.left, 'top'],
							[bottomLeft, tangents.left, 'bottom'],
							[topRight, tangents.right, 'top'],
							[bottomRight, tangents.right, 'bottom'],
						],
			],
		);
	}
	
	constrainPosition(weight = 2) {
		if (weight <= 1) {
			this.setLimits();
		}
		
		this.position.x = Math.max(-this.pointX, Math.min(this.pointX, this.position.x));
		this.position.y = Math.max(-this.pointY, Math.min(this.pointY, this.position.y));
	}
	
	constrainZoom() {
		this.zoom = Math.max(
			this.viewportDimensions.width / this.imageDimensions.width / 2 / (0.5 - Math.abs(this.position.x)),
			this.viewportDimensions.height / this.imageDimensions.height / 2 / (0.5 - Math.abs(this.position.y)),
		);
		
		this.setLimits();
	}
}
