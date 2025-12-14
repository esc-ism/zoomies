import demo from '@/demo';
import Tangents from '@/demo/lines/tangents';
import Bounds from '@/demo/bounds';
import {getFlipped, getGenericIntersection, getProgressed} from '../rotation/shared';

// todo replace the Math.abs stuff in single-line
const getCorners = ({x, y}) => {
	if (-x < y) {
		return [x > y ? {x: 0.5, y: -0.5} : {x: -0.5, y: 0.5}, {x: 0.5, y: 0.5}];
	}
	
	return [{x: -0.5, y: -0.5}, x > y ? {x: 0.5, y: -0.5} : {x: -0.5, y: 0.5}];
};

const getBounds = () => {
	const [corner0, corner1] = getCorners(demo.position);
	
	if (Math.abs(demo.position.x) >= 0.5 || Math.abs(demo.position.y) >= 0.5) {
		return [corner0, corner1];
	}
	
	const [main, sub] = corner0.x !== corner1.x ?
			[demo.position.x, Math.abs(demo.position.y)] :
			[demo.position.y, Math.abs(demo.position.x)];
	
	if (main < 0) {
		const point0 = getProgressed({x: sub * Math.sign(corner0.x), y: sub * Math.sign(corner0.y)}, corner0, -main);
		
		return [point0, getGenericIntersection([point0, demo.position], [{x: 0, y: 0}, corner1])];
	}
	
	const point1 = getProgressed({x: sub * Math.sign(corner1.x), y: sub * Math.sign(corner1.y)}, corner1, main);
	
	return [getGenericIntersection([point1, demo.position], [{x: 0, y: 0}, corner0]), point1];
};

export default class {
	bounds = new Bounds();
	tangents = new Tangents(4, false, false, true);
	
	setBounds() {
		if (demo.position.x === 0 && demo.position.y === 0) {
			this.bounds.set();
			
			return;
		}
		
		const bounds = getBounds();
		
		if (demo.position.y > demo.position.x) {
			this.bounds.set(...bounds, getFlipped(bounds[0]), getFlipped(bounds[1]));
		} else {
			this.bounds.set(bounds[1], bounds[0], getFlipped(bounds[1]), getFlipped(bounds[0]));
		}
	}
	
	constrainZoom() {
		this.setBounds();
	}
	
	constrainPosition({position, ratio}) {
		if (!position && !ratio) {
			return;
		}
		
		demo.position.x = Math.max(-0.5, Math.min(0.5, demo.position.x));
		demo.position.y = Math.max(-0.5, Math.min(0.5, demo.position.y));
		
		// get bounds
		this.setBounds();
	}
	
	remove() {
		this.bounds.remove();
		this.tangents.remove();
	}
}
