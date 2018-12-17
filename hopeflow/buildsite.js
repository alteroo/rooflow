const fs = require('fs');
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
              const filename = path.basename(assets[key].cdnUrl).replace('%20',' ')
              fs.writeFile('public/images/{}'.format(filename), body, function(err, body){
                if (err) console.log(err);
                  console.log("Successfully Written to File.");
                });
            }));

  // replace webflow hosted image paths with relative images
  const result = obj.pages[0].html;
  const replace = result.replace(/https\:\/\/uploads-ssl\.webflow\.com\/\w+\//g, "images/");
  fs.writeFile("public/index.html", replace, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
   }); 

  // write the css
  // replace webflow hosted image paths with relative images in css
  const site_css = obj.css;
  const fixed_css = site_css.replace(/http\:\/\/undefined\/\w+\//g, "../images/");

  fs.writeFile("public/css/{}".format(obj.cssFileName), fixed_css, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
   }); 
  fs.writeFile("public/css/normalize.css", obj.cssNormalize, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
   }); 

  // write the js
  fs.writeFile("public/js/{}".format(obj.siteJsFileName), obj.siteJs, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
   }); 
});
