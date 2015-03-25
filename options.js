var convertObj = {true: 1, false: 0};
var changed = 0;
var addRemove = {false: 'attr', true:'removeAttr'}

function CustomForm($form) {
  this.$form = $form
};

CustomForm.prototype.serialize = function() {
  var $radioButtons = this.$form.find('div.radio[data-type=input][selected]');
  var $checkboxButtons = this.$form.find('div.checkbox[data-type=input]');
  var $textareas = this.$form.find('textarea[data-type=input]');
  var returnObj = {}
  var key;
  var $el;

  $radioButtons.each(function(i, el) {
    $el = $(el);
    key = $el.attr('name');
    val = $el.attr('data-value');
    returnObj[key] = val
  });
  $checkboxButtons.each(function(i, el) {
    $el = $(el);
    key = $el.attr('name');
    val = convertObj[!!$el.attr('selected')].toString();
    returnObj[key] = (returnObj[key] || '') + val;
  });
  $textareas.each(function(i, el) {
    $el = $(el);
    key = $el.attr('name');
    returnObj[key] = $el.get(0).value;
  });

  return returnObj
}

function init() {
  var $categories = $('div[name=categories]');
  var $purity     = $('div[name=purity]');

  storageGet(function(storage) {
    var searchType = parseInt(storage.searchType || config.default.searchType);
    var searchKeyword = storage.q;
    var categories = (storage.categories || config.default.query.categories).toString();
    var purity = (storage.purity || config.default.query.purity).toString();

    $('div[name=searchType]').find('.radio[data-value='+ searchType +']').select()

    $categories.each(function(i) {
      $(this).check(!!parseInt(categories[i]))
    });

    $purity.each(function(i) {
      $(this).check(!!parseInt(purity[i]))
    });

    $('#search-keyword').get(0).value = searchKeyword;

    $('#search-keyword').prop('disabled', searchType !== 1);
    $("#save").attr('disabled', '')
  })
}

$(function() {
  var $form = new CustomForm($('.form'))
  var $searchKeyword = $('#search-keyword');
  var $save = $('#save');
  var $loader = $('#loader');
  var $container = $('.container');

  $('.checkbox').checkbox()
  $('.radio-group').radioGroup()

  $(".form").on('change', function(e) {
    $save.removeAttr('disabled');
  })

  $save.click(function() {
    $container.addClass('overlay');
    storageSet($form.serialize(), function() {
      $loader.show();
      $save.attr('disabled', '');
      getWallpapers(false, {
        complete: function() {
          $container.removeClass('overlay')
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
    }
  })

  $('#set-to-default').click(function() {
    $container.addClass('overlay');
    config.setToDefault('query', function() {
      $loader.show();
      config.setToDefault('search', function() {
        init();
        getWallpapers(false, {
          complete: function() {
            $container.removeClass('overlay')
            $loader.hide();
          }
        });
      });
    });
  })
  init();

  $('div[name=searchType]').on('change', function(e) {
    var value = parseInt($(this).radioGroup('value'))
    var isKeywordOption = $('#radio-keyword').isSelected();
    $searchKeyword.prop('disabled', !isKeywordOption);
    var enabledForKeyword = $('*[data-enabled-for=radio-keyword]')
    enabledForKeyword.find('*[data-type=input]')[addRemove[isKeywordOption]]('disabled', '');
    enabledForKeyword.find('label[for]')[addRemove[isKeywordOption]]('disabled', '');
    if (isKeywordOption) {
      $searchKeyword.focus();
    }
  });

  $searchKeyword.keyup(function(e) {
    if (e.which !== 13) {
      $(this).trigger('change');
    }
  })

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
      $(el).attr('data-value', index);
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