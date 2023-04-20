import puppeteer from 'puppeteer';
import fs from 'file-system';
(async () => {
 const browser = await puppeteer.launch({
  headless: true,
 });
 const page = await browser.newPage();
 let freshersJobs = [];
 let govJobs = [];
 let hireAndTrain = [];
 let jobModel = {
  title: '',
  city: '',
  experience: '',
  qualification: '',
  postedAgo: ''
 }
 //freshers jobs
 await page.goto('https://www.freshersworld.com/jobs/category/research-job-vacancies');
 await prepareJobs('fresher');
 //gov jobs
 await page.goto('https://www.freshersworld.com/jobs/category/govt-sector-job-vacancies');
 await prepareJobs('gov');
 await goToPagination('https://www.freshersworld.com/jobs/category/govt-sector-job-vacancies', govJobs.length, 'gov', govJobs);
 await page.goto('https://www.freshersworld.com/jobs/category/1-to-3-yr-exp-job-vacancies');
 await prepareJobs('hireAndTrain');
 await goToPagination('https://www.freshersworld.com/jobs/category/1-to-3-yr-exp-job-vacancies', hireAndTrain.length, 'hireAndTrain', hireAndTrain);
  fs.writeFile('output.json', JSON.stringify(
    {
      govJobs: govJobs,
      freshersJobs: freshersJobs,
      hireAndTrain: hireAndTrain
    }
  ), function(err) {})
  console.log('gov', govJobs);
  console.log('freshers', freshersJobs);
  console.log('hireAndTrain', hireAndTrain);
  console.log('gov', govJobs.length);
  console.log('freshers', freshersJobs.length);
  console.log('hireAndTrain', hireAndTrain.length);
 await browser.close();
 async function prepareJobs(jobType) {
  const jobs = await page.$$('.job-container');
  if(jobs.length > 0) {
    for(let i = 0; i < jobs.length; i++) {
      const jobTitleSelector = await jobs[i].$('.seo_title');
      const jobTitle = await jobTitleSelector.evaluate(title => title.textContent);
      const jobExperience = await jobs[i].$('.experience');
      const experience = await jobExperience.evaluate(title => title.textContent);
      const postedAgo = await jobs[i].$('.ago-text');
      const postAgo = await postedAgo.evaluate(title => title.textContent);
      const location = await jobs[i].$('.job-location');
      const jobLocation = await location.evaluate(title => title.textContent);
      jobModel.title = jobTitle;
      jobModel.experience = experience;

      jobModel.postedAgo = postAgo;
      jobModel.city = jobLocation;
      if(jobType == 'fresher') {
        freshersJobs.push(Object.assign({}, jobModel));
      } else if(jobType == 'gov') {
        govJobs.push(Object.assign({}, jobModel));
      } else if(jobType == 'hireAndTrain') {
        hireAndTrain.push(Object.assign({}, jobModel));
      }
    }
    return true;
  } else {
    return false
  }
 }
 async function goToPagination(url, offset, jobType, jobsTypeData) {
  await page.goto(`${url}?&limit=30&offset=${offset}`);
  const locationUrl = await page.evaluate(() => document.location.href);

  if(url != locationUrl) {
    const jobs = await prepareJobs(jobType)
    if(jobs) {
      await goToPagination(url, jobsTypeData.length, jobType, jobsTypeData)
    }
  }
 }

})()