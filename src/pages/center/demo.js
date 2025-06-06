import Demo from '@/demo';

export default class extends Demo {
	constrainPosition() {
		this.position.x = Math.max(-0.5, Math.min(0.5, this.position.x));
		this.position.y = Math.max(-0.5, Math.min(0.5, this.position.y));
	}
	
	constrainZoom() {}
}
