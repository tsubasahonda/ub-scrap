const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

class SchedulesScrapper {
  constructor(args) {
    this.schedulesURL = args.schedulesURL;
  }

  async getSchedules() {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless: true,
      dumpio: true
    });
    const page = await browser.newPage();
    /*page.on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i)
        console.log(`${i}: ${msg.args[i]}`);
    });*/

    try {
      await page.goto(this.schedulesURL);

      let dailyIndex = {};
      let list = await page.$$('.box-live-schedules > .table > tbody > tr');
      let day, hour, minutes, programs;

      let dayIndex = await page.evaluate(() => {
        let list = document.querySelectorAll('.table > tbody > tr');
        let di = [];
        for(let i = 0; i < list.length; i++) {
          if(list[i].classList.contains('text-white')) {
            di.push(i);
          }
        }
        return di;
      });

      for(let i=0; i < list.length; i++) {
        if(dayIndex.includes(i)) {
          day = await list[i].$eval('td:nth-child(1)', el => el.innerText);
        }
        hour = await list[i].$eval('td:nth-child(1)', el => el.innerText);
        minutes = await list[i].$$('td:nth-child(2) > div > div:nth-child(1)');
        programs = await list[i].$$('td:nth-child(2) > div > div:nth-child(2)');
        let minute = {};
        for(let l=0; l < minutes.length; l++) {
          let program = await programs[l].$$(':scope > span > a');
          let user = await programs[l].$$(':scope > span');
          let programInfo = {};
          for(let k=0; k < program.length; k++) {
            try {
              programInfo[k] = {
                name: await user[k].$eval(':scope > span > a', el => el.innerText),
                program: await page.evaluate(el => el.innerText, program[k]),
                programLink: await page.evaluate(el => el.href, program[k]),
                programRedirectedLink: '',
                day: day,
                hour: hour,
                minutes: await page.evaluate(el => el.innerText, minutes[l])
              };
            } catch(e) {
              programInfo[k] = {
                name: '',
                program: await page.evaluate(el => el.innerText, program[k]),
                programLink: await page.evaluate(el => el.href, program[k]),
                programRedirectedLink: '',
                day: day,
                hour: hour,
                minutes: await page.evaluate(el => el.innerText, minutes[l])
              };
            }
            const redirect = await browser.newPage();
            await redirect.goto(programInfo[k].programLink);
            //let res = await page.goto(programInfo[k].programLink);
            programInfo[k].programRedirectedLink = redirect.url();
            await redirect.close();
          }
          minute[await page.evaluate(el => el.innerText, minutes[l])] = programInfo;
          dailyIndex[i] = minute;
        }
      }

      await browser.close();

      return dailyIndex;
    } catch (e) {
      console.error(e);
      await browser.close();
      return e;
    }
  }
}

const Schedules = new SchedulesScrapper({
  pageID: '1',
  schedulesURL: process.env.schedulesURL
});

Schedules.getSchedules().then((data) => {
  console.log(data[9]);
  //console.log(data);
  fs.writeFile('schedules.json', JSON.stringify(data, null, ' '));
});