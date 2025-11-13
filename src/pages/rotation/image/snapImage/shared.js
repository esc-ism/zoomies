import {getLine} from '../../../shared/svg';

export const getMirroredLine = (...points) => [getLine(...points), getLine(...points.map(([x, y]) => [-x, -y]))];
