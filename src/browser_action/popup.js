$(function() {
  storageGet(function(storage) {
    var $wallpaperBlurSlider    = $("#wallpaperBlur-slider");
    var $wallpaperOpacitySlider = $("#wallpaperOpacity-slider");
    var $wallpaperBlurValue     = $("#wallpaperBlur-value");
    var $wallpaperOpacityValue  = $("#wallpaperOpacity-value");
    var $wallpaperBlurRange     = $("#wallpaperBlur-range");
    var $wallpaperOpacityRange  = $("#wallpaperOpacity-range");
    var $this;
    var $thisText;
    var $slider;
    var max;
    var maxLength;
    var startsWithZero;
    var rangeText = "( "+ config.wallpaperOptions.min + " - " + config.wallpaperOptions.max +" )";

    $wallpaperBlurRange.text(rangeText);
    $wallpaperOpacityRange.text(rangeText);

    $wallpaperBlurSlider.slider({
      animate: "fast",
      change: function(event, ui) {
        chrome.storage.sync.set({wallpaperBlur: ui.value});
      },
      slide: function(event, ui) {
        $wallpaperBlurValue.get(0).value = ui.value;
      },
      value: storage.wallpaperBlur
    });

    $wallpaperOpacitySlider.slider({
      animate: "fast",
      change: function(event, ui) {
        chrome.storage.sync.set({wallpaperOpacity: ui.value});
      },
      slide: function(event, ui) {
        $wallpaperOpacityValue.get(0).value = ui.value;
      },
      value: storage.wallpaperOpacity
    });

       $wallpaperBlurValue.text(storage.wallpaperBlur);
    $wallpaperOpacityValue.text(storage.wallpaperOpacity);

    $('.slider-value').change(function() {
      this.value = this.value.substr(0, 3);
    })
    .keyup(function(e) {
      $this     = $(this).get(0);
      $thisText = $this.value;
      max       = config.wallpaperOptions.max
      min       = config.wallpaperOptions.min
      maxLength = max.toString().length;
      startsWithZero = $thisText.match(startsWithZeroPattern);
      $slider   = $(this).parents('.row').next().children();

      if ($thisText.match(numOnlyPattern) || $thisText.length > maxLength) {
        console.log(numOnlyPattern);
        $this.value = $thisText.replace(numOnlyPattern, '');
      };
      if (parseInt($thisText) > max) {
        $this.value = max;
      };

      if (startsWithZero) {
        if (startsWithZero[1]) {
          $this.value = startsWithZero[1];
        }
      }
      if (!$thisText) {
        $this.value = min;
      };
      $slider.slider('value', $thisText);
    });

    $('#optionsBtn').click(function() {
      chrome.tabs.create({
        url: "options.html"
      })
    });

    $(".on-off").attr('data-value', storage.set_bg);

    $(".on-off").click(function() {
      var $this = $(this);
      var currentVal = parseInt($this.attr('data-value'));
      var newVal = [1,0][currentVal].toString();
      $this.attr('data-value', newVal);
      storageSet('set_bg', newVal);
    })
  });
});

chrome.storage.onChanged.addListener(function(changes) {
  console.log(changes);
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, changes);
  });
})