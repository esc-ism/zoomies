import welcome from './welcome';
import unbound from './unbound';
import center from './center';
import edge from './edge';
import lerped from './rotation/lerped';
import single from './rotation/1line';
import image from './rotation/image';
import double from './rotation/2line';
import triple from './rotation/3line';

import {setPages} from './shared/page';

import './css';

const pages = [welcome, unbound, center, edge, lerped, single, image, double, triple];

setPages(pages);

export default pages;
