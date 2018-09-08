const puppeteer = require('puppeteer');
require('dotenv').config();

class RankingScrapper {
  constructor(args) {
    this.schedulesURL = args.schedulesURL;
  }

  async getRanking() {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    try {
      await page.goto(this.schedulesURL);

      let schedules = await page.evaluate(() => {
        let dayIndex = [];
        let dailyIndex = [];
        let list = document.querySelectorAll('.table > tbody > tr');
        let output
        for(let i=0; i < list.length; i++) {
          if(list[i].classList.contains('text-white')) {
            let text = list[i].querySelector('td:nth-child(1)').innerText
            dayIndex.push({i, text});
          } else {
            let hour = list[i].querySelector('td:nth-child(1)').innerText
            let minutes = list[i].querySelectorAll('td:nth-child(2) > div > div:nth-child(1)');
            let programs = list[i].querySelectorAll('td:nth-child(2) > div > div:nth-child(2)');
            let minute = {};
            for(let l=0; l < minutes.length; l++) {
              let program = programs[l].querySelectorAll('span > a');
              minute[minutes[l].innerText] = programs[l].innerText;
            }
            dailyIndex.push({i, hour, minute});
          }
        }
        return {dayIndex, dailyIndex};
      })

      await browser.close();

      return schedules;
    } catch (e) {
      console.error(e);
      await browser.close();
      return e;
    }
  }
}

const Ranking = new RankingScrapper({
  pageID: '1',
  schedulesURL: process.env.schedulesURL
});

Ranking.getRanking().then((data) => {
  //console.log(data);
  console.log(data.dailyIndex);
});