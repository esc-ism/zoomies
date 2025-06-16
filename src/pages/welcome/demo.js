import Demo from '../rotation/axis/demo';

export default class extends Demo {
	constructor() {
		super();
		
		this.bounds.remove();
	}
	
	setTangents() {}
	
	setBounds() {}
	
	updateImageDimensions(...args) {
		super.updateImageDimensions(...args);
		
		this.initialImageDimensions = {...this.imageDimensions};
	}
	
	getImageDimensions(ratio) {
		const width = Math.min(this.initialImageDimensions.width, this.initialImageDimensions.width / ratio);
		const height = Math.min(this.initialImageDimensions.height, this.initialImageDimensions.height * ratio);
		
		return {
			width, height,
			halfWidth: width / 2,
			halfHeight: height / 2,
		};
	}
}
