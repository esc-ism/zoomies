import {DEGREES} from '@/shared';
import demo from '@/demo';
import {PADDING_VIEWPORT} from '@/demo/consts';

import {getCornerDistance} from './demo';

const getRelevantDemo = ({
	rotation,
	ratio,
	ratioInverse = 1 / ratio,
	sizesImage,
	ratioImage = sizesImage.width / sizesImage.height,
	ratioImageInverse = 1 / ratioImage,
	sizesViewport,
	ratioViewport = sizesViewport.width / sizesViewport.height,
	ratioViewportInverse = 1 / ratioViewport,
}) => ({
	rotation, ratio, ratioInverse,
	sizesImage, ratioImage, ratioImageInverse,
	sizesViewport, ratioViewport, ratioViewportInverse,
});

const getDimensions = (ratio, width, height) => {
	const dimensions = {};
	
	if (ratio < 1) {
		dimensions.width = width;
		dimensions.height = height * ratio;
	} else {
		dimensions.width = width / ratio;
		dimensions.height = height;
	}
	
	return {
		...dimensions,
		halfWidth: dimensions.width / 2,
		halfHeight: dimensions.height / 2,
	};
};

export const getImageDimensions = (ratio, {width, height}) => getDimensions(ratio, width - PADDING_VIEWPORT, height - PADDING_VIEWPORT);

export const getVarGetter = (getZoomPoints, rotation = DEGREES[90], ratio = 1) => () => {
	const mockDemo = getRelevantDemo({
		...demo,
		ratio,
		rotation,
		sizesImage: getImageDimensions(ratio, demo.sizesViewport),
	});
	
	const zoomPoints = getZoomPoints({
		...mockDemo,
		cornerAngle: Math.atan(mockDemo.ratioImage),
		cornerDistance: getCornerDistance(mockDemo.sizesImage),
	});
	
	return {zoomPoints, rotation, ratio, ratioImage: mockDemo.ratioImage};
};
