import { GPTPromptKit, gptPromptKitFactory } from 'gpt-prompt-kit';
import { each } from 'async';

const cheerio = require('cheerio');
const alpha = require('alphavantage');
const createBrowserless = require('browserless');
const getHTML = require('html-get');

const browserlessFactory = createBrowserless();

process.on('exit', () => {
  browserlessFactory.close();
});

const getContent = async (url: string) => {
  const browserContext = browserlessFactory.createContext();
  const result = await getHTML(url, { browserContext });
  await browserContext.destroyContext();
  return result;
}

class Trader {

  private GPT_API_KEY: string;
  private ALPHA_API_KEY: string;

  private symbols: string[] = [];
  private gptPromptKit: GPTPromptKit;
  private alphaInstance: any;

  private formatFree: (description: string) => Promise<string>;

  private outputFormat: string = `Title: <Title>
## Should I buy today ##
<Number 1 to 10 indicating how profitable would it be to buy this ticker today>
## Should I sell today ##
<Number 1 to 10 indicating how profitable would it be to sell this ticker today>`;

  constructor(GPT_API_KEY: string, ALPHA_API_KEY: string) {

    this.GPT_API_KEY = GPT_API_KEY;
    this.ALPHA_API_KEY = ALPHA_API_KEY;

    this.gptPromptKit = gptPromptKitFactory(this.GPT_API_KEY);
    this.alphaInstance = alpha({ key: this.ALPHA_API_KEY });

    this.formatFree = this.gptPromptKit.formatFree(this.outputFormat);
  }

  public prompt(): void {

    getContent('https://www.advfn.com/nasdaq/nasdaq.asp').then((html) => this.parseHtml(html));
  }

  rateSymbol(symbol: string, cb: Function)  {

    let input: string = 'Input data: ';

    this.alphaInstance.data.weekly(symbol, 'compact', 'csv', '60min').then((data: any) => {
      input += "CSV weekly market data for the nasdaq symbol '" + symbol + "':\n";
      input += data + "\n";
      input += 'Using the given input data, generate a report which title is: What should I do with this ticker today.'

      this.formatFree(input).then(output => {
        console.log(output);
      })
      .catch(error => {
        console.error(error);
      });

    })
    .catch((alphaError:any) => {
      console.error(alphaError);
    });
  }

  parseHtml(html: string): void {
    let ctx = this;
    const $ = cheerio.load(html);
    $('div.market-table-container table tbody tr').each(function(index: any, tr: any) {
      if (index < 2) {
        return;
      }
      let symbol: string = $(tr).find('.col-symbol').text();
      ctx.symbols.push(symbol);
    });
    console.log('scanning ' + ctx.symbols.join(","));

    each(ctx.symbols, function (symbol: string, cb) {

      ctx.rateSymbol(symbol, cb);

    }, function (err) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        process.exit();
    });
  }
}
export default Trader;
