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
    "set_bg": "1",
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
  "setToDefault": function(key, callback) {
    var defaults = config.default[key];
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
    var obj = {}
    obj[key] = value
    chrome.storage.sync.set(obj);
  }
}

function wallpapersUrl(secure, callback) {
  var protocol = "http"
  var secureUrl = protocol + {true: "s", false: ''}[secure || false]
  storageGet(function(storage) {
    var searchType = parseInt(storage.searchType);
    var paramKeys = Object.keys(config.default.query);
    var params = $.param(slice(storage, paramKeys))
    var url = secureUrl + config.url[searchType] + params;
    callback && callback.call(this, url);
  })
}

function slice(obj, keys) {
  var returnObj = {};
  var key;
  for (var index in keys) {
    key = keys[index];
    returnObj[key] = obj[key];
  }
  return returnObj;
}

var numOnlyPattern = /[^0-9]/
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
    $.ajax({
      url: url,
      type: "GET",
      success: function(response) {
        var wallpapers = $(response).find('.preview').map(function(){
            return (new Wallpaper(getWallpaperId(this.href, 'preview')));
          }).get()
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