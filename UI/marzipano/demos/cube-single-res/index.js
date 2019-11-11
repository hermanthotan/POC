/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Create viewer.
var viewer = new Marzipano.Viewer(document.getElementById('pano1'));
// var viewer2 = new Marzipano.Viewer(document.getElementById('pano2'));

// Create source.
var imgUrls = new Array();
imgUrls.push("http://www.marzipano.net/media/cubemap/f.jpg");
imgUrls.push("http://www.marzipano.net/media/cubemap/b.jpg");

var sources = new Array();
imgUrls.forEach((url) => {
  sources.push(Marzipano.ImageUrlSource.fromString(url));
});

// Create geometry. for the cube box geometry
// var geometry = new Marzipano.CubeGeometry([{ tileSize: 1024, size: 1024 }]);

// Create geometry. for the single view image
var geometry = new Marzipano.FlatGeometry([
  { width: 1024, height: 1024, tileWidth: 1024, tileHeight: 1024 }
])

// Create view. for the cube view 360 view
// var limiter = Marzipano.RectilinearView.limit.traditional(4096, 100 * Math.PI/180);
// var view = new Marzipano.RectilinearView(null, limiter);

// Create View. this is for the single view image
var limiter = Marzipano.util.compose(
  Marzipano.FlatView.limit.resolution(1024),
  Marzipano.FlatView.limit.letterbox()
);
var view = new Marzipano.FlatView({ mediaAspectRatio: 1024/1024}, limiter)

// Create scene.
var scene = viewer.createScene({
  source: sources[0],
  geometry: geometry,
  view: view,
  pinFirstLevel: true
});

scene.switchTo({
  transitionDuration: 100,
  transitionUpdate: transitionFunctions["throughBlack"]
})


// var scene2 = viewer2.createScene({
//   source: sources[0],
//   geometry: geometry,
//   view: view,
//   pinFirstLevel: true
// });

// scene2.switchTo({
//   transitionDuration: 100,
//   transitionUpdate: transitionFunctions["throughBlack"]
// })

var i = 0;
var timeLapsePause = true;
var timeLapse = setInterval(function() {
  if (!timeLapsePause) 
  {
    i++;
    var mod = i % sources.length;
  
    console.log(mod);
    var scene = viewer.createScene({
      source: sources[mod],
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });
  
    scene.switchTo({
      transitionDuration: 100,
      transitionUpdate: transitionFunctions["throughBlack"]
    });
  }
}, 1000);


function timelapse_clicked() {
  console.log('timelapse button click');
  timeLapsePause = timeLapsePause ? false : true;
}

function comparison_clicked() {
  console.log('comparison button click');
  $('#leftcontroller').hide();
}

function fileNameFromUrl(url)
{
  return url.substring(url.lastIndexOf('/') + 1, url.length);
}

function imagedownload_clicked() {
  console.log('imagedownload button click');

  var zip = new JSZip;

  var count = 0;
  var zipFileName = "file.zip";

  imgUrls.forEach(function(uri) {
    JSZipUtils.getBinaryContent(uri, function(err, data) {
      console.log("Uri: " + uri);
      var fileName = fileNameFromUrl(uri);
      console.log("File Name: " + fileName);
      if (err) {
        console.error(err);
      }

      zip.file(fileName, data,  {binary:true});
      count++;
      
      if (count === imgUrls.length)
      {
        zip.generateAsync({ type: "blob"}).then(function(content) {
          saveAs(content, zipFileName);
        });
      }
    })
  });
}