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
    ## Tickers to sell ##
    <Numbered list of 10 tickers to sell>
    `);
    const alpha = require('alphavantage')({ key: 'qweqweqwe' });
    const cheerio = require('cheerio');
    const createBrowserless = require('browserless');
    const getHTML = require('html-get');

    let symbols: string[] = [];
    
    let input: string = 'Input data: ';

    getContent('https://www.advfn.com/nasdaq/nasdaq.asp').then(html => {
      const $ = cheerio.load(html);
      $('div.market-table-container table tbody tr').each(function(i, tr) {
        if (i < 2) {
          return;
        }
        let symbol: string = $(tr).find('.col-symbol').text();
        symbols.push(symbol);
      });
      console.log(symbols);
      symbols.forEach(s => {

        alpha.data.weekly(s, 'compact', 'csv', '60min').then((data) => {
          input += "CSV weekly market data for the nasdaq symbol '" + s + "': " + data + "\n";
        });
      });
      input += 'Using the given input data, generate a report which title is: Tickers to buy and sell.'


    formatFree(input).then(output => {
      console.log(output);
      process.exit();
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

  }

const browserlessFactory = createBrowserless();

process.on('exit', () => {
  browserlessFactory.close();
});

const getContent = async url => {
  const browserContext = browserlessFactory.createContext();
  const getBrowserless = () => browserContext;
  const result = await getHTML(url, { getBrowserless });
  await getBrowserless((browser) => browser.destroyContext());
  return result;
}

}
export default Trader;
