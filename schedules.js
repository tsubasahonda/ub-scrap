const puppeteer = require('puppeteer');
const fs = require('fs');
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
        let dayIndex = {};
        let dailyIndex = [];
        let list = document.querySelectorAll('.table > tbody > tr');
        let day, hour, minutes, programs;
        for(let i=0; i < list.length; i++) {
          //let hour, minutes, programs;
          if(list[i].classList.contains('text-white')) {
            day = list[i].querySelector('td:nth-child(1)').innerText;
          } else {
            hour = list[i].querySelector('td:nth-child(1)').innerText;
            minutes = list[i].querySelectorAll('td:nth-child(2) > div > div:nth-child(1)');
            programs = list[i].querySelectorAll('td:nth-child(2) > div > div:nth-child(2)');
            let minute = {};
            for(let l=0; l < minutes.length; l++) {
              let program = programs[l].querySelectorAll(':scope > span > a');
              let user = programs[l].querySelectorAll(':scope > span');
              let programInfo = {}; 
              for(let k=0; k < program.length; k++) {
                try {
                  programInfo[k] = {
                    name: user[k].querySelector(':scope > span > a').innerText,
                    program: program[k].innerText,
                    programLink: program[k].getAttribute('href'),
                    day: day,
                    hour: hour,
                    minutes: minutes[l].innerText
                  };
                } catch(e) {
                  programInfo[k] = {
                    name: '',
                    program: program[k].innerText,
                    programLink: program[k].getAttribute('href')
                  };
                }
              }
              minute[minutes[l].innerText] = {programInfo};
            }
            dailyIndex.push({i, hour, minute});
          }
        }
        return dailyIndex;
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
  console.log(data);
  //console.log(data.dailyIndex[7].minute['0分'].programInfo);
  fs.writeFile('schedules.json', JSON.stringify(data, null, ' '));
});