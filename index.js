const puppeteer = require('puppeteer');
require('dotenv').config();

class RankingScrapper {
  constructor(args) {
    this.rankingURL = args.rankingURL;
  }

  async getRanking() {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    try {
      await page.goto(this.rankingURL);

      let tableRanking = await page.$$('.table-ranking > tbody > tr');
      let tableRankingArray = [];
      for (let i = 1; i <= tableRanking.length; i++) {
        let link = await page.$eval(`.table-ranking > tbody > tr:nth-child(${i}) > .col-name > a`, el => el.href);
        //let nameElement = await tableRanking[i].$('.col-name');
        let name = await page.$eval(`.table-ranking > tbody > tr:nth-child(${i}) > .col-name > a`, el => el.innerText);
        let icon = await page.$eval(`.table-ranking > tbody > tr:nth-child(${i}) > td:nth-child(1) > a > .thumbnail`, el => el.src);
        let office = ''
        try {
          office = await page.$eval(`.table-ranking > tbody > tr:nth-child(${i}) > .col-name > .box-office > a`, el => el.innerText);
        } catch(e) {
          office = ''
        }
        tableRankingArray.push({link, name, icon, office});
      }

      await browser.close();

      return tableRankingArray;
    } catch (e) {
      console.error(e);
      await browser.close();
      return e;
    }
  }
}

const Ranking = new RankingScrapper({
  pageID: '1',
  rankingURL: process.env.rankingURL
});

Ranking.getRanking().then((link) => {
  console.log(link);
  console.log(link.length);
});