const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: false,
  waitTimeout: 5000
});

class AmazonPriceChecker{
  constructor(url){
    //Force ?sp=1 to make amazon show us the price
    //this avoids the "click here to see price" issue
    this.url = this.updateQueryStringParameter(url, 'sp', 1);
  }

  updatePrice(){
    let promise = new Promise(this._actuallyRun.bind(this));
    return promise;
  } 

  _actuallyRun(resolve, reject){
    nightmare
    //Pretend to be a simple browser to force Amazon to load the basic HTML version of the site.
    .useragent('Opera/9.80 (iPhone; Opera Mini/8.0.0/34.2336; U; en) Presto/2.8.119 Version/11.10')
    .goto(this.url)
    .wait('body')
    .evaluate(function(){
      //Since this function runs in the document of the page itself and our class, 
      //I include the helper methods here

      //XPath helper to get the string value for a query
      let getStringWithXPath = function(xPath){
        let value = document.evaluate(xPath, document, null, XPathResult.STRING_TYPE, null);
        value = value.stringValue.trim();
        return value;
      };

      //Executes the XPath queries in the array then stops when
      //One of them returns a value
      let findFirstXPathString = function(selectorArray){
        let result = null;

        selectorArray.some(function(selector){
          let res = getStringWithXPath(selector);
          if(res.length){
            result = res;
            return true;
          }
        });

        return result;
      }

      //Attempt to find the original price based on a number of keywords
      //Save these as an array and auto gen the xpath for it
      let keywords = ['List Price', 'Was','M.R.P','MRP','R.R.P','RRP','Print List Price','Price'];
      let contains = 'contains(text(), "' + keywords.join('") or contains(text(),"') + '")';

      let original_price = findFirstXPathString([
        '//span[contains(@class,"dpListPrice")]/text()', //Basic HTML element
        '//td[' + contains + ']/following-sibling::td/span/text()',
        '//span[' + contains + ']/following-sibling::span/text()'
      ]);

      let current_price = findFirstXPathString([
        '//span[contains(@class,"dpOurPrice")]/text()', //Basic HTML element
        '//span[contains(@id,"ourprice") or contains(@id,"saleprice") or contains(@id,"dealprice")]/text()',
        '//span[contains(@class,"buyingPrice")]/text()',

        //Some pages (books) don't have these elements so we'll look for the .offer-price value
        '//span[contains(@class,"offer-price")]/text()'
      ]);

      //Determine if this price is a deal or not
      //Look for the deal price element
      let savingsElem = document.querySelector('.dpEssentialInfoTopSection tr:nth-child(3) td[align=left] span');

      if(!savingsElem){
        savingsElem = document.querySelector('#regularprice_savings td:last-child') || document.querySelector('#dealprice_savings td:last-child');
      }

      //Get the savings string
      let savingsRawStr = savingsElem ? savingsElem.innerText.trim() : '';

      //If the deal is missing fallback to trying to find the Save: $XX.XX (XX%) string value
      if(!savingsRawStr || !savingsRawStr.length){
        savingsRawStr = getStringWithXPath('//span[contains(text(),"Save:")]');
      }

      //If we found on, then there's a deal
      let isDeal = savingsRawStr.length ? true : false;
      let savingsPrice = null;
      let savingsPercent = null;

      //If there's a deal parse the deal string to break them into 2 parts: Price, and Percent
      if(isDeal){
        let savingsArray = savingsRawStr.split('(');

        if(savingsArray.length <= 1){
          savingsPrice = savingsRawStr;
        }
        else{
          savingsPrice = savingsArray[0];
          savingsPrice = savingsPrice.trim();

          if(savingsPrice.indexOf(':') != -1){
            let s = savingsPrice.split(':');
            savingsPrice = s[s.length-1];
            savingsPrice = savingsPrice.trim();
          }

          savingsPercent = savingsArray[1];
          savingsPercent = savingsPercent.trim();
          savingsPercent = savingsPercent.split('%')[0] + '%';
        }
      }

      //Send it off
      return {
        'original_price': original_price,
        'current_price': current_price,
        'savings_price': savingsPrice,
        'savings_percent': savingsPercent,
        'isDeal': isDeal
      }
    })
    .end()
    .then(function(value){
      if(value === false){
        reject('Invalid response while processing');
        return;
      }

      resolve(value);
    })
    .catch(function(error){
      reject(error);
    });
  }

  //Private helpers
  isValidAmazonURL(){
    let helpers = require('./helpers');
    let ASIN = helpers.extractASINFromURL(this.url);

    return ASIN ? true : false;
  }

  //Courtesy of: https://stackoverflow.com/a/6021027
  updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
      return uri + separator + key + "=" + value;
    }
  }


}

module.exports = AmazonPriceChecker;