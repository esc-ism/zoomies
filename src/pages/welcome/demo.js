import elements from '@/demo/elements';

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
		
		elements.viewport.style.pointerEvents = 'none';
	}
	
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
		
		elements.viewport.style.removeProperty('pointer-events');
	}
}
