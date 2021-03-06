 /**
 * jquery.mask.js
 * @author: igorescobar
 * @version: 0.3.0
 *
 * Created by Igor Escobar on 2012-03-10. Please report any bug at http://blog.igorescobar.com
 *
 * Copyright (c) 2012 Igor Escobar http://blog.igorescobar.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function ($){
  "use strict";

  var byPassKeys = [8,9,37,38,39,40],
    specialChars = {':': 191, '-': 189, '.': 190, '(': 57, ')': 48, '/': 191, ',': 188, '_': 189, ' ': 32, '+': 187},
    e, m, fieldObject, oValue, oNewValue, oCleanedValue, keyCode, keyPressedString, pMask;

  $.fn.mask = function (Mask, options) {
    options = options || {};

    $(this).attr('maxlength', Mask.length);
    $(this).die('keyup.jquerymask');
    $(this).live('keyup.jquerymask', function(e){
      e = e || window.event;
      keyCode = e.keyCode || e.which;

      if ($.inArray(keyCode, byPassKeys) >= 0) return true;

      oCleanedValue = $(this).val().replace(/\W/g, '');

      pMask = (typeof options.reverse == "boolean" && options.reverse === true) ?
      getProportionalReverseMask(oCleanedValue, Mask) :
      getProportionalMask(oCleanedValue, Mask);

      oNewValue = applyMask(e, $(this), pMask, options);

      seekCallbacks(e, options, oNewValue, Mask);

      if (oNewValue !== $(this).val())
        $(this).val(oNewValue);

    }).trigger('keyup');
  };

  var applyMask = function (e, fieldObject, Mask, options) {

    oValue = fieldObject.val().replace(/\W/g, '').substring(0, Mask.replace(/\W/g, '').length);

    return oValue.replace(new RegExp(maskToRegex(Mask)), function () {
      var total_arguments = arguments.length;

      delete arguments[0];
      delete arguments[total_arguments-1];
      delete arguments[total_arguments-2];

      var oNewValue = '';
      for (var i in arguments) {
        if (typeof arguments[i] == "undefined" || arguments[i] === ""){
          arguments[i] = Mask[i-1];
        }

        oNewValue += arguments[i];
      }

      return cleanBullShit(oNewValue, Mask);
    });
  };

  var getProportionalMask = function (oValue, Mask) {
    var endMask = 0, m = 0;

    while (m <= oValue.length-1){
      while(typeof specialChars[Mask.charAt(endMask)] === "number")
        endMask++;
      endMask++;
      m++;
    }

    return Mask.substring(0, endMask);
  };

  var getProportionalReverseMask = function (oValue, Mask) {
    var startMask = 0, endMask = 0, m = 0;
    startMask = (Mask.length >= 1) ? Mask.length : Mask.length-1;
    endMask = startMask;

    while (m <= oValue.length-1) {
      while (typeof specialChars[Mask.charAt(endMask-1)] === "number")
        endMask--;
      endMask--;
      m++;
    }

    endMask = (Mask.length >= 1) ? endMask : endMask-1;
    return Mask.substring(startMask, endMask);
  };

  var maskToRegex = function (mask) {
    var translation = { 0: '(.)', 1: '(.)', 2: '(.)', 3: '(.)', 4: '(.)', 5: '(.)', 6: '(.)', 7: '(.)',
      8: '(.)', 9: '(.)', 'A': '(.)', 'S': '(.)',':': '(:)?', '-': '(-)?', '.': '(\\\.)?', '(': '(\\()?',
      ')': '(\\))?', '/': '(/)?', ',': '(,)?', '_': '(_)?', ' ': '(\\s)?', '+': '(\\\+)?'};

    var regex = '';
    for (var i = 0; i < mask.length; i ++){
      if (translation[mask[i]])
        regex += translation[mask[i]];
    }

    return regex;
  };

  var validDigit = function (nowMask, nowDigit) {
    if (isNaN(parseInt(nowMask, 10)) === false && /\d/.test(nowDigit) === false) {
      return false;
    } else if (nowMask === 'A' && /[a-zA-Z0-9]/.test(nowDigit) === false) {
      return false;
    } else if (nowMask === 'S' && /[a-zA-Z]/.test(nowDigit) === false) {
      return false;
    } else if (typeof specialChars[nowDigit] === "number" && nowMask !== nowDigit) {
      return false;
    }
    return true;
  };

  var cleanBullShit = function (oNewValue, Mask) {
    oNewValue = oNewValue.split('');
    for(var i = 0; i < Mask.length; i++){
      if(validDigit(Mask.charAt(i), oNewValue[i]) === false)
        oNewValue[i] = '';
    }
    return oNewValue.join('');
  };

  var seekCallbacks = function (e, options, oNewValue, Mask) {
    if (options.onKeyPress && e.isTrigger === undefined && typeof options.onKeyPress == "function") {
      options.onKeyPress(oNewValue, e, keyCode);
    }

    if (options.onComplete && e.isTrigger === undefined &&
        oNewValue.length === Mask.length && typeof options.onComplete == "function") {
      options.onComplete(oNewValue);
    }
  };
})(jQuery);