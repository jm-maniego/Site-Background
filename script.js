function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

storageGet(function(storage){
  var wallpapers       = storage.wallpapers;
  var wallpaperBlur    = storage.wallpaperBlur;
  var wallpaperOpacity = storage.wallpaperOpacity;
  var random_index     = getRandomInt(0, wallpapers.length-1)
  var url              = wallpapers[random_index].url
  var display          = {1: "", 0: "none"}[storage.set_bg];

  var div = $('<div id="sitebg-extension">').css({
    "width": "100%",
    "height": "100%",
    "background": "url("+ url +") fixed ",
    "background-size": "cover",
    "-webkit-filter": "blur("+ wallpaperBlur +"px)",
    "-webkit-transform": "translateZ(0)",
    "position": "fixed",
    "background-color": "white",
    "top": "0",
    "bottom": "0",
    "left": "0",
    "right": "0",
    "opacity": (wallpaperOpacity/100).toString(),
    "pointer-events": "none",
    "display": display
  });
  $('body').prepend(div);
})

chrome.runtime.onMessage.addListener(function(message) {
  var $background = $("#sitebg-extension");
  storageGet(function(storage){
    var wallpapers       = storage.wallpapers;
    var wallpaperBlur    = storage.wallpaperBlur;
    var wallpaperOpacity = storage.wallpaperOpacity;
    var display          = {1: "", 0: "none"}[storage.set_bg];
    $background.css({
      "-webkit-filter": "blur("+ wallpaperBlur +"px)",
      "opacity": (wallpaperOpacity/100).toString(),
      "display": display
    })
  });
})
