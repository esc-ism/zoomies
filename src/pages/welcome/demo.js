import Demo from '../rotation/2line/axisViewport/demo';

export default class extends Demo {
	constructor() {
		super();
		
		this.bounds.remove();
		
		this.rails[0].deactivate();
		this.rails[1].deactivate();
		
		this.rails[2].deactivate(false);
		this.rails[3].deactivate(false);
	}
	
	// todo instead of using setZoomPoints, CSS transition from one rail state to the next
	applyZoomPoints() {}
	getConstrainedPosition(position) {
		return position;
	}
}
