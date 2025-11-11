import {CLASS_CONTAINER, CLASS_WRAPPER} from './consts';
import getRefreshButton from './refresh';
import getMaxButton from './size/maximise';
import getMinButton from './size/minimise';

import './css';

export default () => {
	const wrapper = document.createElement('span');
	const container = document.createElement('span');
	
	wrapper.classList.add(CLASS_WRAPPER);
	container.classList.add(CLASS_CONTAINER);
	
	const refresh = getRefreshButton();
	const max = getMaxButton();
	const min = getMinButton();
	
	container.append(refresh, max);
	wrapper.append(container);
	
	return {wrapper, refresh, max, min};
};
