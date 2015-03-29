var config = {
  "url": {
    0: "://alpha.wallhaven.cc/search?",
    1: "://alpha.wallhaven.cc/random?"
  },
  "previewUrlPattern": /\.cc\/wallpaper\/([0-9]*)/,
  "default": {
    "wallpaperOptions": {
      "wallpaperBlur": "5",
      "wallpaperOpacity": "40"
    },
    "search": {
      "searchType": "1",
      "withParameters": "1",
      "image_from": "1"
    },
    "set_bg": {
      "set_bg": "1"
    },
    "query": {
      "q": "kitten",
      "categories": "100",
      "purity": "110",
      "page": 1
    }
  },
  "wallpaperOptions": {
    "max": 100,
    "min": 0,
    "maxLength": 3,
    "numOnly": true
  },
  "setToDefault": function setToDefault(key, callback) {
    var defaults = config.default[key];
    console.log(setToDefault.caller , key, defaults);
    chrome.storage.sync.set(defaults, function() {
      callback && callback.call(this);
    });
  }
}

function storageGet(callback) {
  console.log("Getting storage...")
  chrome.storage.sync.get(callback);
}

function storageSet(key, value) {
  if (typeof key == 'object') {
    chrome.storage.sync.set(key, function() {
      value && value.call(this);
    });
  } else {
    var obj  = {}
    obj[key] = value
    chrome.storage.sync.set(obj);
  }
}

function wallpapersUrl(secure, callback) {
  var protocol  = "http"
  var secureUrl = protocol + {true: "s", false: ''}[secure || false]
  storageGet(function(storage) {
    var image_from_int = parseInt(storage.image_from);
    var specifiedUrl,
        searchType,
        withParameters,
        paramKeys,
        params;

    switch (image_from_int) {
      case 0:
        // From File or Url
        // Check if file:/// or http:///
        // Convert to data url if file; else leave it alone LOL
        //specifiedUrl = storage.specifiedUrl
        break;
      case 1:
        // From Wallhaven
        searchType     = parseInt(storage.searchType);
        console.log(searchType);
        withParameters = parseInt(storage.withParameters);
        paramKeys      = Object.keys(config.default.query);
        params         = withParameters ? $.param(slice(storage, paramKeys)) : "";
        url = (secureUrl + config.url[searchType] + params);
        break;
    }


    callback && callback.call(this, url);
  })
}

function slice(obj, keys) {
  var returnObj = {};
  var key;
  for (var index in keys) {
    key            = keys[index];
    returnObj[key] = obj[key];
  }
  return returnObj;
}

var numOnlyPattern        = /[^0-9]/
var startsWithZeroPattern = /^0(.*)/


function getWallpaperId(url, from) {
  return url.match({'preview': config.previewUrlPattern}[from])[1]
}

function Wallpaper(id, image_from_int) {
  image_from_int = typeof image_from_int == 'undefined' ? 1 : image_from_int
  switch (image_from_int) {
    case 0:
      this.url = id // actually, url LOL
      break;
    case 1:
      this.url = "http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-"+ id +".jpg"
      break;
  }
}

function getWallpapers(secure, options) {
  console.log("Getting Wallpapers")
  var options = options || {}
  var secure = secure || false;
  var files = options.files || [];
  var file, wallpapers = []
  storageGet(function(storage) {
    var image_from_int = parseInt(storage.image_from);
    switch (image_from_int) {
      case 0:
        storageSet({"wallpapers": files}, function() {
          options.success && options.success.call(this)
        })
        break;
      case 1:
        // From Wallhaven
        console.log("Fetching images from wallhaven...")
        wallpapersUrl(secure, function(url) {
          $.ajax({
            url: url,
            type: "GET",
            success: function(response) {
              wallpapers = $(response).find('.preview').map(function(){
                  return (new Wallpaper(getWallpaperId(this.href, 'preview')));
                }).get()
              storageSet({"wallpapers": wallpapers}, function() {
                options.success && options.success.call(this);
              })
            },
            complete: function() {
              console.log("Fetching images complete.")
              options.complete && options.complete.call(this);
            }
          })
        })
        break;
    }
  })
}

function fileDataUrl(file, callback) {
  console.log("Converting file to data url...")
  var fileReader = new FileReader;
  fileReader.addEventListener('load', function(e) {
    console.log("Converting " + file.name + "...");
    callback && callback(this, e.target)
  })
  fileReader.readAsDataURL(file)
}