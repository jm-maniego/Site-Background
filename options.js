var convertObj = {true: 1, false: 0};
var changed    = 0;
var addRemove  = {false: 'attr', true:'removeAttr'}

function CustomForm($form) {
  this.$form = $form
};

CustomForm.prototype.serialize = function() {
  var $radioButtons    = this.$form.find('div.radio[data-type=input][selected]:not([disabled])');
  var $checkboxButtons = this.$form.find('div.checkbox[data-type=input]:not([disabled])');
  var $textareas       = this.$form.find('textarea[data-type=input]:not([disabled])');
  var $inputTexts      = this.$form.find('input[type=text]:not([disabled])')
  var $fileInputs      = this.$form.find('input[type=file]:not([disabled])');
  var returnObj        = {}
  var key;
  var $el;
  var selected;

  $radioButtons.each(function(i, el) {
    $el = $(el);
    key = $el.attr('name');
    val = $el.attr('data-value');
    returnObj[key] = val
  });
  $checkboxButtons.each(function(i, el) {
    $el = $(el);
    selected = !!$el.attr('selected');
    key = $el.attr('name');
    val = convertObj[selected].toString();

    returnObj[key] = (returnObj[key] || '') + val;
  });
  $inputTexts.each(function(i, el) {
    $el = $(el);
    key = $el.attr('name');
    returnObj[key] = $el.get(0).value;
  })
  $textareas.each(function(i, el) {
    $el = $(el);
    key = $el.attr('name');
    returnObj[key] = $el.get(0).value;
  });
  $fileInputs.each(function(i, el) {
    $el = $(el);
    key = $el.attr('name');
    val = $el.data('value');
    returnObj[key] = val;
  })

  return returnObj
}

function init() {
  var $categories = $('div[name=categories]');
  var $purity     = $('div[name=purity]');

  storageGet(function(storage) {
    var searchType    = parseInt(storage.searchType || config.default.search.searchType);
    var searchKeyword = storage.q;
    var image_from    = parseInt(storage.image_from || config.default.image_from.image_from);
    var withParameters= parseInt(storage.withParameters || config.default.search.withParameters);
    var categories    = (storage.categories || config.default.query.categories).toString();
    var purity        = (storage.purity || config.default.query.purity).toString();
    var specifiedUrl  = (storage.specifiedUrl || "");
    $('div[name=image_from]').find('.radio[data-value='+ image_from +']').select()

    $categories.each(function(i) {
      $(this).check(!!parseInt(categories[i]))
    });

    $purity.each(function(i) {
      $(this).check(!!parseInt(purity[i]))
    });

    $('#checkbox-random').check(searchType == 1)
    $('#checkbox-withParameters').check(!!withParameters)

    $('#search-keyword').get(0).value = searchKeyword;
    $('#specifiedUrl').val(specifiedUrl)
    //$('#search-keyword').prop('disabled', searchType !== 1);
    $("#save").attr('disabled', '')
  })
}

$(function() {
  $form          = new CustomForm($('.form'))
  var $searchKeyword = $('#search-keyword');
  var $save          = $('#save');
  var $loader        = $('#loader');
  var $container     = $('.container');
  var $body          = $('body');
  var $radioWallhaven      = $("#radio-wallhaven");
  var $radioSpecific       = $("#radio-specific");
  var $radioFile           = $("#radio-file");
  var $enabledForWallhaven = $('*[data-enabled-for=radio-wallhaven]');
  var $enabledForWithParams= $('*[data-enabled-for=checkbox-withParameters]');
  var $enabledForSpecific  = $('*[data-enabled-for=radio-specific]');
  var $enabledForFile      = $('*[data-enabled-for=radio-file]');

  $('.checkbox').checkbox()
  $('.radio-group').radioGroup()

  $(".form").on('change', function(e) {
    $save.removeAttr('disabled');
  })

  $save.click(function() {
    $body.addClass('overlay');
    storageSet($form.serialize(), function() {
      $loader.show();
      $save.attr('disabled', '');
      getWallpapers(false, {
        files: [],
        complete: function() {
          $body.removeClass('overlay')
          $loader.hide();
        }
      });
    });
  })

  $('#cancel').click(function(e) {
    e.stopImmediatePropagation();
    window.location.reload();
  })

  $('*[data-type=input]').keydown(function(e) {
    if (e.which == 13) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!$save.attr('disabled')) {
        $save.trigger('click')
      }
    } else {
      $(this).trigger('change');
    }
  })

  $('#set-to-default').click(function() {
    if (confirm($(this).data('confirm'))) {
      $body.addClass('overlay');
      config.setToDefault('query', function() {
        $loader.show();
        config.setToDefault('search', function() {
          init();
          getWallpapers(false, {
           complete: function() {
              $body.removeClass('overlay')
              $loader.hide();
            }
          });
        });
      });
    }
  })

  $('#imageFile').on("change", function(e) {
    console.log("Input file changed.")
    var $imageResults = $('#image-results');
    var $this = $(this);
    var files = new CustomFile(e.target.files);

    $imageResults.empty();

    files.toDataUrl({
      converted: function(fileReader) {
        result = fileReader.result;

        $imageResults.append($("<img>", {
          src: result,
          class: "imageFile"
        }))
      },
      complete: function(dataUrls) {
        $this.data('value', dataUrls);
        alert("Conversion complete!")
      }
    })
  })
  init();

  $('#imageFrom').on("change", function() {
    var $this                = $(this);
    var wallhavenSelected    = $radioWallhaven.isSelected();
    var specificSelected     = $radioSpecific.isSelected();
    var fileSelected         = $radioFile.isSelected();

    $enabledForWallhaven.find('*[data-type=input]')[addRemove[wallhavenSelected]]('disabled', '');
    $enabledForWallhaven.find('label[for]')[addRemove[wallhavenSelected]]('disabled', '');
    $enabledForSpecific[addRemove[specificSelected]]('disabled', '');
    // $enabledForFile[addRemove[fileSelected]]('disabled', '');
  })

  $('div[name=withParameters]').on('change', function(e) {
    var $this = $(this);
    var $this_selected = !!$(this).attr('selected');
    var wallhavenSelected = $radioWallhaven.isSelected();
    //value               = parseInt($(this).radioGroup('value'))
    //var isKeywordOption     = $('#radio-specific').isSelected();
    //$enabledForWallhaven = $('*[data-enabled-for=radio-wallhaven]')
    //$enabledForWithParams = $('*[data-enabled-for=checkbox-withParameters]')

    //$searchKeyword.prop('disabled', !isKeywordOption);
    $enabledForWithParams.find('*[data-type=input]')[addRemove[wallhavenSelected && $this_selected]]('disabled', '');
    $enabledForWithParams.find('label[for]')[addRemove[wallhavenSelected && $this_selected]]('disabled', '');
    //if (isKeywordOption) {
    //  $searchKeyword.focus();
    //}


  });

  $('label').click(function() {
    $("#"+$(this).attr('for')).trigger("click");
  })
})

$.fn.checkbox = function() {
  $(this).click(function() {
    $(this).check();
  });
}

$.fn.radioGroup = function(key) {
  var $thisGroup = $(this);
  if (key) {
    var $selected = $(this).find('.radio[selected=selected]')
    return $selected.attr('data-'+key);
  } else {
    var $radioButtons = $(this).find('.radio')
    $radioButtons.each(function(index, el) {
      $(el).attr('data-value', $(el).attr('data-value') || index);
    });
    $radioButtons.click(function(e) {
      $(e.target).select();
    });
  };
  return $(this);
}

$.fn.deselect = function() {
  $(this).css({
      "background-position-x": "0"
    })
    .removeAttr('selected');
}

$.fn.select = function() {
  $(this).parents('div[data-type=radiogroup]').find('.radio[data-type=input]').deselect();
  $(this).css({
      "background-position-x": "-26px"
    })
    .attr("selected", '')
    .trigger('change', $(this).attr('data-value'))
}

$.fn.check = function(bool) {
  var currentVal = !!$(this).attr('selected');
  var newVal = typeof bool == 'undefined' ? !currentVal : bool;
  var backgroundPosition = {true: "0", false: "-26px"}[newVal];
  $(this).css({
      "background-position-x": backgroundPosition
    });
  if (newVal) {
    $(this).attr('selected', '');
  } else {
    $(this).removeAttr('selected');
  };
  $(this).trigger('change', newVal);
}

$.fn.isSelected = function() {
  return !!$(this).attr('selected');
}

function getCheckboxValue(checkbox) {
  return checkbox.map(function(){
    return convertObj[!!$(this).attr('selected')];
  }).get().join('')
}