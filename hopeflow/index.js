const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');

const CREDS = {}
CREDS.username = process.env.WEBFLOWUSERNAME
CREDS.password = process.env.WEBFLOWPASSWORD
const PROJECT_URL = process.env.WEBFLOWPROJECTURL

const LOGIN_BUTTON_ = '.nav_signup.cc-secondary'
const USERNAME_ = 'input[name=username]'
const PASSWORD_ = 'input[name=password]'
const SUBMIT_ = 'button[type=submit]'
const EXPORT_BUTTON_ = '#designer-app-react-mount > div > div > div:nth-child(1) > div.bem-TopBar > div.bem-TopBar_Body > div.bem-TopBar_Body_Group.bem-TopBar_Body_Group-right > div.bem-TopBar_Body_Button.bem-TopBar_Body_ExportButton'
const ZIP_BUTTON_ = '#designer-app-react-mount > div > div > div:nth-child(2) > div:nth-child(3) > div > div > div > div > div > div > div.kit-scrollbar > div:nth-child(5) > div:nth-child(5)'
const DOWNLOAD_BUTTON_ = '#designer-app-react-mount > div > div > div:nth-child(2) > div:nth-child(3) > div > div > div > div > div > div > div.kit-scrollbar > div:nth-child(5) > a > div'
// create a screensots directory
if (!fs.existsSync('screenshots')){
    fs.mkdirSync('screenshots');
}

async function run() {
  const browser = await puppeteer.launch({
                       args: ['--no-sandbox', '--disable-setuid-sandbox']
                      });
  const page = await browser.newPage();

  await page.goto(PROJECT_URL);

  // Open Login Page
  // const [gotologinpage] = await Promise.all([
  //    page.waitForNavigation(), 
  //    page.click(LOGIN_BUTTON_), 
  //          ]);

  await page.screenshot({ path: 'screenshots/loginpage.png' });

  // Log in with credentials
  const [gotologinpage] = await Promise.all([
      page.waitForNavigation(), 
      page.click(USERNAME_)
      page.keyboard.type(CREDS.username)
      page.click(PASSWORD_)
      page.keyboard.type(CREDS.password)
      page.click(SUBMIT_)
            ]);
  /* await page.click(USERNAME_)
  await page.keyboard.type(CREDS.username)
  await page.click(PASSWORD_)
  await page.keyboard.type(CREDS.password)
  await page.click(SUBMIT_)
  await page.waitForNavigation() 
*/

  await page.screenshot({ path: 'screenshots/loggedinpage.png' });

  // Listen for site export json
  await page.setRequestInterception(true);
  let counter = 0;
  page.on('request', interceptedRequest => {
    if (interceptedRequest.url().startsWith('https://s3.amazonaws.com/webflow-tmp-site-export-production/site-exports/') && interceptedRequest.url().endsWith('.json'))
      { 
      const SITEEXPORT = interceptedRequest.url();
      console.log('counter',counter)
      if (counter > 0)
      {
      console.log(SITEEXPORT);
      request(SITEEXPORT, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

     // write the site json to the filesystem
     fs.writeFile('site.json', body, function(err, body){
         if (err) console.log(err);
           console.log("Successfully Written to File.");
           process.exit()
          });
      });
      // browser.close()
      // process.exit()
     }
      interceptedRequest.continue();
      counter += 1;
      

}


    else
      { 
        interceptedRequest.continue(); }
  });
  console.log('listening for export json...')

  // Export
  await page.setViewport({width:1366,height:768});
  await page.waitFor(70000);
  console.log('looking for export button...')
  await page.waitForSelector(EXPORT_BUTTON_, {timeout:60000});
  await page.click(EXPORT_BUTTON_);
  await page.waitFor(100000);
  await page.waitForNavigation(); 
  await page.screenshot({ path: 'screenshots/exportview.png' });


/*  console.log('looking for zip button...')
  page.waitForSelector(ZIP_BUTTON_, {timeout:100000});
  await page.click(ZIP_BUTTON_);
  await page.screenshot({ path: 'screenshots/zipbutton.png' });
*/

//  await page.screenshot({ path: 'screenshots/export.png' });
  await page.waitFor(100000);
  
  
  browser.close();
}

run();
