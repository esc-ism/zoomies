import {DEGREES} from '@/shared';
import demo from '@/demo';
import {PADDING_VIEWPORT} from '@/demo/consts';

const getRelevantDemo = ({
	rotation,
	sizesViewport,
	sizesImage,
	ratioViewport = sizesViewport.width / sizesViewport.height,
	ratioViewportInverse = 1 / ratioViewport,
	ratioImage = sizesImage.width / sizesImage.height,
	ratioImageInverse = 1 / ratioImage,
	ratio = ratioViewport / ratioImage,
	ratioInverse = 1 / ratio,
}) => ({sizesViewport, ratioViewport, ratioViewportInverse, rotation, sizesImage, ratioImage, ratioImageInverse, ratio, ratioInverse});

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

export const getVarGetter = (getZoomPoints, rotation = DEGREES[90], ratio = 1) => () => {
	const {width, height} = demo.sizesViewport;
	const mockDemo = getRelevantDemo({
		...demo,
		rotation,
		sizesImage: getDimensions(ratio, width - PADDING_VIEWPORT, height - PADDING_VIEWPORT),
	});
	const zoomPoints = getZoomPoints(mockDemo);
	
	return {zoomPoints, rotation, ratio, ratioImage: mockDemo.ratioImage};
};
