import * as dotenv from 'dotenv';
import * as path from 'path';
import { OpenAI } from 'openai';
import { each } from 'async';

var request = require('request');

export default class Trader {
  
  private GPT_API_KEY: string;
  private ALPHA_API_KEY: string;

  private symbols: string[] = ["AAPL"];
  private openai: OpenAI;

  constructor() {

    dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

    this.GPT_API_KEY = process.env['GPT_API_KEY'] || '';
    this.ALPHA_API_KEY = process.env['ALPHA_API_KEY'] || '';

    this.openai = new OpenAI({
      apiKey: this.GPT_API_KEY,
    });
  }

  rateSymbol(symbol: string, cb: Function)  {

    let ctx = this;
    var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + symbol + '&apikey=' + this.ALPHA_API_KEY;
    let input: string = 'Input data: ';

    request.get({
      url: url,
      json: true,
      headers: {'User-Agent': 'request'}
    }, (err: any, res: any, data: any) => {
        if (err) {
          cb(err);
          return;
        }
        if (res.statusCode !== 200) {
          cb('Error. Status Code: ', res.statusCode);
          return;
        }
        var txt = JSON.stringify(data).replace(/\"/gi, "").replace(/\s/gi, "");

        input += "Market data for the nasdaq symbol '" + symbol + "': " + txt + "\n";
        input += 'Using the given input data, complete the following form. Take in account that both numbers indicated below must add up to 100: '
        input += 'Assign a numeric value between 0 and 100 indicating how profitable it is to buy this ticker today. Please answer with a number: 0-100. '
        input += 'Assign a numeric value between 0 and 100 indicating how profitable it is to sell this ticker today. Please answer with a number: 0-100.'

        ctx.openai.chat.completions.create({
          messages: [{ role: 'user', content: input }],
          model: 'gpt-3.5-turbo',
        }).then((output: any) => {
          console.log(output);
          cb(null);
        })
        .catch((error: any) => {
          cb(error);
        });
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
