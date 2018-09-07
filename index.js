const puppeteer = require('puppeteer');
require('dotenv').config();

class ListPageScrapper {
  constructor(args) {
    this.pageID = args.pageID;
  }

  async getListPageStatus() {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    try {
      await page.goto('https://www.r-store.jp/chintai/?&page=' + `${this.pageID}`);

      let toSingleElements = await page.$$('.post-list');
      let toSingleHrefsArray = [];
      for (let i = 1; i <= toSingleElements.length; i++) {
        toSingleHrefsArray.push(await page.$eval(`.post-list:nth-child(${i}) > a`, el => el.href))
      }

      //const toSingleHref = await page.$eval(`.post-list:nth-child(${}) > a`, el => el.href);

      /*const toSingleHref = await page.evaluate(() => {
        let singleHrefs = document.querySelectorAll('.post-list > a');
        let singleHrefsArray = [];
        for(let i=0; i < singleHrefsArray.length; i++) {
          singleHrefsArray.push(singleHrefs[i].)
        }
        return singleHrefs;
      });*/

      await browser.close();

      return toSingleHrefsArray;
    } catch (e) {
      console.error(e);
      await browser.close();
      return e;
    }
  }
}

class singleScrapper {
  constructor(args) {
    this.roomURL = args.roomURL;
  }

  async getSingleStatus() {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    try {
      await page.goto(this.roomURL);

      let singleInfoProperty = await page.evaluate(() => {
        let singleInfomationsElement = document.querySelectorAll('.sidebar-single > .info > ul > li');
        let singleInfomations = {};
        let singleInfomationsKey = '';
        let singleInfomationsValue = '';
        let loopCount = 0;
        for (let i=0; i < singleInfomationsElement.length; i++) {
          singleInfomationsKey = singleInfomationsElement[i].children[0].innerText;
          singleInfomationsValue = singleInfomationsElement[i].children[1].innerText;
          singleInfomations[`${singleInfomationsKey}`] = singleInfomationsValue;
          loopCount = singleInfomations;
        }
        return loopCount;
      });

      await browser.close();

      return singleInfoProperty;
    } catch (e) {
      console.error(e);
      await browser.close();
      return e;
    }
  }
}

const listpageInfo = new ListPageScrapper({
  pageID: '1',
});

listpageInfo.getListPageStatus().then((listpageLinks) => { 
  /*const singleInfo = new singleScrapper({
    roomURL: listpageLinks[0],
  })
  singleInfo.getSingleStatus().then((result) => {
    console.log(result);
  })*/
  let singleInfos = new Array(listpageLinks.length);
  for(let i=0; i < listpageLinks.length; i++) {
    const singleInfo = new singleScrapper({
      roomURL: listpageLinks[i]
    });
    singleInfo.getSingleStatus().then((result) => {
      singleInfos[i] = result;
    console.log(singleInfos[i]);
    });
  }
});



/*singleInfo.getSingleStatus().then((result) => {
  console.log(result);
});*/