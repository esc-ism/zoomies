import Hideables from './copies';

import {setLineStyle} from '../bounds';
import {Connection} from './lines';

import {getLineX, getLineY} from '@/pages/rotation/shared';

const getEnd = ({isHigh, isSide}, line) => {
	const fixed = isHigh ? 0.5 : -0.5;
	const derived = (isSide ? getLineY : getLineX)(line, fixed);
	const [fixedProp, derivedProp] = isSide ? ['x', 'y'] : ['y', 'x'];
	
	if (Math.abs(derived) <= 0.5) {
		return {[fixedProp]: fixed, [derivedProp]: derived};
	}
	
	const limited = 0.5 * Math.sign(derived);
	
	return {[derivedProp]: limited, [fixedProp]: (isSide ? getLineX : getLineY)(line, limited)};
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
