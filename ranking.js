const puppeteer = require('puppeteer');
const fs = require('fs');
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
      let tableRankingObject = {};
      for (let i = 1; i <= tableRanking.length; i++) {
        let link = await page.$eval(`.table-ranking > tbody > tr:nth-child(${i}) > .col-name > a`, el => el.href);
        let name = await page.$eval(`.table-ranking > tbody > tr:nth-child(${i}) > .col-name > a`, el => el.innerText);
        let icon = await page.$eval(`.table-ranking > tbody > tr:nth-child(${i}) > td:nth-child(1) > a > .thumbnail`, el => el.src);
        let office = ''
        try {
          office = await page.$eval(`.table-ranking > tbody > tr:nth-child(${i}) > .col-name > .box-office > a`, el => el.innerText);
        } catch(e) {
          office = ''
        }
        tableRankingObject[link.split('user/')[1]] = ({link, name, icon, office});
      }

      await browser.close();

      return tableRankingObject;
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
  fs.writeFile('ranking.json', JSON.stringify(link, null, ' '));
});