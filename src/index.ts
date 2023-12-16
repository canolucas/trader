import { GPTPromptKit, gptPromptKitFactory } from 'gpt-prompt-kit';

class Trader {

  private API_KEY: string;

  constructor(API_KEY: string) {
    this.API_KEY = API_KEY;
  }

  public prompt(): Promise<string> {

    const gptPromptKit = gptPromptKitFactory(API_KEY);
    const formatFree = gptPromptKit.formatFree(`
    Title: <Title>
    ## Abstract ##
    <Text of abstract>
    ## Tickers to buy ##
    <Numbered list of 10 tickers to buy>
    ## Tickers to buy ##
    <Numbered list of 10 tickers to buy>
    `);
    const alpha = require('alphavantage')({ key: 'qweqweqwe' });
    const cheerio = require('cheerio');



    alpha.data.weekly(symbol, outputsize, datatype, interval);

    let input: string = 'Using the following input data, generate a report which title is: Tickers to buy and sell. Input data: ';

    return formatFree(input);
  }
}
export default Trader;
