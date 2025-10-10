import Demo from '../rotation/3line/demo';

export default class extends Demo {
	constructor() {
		super();
		
		this.bounds.remove();
		
		this.rails[0].deactivate(false);
		this.rails[1].deactivate(false);
		this.rails[2].deactivate(false);
		
		this.rails[3].deactivate(false);
		this.rails[4].deactivate(false);
		this.rails[5].deactivate(false);
		
		this.constructor.elements.viewport.style.pointerEvents = 'none';
	}
	
	// todo CSS transition from one rail state to the next
	applyZoomPoints() {}
	getConstrainedPosition(position) {
		return position;
	}
	
	constrainPosition(arg, isFinal = false) {
		if (isFinal) {
			super.constrainPosition(arg);
		}
	}
	
	updateSizesViewport() {
		super.updateSizesViewport();
		
		this.resizeCallback?.();
	}
	
	remove() {
		super.remove();
		
		this.constructor.elements.viewport.style.removeProperty('pointer-events');
	}
}
