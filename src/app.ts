import Trader from './index';

let GPT_API_KEY: string = "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";
let ALPHA_API_KEY: string = "S23XX6TMAXA3LDGL";

let traderInstance = new Trader(GPT_API_KEY, ALPHA_API_KEY);
traderInstance.process();
