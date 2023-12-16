import { GPTPromptKit, gptPromptKitFactory } from 'gpt-prompt-kit';
import { each } from 'async';

var request = require('request');

export default class Trader {
  
  private GPT_API_KEY: string;
  private ALPHA_API_KEY: string;

  private symbols: string[] = ["AAPL"];
  private gptPromptKit: GPTPromptKit;

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

    this.formatFree = this.gptPromptKit.formatFree(this.outputFormat);
  }

  rateSymbol(symbol: string, cb: Function)  {

    let input: string = 'Input data: ';

    var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + symbol + '&apikey=' + this.ALPHA_API_KEY;

    request.get({
      url: url,
      json: true,
      headers: {'User-Agent': 'request'}
    }, (err: any, res: any, data: any) => {
        if (err) {
          cb(err);
          return;
        } else if (res.statusCode !== 200) {
          cb('Error. Status Code: ', res.statusCode);
          return;
        } else {

          var txt = JSON.stringify(data).replace(/\"/gi, "").replace(/\s/gi, "");

          input += "Market data for the nasdaq symbol '" + symbol + "': " + txt + "\n";
          input += 'Using the given input data, generate a report which title is: What should I do with this ticker today.'

          this.formatFree(input).then(output => {
            console.log(output);
            cb(null);
          })
          .catch(error => {
            cb(error);
          });
        }
    });
  }

  public process(): void {

    let ctx = this;

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
