const fs = require('fs');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const request = require('request');
path = require('path');

let obj;
// implement .format() method for string like in Python
// got this from https://stackoverflow.com/a/4974690
String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

function writeFile(file_location, content) {
              mkdirp(getDirName(file_location), function (err) {
                  if (err) return err;
                   fs.writeFile(file_location, content, 
                     function(err, content){
                       if (err) console.log(err);
                        console.log("Successfully Written to File.");
                      });
                });
            }


// Begin processing of the json file
fs.readFile('site.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);

  // grab all the images and add to the images folder
  const assets = obj.pages[0].renderData.assets
  Object.keys(assets).map(
    key => 
           request(assets[key].cdnUrl, {encoding: null}, function (error, response, body) {
              console.log('error:', error); // Print the error if one occurred
              console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
              const filename = path.basename(assets[key].cdnUrl).replace('%20',' ');
              const file_location = 'public/images/{}'.format(filename);
              writeFile(file_location, body);
            })
            );

  // replace webflow hosted image paths with relative images
  const result = obj.pages[0].html;
  const content = result.replace(/https\:\/\/uploads-ssl\.webflow\.com\/\w+\//g, "images/");

  file_location = 'public/index.html'
  writeFile(file_location, content);

  // write the css
  // replace webflow hosted image paths with relative images in css
  const site_css = obj.css;
  const fixed_css = site_css.replace(/http\:\/\/undefined\/\w+\//g, "../images/");
  writeFile("public/css/{}".format(obj.cssFileName), fixed_css);
  writeFile("public/css/normalize.css", obj.cssNormalize); 

  // write the js
  writeFile("public/js/{}".format(obj.siteJsFileName), obj.siteJs);
  });
