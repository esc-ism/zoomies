import Demo from '@/demo';

const get = (value, viewportSize, imageSize) => {
	if (viewportSize >= imageSize) {
		return 0;
	}
	
	const padding = viewportSize / imageSize / 2;
	
	return Math.max(-0.5 + padding, Math.min(0.5 - padding, value));
};

export default class extends Demo {
	getPaddingX() {
		const radius = this.viewportDimensions.halfWidth / this.zoom;
		
		return radius >= this.imageDimensions.halfWidth ? 0 : radius / this.imageDimensions.width;
	}
	
	getPaddingY() {
		const radius = this.viewportDimensions.halfHeight / this.zoom;
		
		return radius >= this.imageDimensions.halfHeight ? 0 : radius / this.imageDimensions.height;
	}
	
	setLimits() {
		this.paddingX = this.getPaddingX();
		this.paddingY = this.getPaddingY();
		
		this.points = [
			{x: 0.5 - this.paddingX, y: 0.5 - this.paddingY},
			{x: 0.5 - this.paddingX, y: 0.5 - this.paddingY},
			{x: 0.5 - this.paddingX, y: 0.5 - this.paddingY},
			{x: 0.5 - this.paddingX, y: 0.5 - this.paddingY},
		];
	}
	
	constrainPosition(weight) {
		if (weight <= 0) {
			this.setLimits();
		}
		
		this.position.x = get(this.position.x, this.viewportDimensions.width / this.zoom, this.imageDimensions.width);
		this.position.y = get(this.position.y, this.viewportDimensions.height / this.zoom, this.imageDimensions.height);
	}
	
	constrainZoom() {
		this.zoom = Math.max(
			this.viewportDimensions.width / this.imageDimensions.width / 2 / (0.5 - Math.abs(this.position.x)),
			this.viewportDimensions.height / this.imageDimensions.height / 2 / (0.5 - Math.abs(this.position.y)),
		);
	}
}
