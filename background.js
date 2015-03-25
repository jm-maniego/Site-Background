function init() {
  storageGet(function(storage) {
    if (!storage.wallpaperBlur || !storage.wallpaperOpacity) {
      config.setToDefault("wallpaperOptions");
    }
    if (!storage.q || !storage.categories || !storage.purity) {
      config.setToDefault("query");
    }
    if (!storage.search) {
      config.setToDefault('search');
    }
    if (!storage.set_bg) {
      config.setToDefault('set_bg');
    }
  })
}

chrome.tabs.onCreated.addListener(function(tab) {
  if (!tab.url.match(/^chrome\:\/\/[^newtab]/)) {
    var secure = !!tab.url.match(/^https\:\/\//);
    getWallpapers(secure);
  }
});

init();