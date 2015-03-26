var config = {
  "url": {
    0: "://alpha.wallhaven.cc/random?",
    1: "://alpha.wallhaven.cc/search?"
  },
  "previewUrlPattern": /\.cc\/wallpaper\/([0-9]*)/,
  "default": {
    "wallpaperOptions": {
      "wallpaperBlur": "5",
      "wallpaperOpacity": "40"
    },
    "search": {
      "searchType": "1"
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
    var searchType = parseInt(storage.searchType);
    var paramKeys  = Object.keys(config.default.query);
    var params     = '';

    // TODO: switch case search type
    switch(searchType) {
      case 0:
      // Random
        break;
      case 1:
      params = $.param(slice(storage, paramKeys))
      // With keyword
        break;
       case 2:
      // Specific
        break; 
    }

    var url        = 'file:///D:/jmImages/[HorribleSubs]%20Assassination%20Classroom%20-%2010%20[1080p].mkv_snapshot_13.40_[2015.03.23_00.16.15].jpg'//secureUrl + config.url[searchType] + params;
    //callback && callback.call(this, url); 
    //file:///D:/jmImages/[HorribleSubs]%20Assassination%20Classroom%20-%2010%20[1080p].mkv_snapshot_13.40_[2015.03.23_00.16.15].jpg

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

function Wallpaper(id) {
  this.url = "http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-"+ id +".jpg"
}

function getWallpapers(secure, options) {
  var options = options || {}
  var secure = secure || false;
  wallpapersUrl(secure, function(url) {
    // TODO: Check if local file
    console.log('ige')
    $.ajax({
      url: url,
      type: "GET",
      success: function(response) {
        var wallpapers = $(response).find('.preview').map(function(){
            return (new Wallpaper(getWallpaperId(this.href, 'preview')));
          }).get()
        console.log('hello',wallpapers)
        storageSet({"wallpapers": wallpapers}, function() {
          options.success && options.success.call(this);
        })
      },
      complete: function() {
        options.complete && options.complete.call(this);
      }
    })
  })
}