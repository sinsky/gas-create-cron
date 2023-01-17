declare const global: {
  [x: string]: any;
};

import { fn } from "./fn";

global.fn = fn;
