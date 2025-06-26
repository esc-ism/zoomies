import Hideables from './copies';

import {setLineStyle} from '../bounds';
import {Connection} from './lines';

import {getLineX, getLineY} from '@/pages/rotation/shared';

const getEnd = ({isHigh, isSide}, line) => {
	if (isSide) {
		return isHigh ? {x: 0.5, y: getLineY(line, 0.5)} : {x: -0.5, y: getLineY(line, -0.5)};
	}
	
	return isHigh ? {y: 0.5, x: getLineX(line, 0.5)} : {y: -0.5, x: getLineX(line, -0.5)};
};

class Tangent extends Connection {
	static template = Connection.template.cloneNode();
	
	static {
		setLineStyle(this.template);
	}
	
	set(from, line, property) {
		super.set(from, getEnd(line, line[property]));
	}
}

export default class extends Hideables {
	constructor(count, ...args) {
		super();
		
		for (let i = 0; i < count; ++i) {
			this[i] = new Tangent(...args);
		}
	}
}
