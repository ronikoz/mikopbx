"use strict";

/*
 * MikoPBX - free phone system for small business
 * Copyright (C) 2017-2020 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/* global globalRootUrl, globalWebAdminLanguage, sessionStorage, $, globalTranslate */
var advicesWorker = {
  timeOut: 300000,
  timeOutHandle: '',
  $advices: $('#advices'),
  $advicesBellButton: $('#show-advices-button'),
  initialize: function initialize() {
    advicesWorker.showPreviousAdvice(); // Запустим получение новых советов

    advicesWorker.restartWorker();
    window.addEventListener('ConfigDataChanged', advicesWorker.cbOnDataChanged);
  },
  restartWorker: function restartWorker() {
    window.clearTimeout(advicesWorker.timeoutHandle);
    advicesWorker.worker();
  },

  /**
   * Обработка события смены языка или данных
   */
  cbOnDataChanged: function cbOnDataChanged() {
    sessionStorage.removeItem("previousAdvice".concat(globalWebAdminLanguage));
    sessionStorage.removeItem("previousAdviceBell".concat(globalWebAdminLanguage));
    setTimeout(advicesWorker.restartWorker, 3000);
  },

  /**
   * Показывает старые советы до получения обвноления со станции
   */
  showPreviousAdvice: function showPreviousAdvice() {
    var previousAdviceBell = sessionStorage.getItem("previousAdviceBell".concat(globalWebAdminLanguage));

    if (previousAdviceBell !== undefined) {
      advicesWorker.$advicesBellButton.html(previousAdviceBell);
    }

    var previousAdvice = sessionStorage.getItem("previousAdvice".concat(globalWebAdminLanguage));

    if (previousAdvice !== undefined) {
      advicesWorker.$advices.html(previousAdvice);
    }
  },
  worker: function worker() {
    PbxApi.AdvicesGetList(advicesWorker.cbAfterResponse);
  },
  cbAfterResponse: function cbAfterResponse(response) {
    if (response === false) {
      return;
    }

    advicesWorker.$advices.html('');

    if (response.advices !== undefined) {
      var htmlMessages = '';
      var countMessages = 0;
      var iconBellClass = '';
      htmlMessages += '<div class="ui relaxed divided list">';

      if (response.advices.needUpdate !== undefined && response.advices.needUpdate.length > 0) {
        $(window).trigger('SecurityWarning', [response.advices]);
      }

      if (response.advices.error !== undefined && response.advices.error.length > 0) {
        $.each(response.advices.error, function (key, value) {
          htmlMessages += '<div class="item">';
          htmlMessages += '<i class="frown outline red icon"></i>';
          htmlMessages += '<div class="content">';
          htmlMessages += "<div class=\"ui small red header\">".concat(value, "</div>");
          htmlMessages += '</div>';
          htmlMessages += '</div>';
          countMessages += 1;
        });
      }

      if (response.advices.warning !== undefined && response.advices.warning.length > 0) {
        $.each(response.advices.warning, function (key, value) {
          htmlMessages += '<div class="item">';
          htmlMessages += '<i class="meh outline yellow icon"></i>';
          htmlMessages += '<div class="content">';
          htmlMessages += "<div class=\"ui small header\">".concat(value, "</div>");
          htmlMessages += '</div>';
          htmlMessages += '</div>';
          countMessages += 1;
        });
      }

      if (response.advices.info !== undefined && response.advices.info.length > 0) {
        $.each(response.advices.info, function (key, value) {
          htmlMessages += '<div class="item">';
          htmlMessages += '<i class="smile outline blue icon"></i>';
          htmlMessages += '<div class="content">';
          htmlMessages += "<div class=\"ui small header\">".concat(value, "</div>");
          htmlMessages += '</div>';
          htmlMessages += '</div>';
          countMessages += 1;
        });
      }

      if (response.advices.error !== undefined && response.advices.error.length > 0) {
        iconBellClass = 'red large icon bell';
      } else if (response.advices.warning !== undefined && response.advices.warning.length > 0) {
        iconBellClass = 'yellow icon bell';
      } else if (response.advices.info !== undefined && response.advices.info.length > 0) {
        iconBellClass = 'blue icon bell';
      }

      htmlMessages += '</div>';
      advicesWorker.$advices.html(htmlMessages);
      sessionStorage.setItem("previousAdvice".concat(globalWebAdminLanguage), htmlMessages);

      if (countMessages > 0) {
        advicesWorker.$advicesBellButton.html("<i class=\"".concat(iconBellClass, "\"></i>").concat(countMessages)).popup({
          position: 'bottom left',
          popup: advicesWorker.$advices,
          delay: {
            show: 300,
            hide: 10000
          }
        });
        advicesWorker.$advicesBellButton.find('i').transition('set looping').transition('pulse', '1000ms');
      } else {
        advicesWorker.$advicesBellButton.html("<i class=\"grey icon bell\"></i>");
      }

      sessionStorage.setItem("previousAdviceBell".concat(globalWebAdminLanguage), advicesWorker.$advicesBellButton.html());
      advicesWorker.timeoutHandle = window.setTimeout(advicesWorker.worker, advicesWorker.timeOut);
    } else if (response.success === true && response.advices !== undefined && response.advices.length === 0) {
      sessionStorage.removeItem("previousAdvice".concat(globalWebAdminLanguage));
      sessionStorage.removeItem("previousAdviceBell".concat(globalWebAdminLanguage));
      advicesWorker.$advicesBellButton.html('<i class="grey icon bell outline"></i>');
    }
  }
};
$(document).ready(function () {
  advicesWorker.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9BZHZpY2VzL2FkdmljZXMtd29ya2VyLmpzIl0sIm5hbWVzIjpbImFkdmljZXNXb3JrZXIiLCJ0aW1lT3V0IiwidGltZU91dEhhbmRsZSIsIiRhZHZpY2VzIiwiJCIsIiRhZHZpY2VzQmVsbEJ1dHRvbiIsImluaXRpYWxpemUiLCJzaG93UHJldmlvdXNBZHZpY2UiLCJyZXN0YXJ0V29ya2VyIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImNiT25EYXRhQ2hhbmdlZCIsImNsZWFyVGltZW91dCIsInRpbWVvdXRIYW5kbGUiLCJ3b3JrZXIiLCJzZXNzaW9uU3RvcmFnZSIsInJlbW92ZUl0ZW0iLCJnbG9iYWxXZWJBZG1pbkxhbmd1YWdlIiwic2V0VGltZW91dCIsInByZXZpb3VzQWR2aWNlQmVsbCIsImdldEl0ZW0iLCJ1bmRlZmluZWQiLCJodG1sIiwicHJldmlvdXNBZHZpY2UiLCJQYnhBcGkiLCJBZHZpY2VzR2V0TGlzdCIsImNiQWZ0ZXJSZXNwb25zZSIsInJlc3BvbnNlIiwiYWR2aWNlcyIsImh0bWxNZXNzYWdlcyIsImNvdW50TWVzc2FnZXMiLCJpY29uQmVsbENsYXNzIiwibmVlZFVwZGF0ZSIsImxlbmd0aCIsInRyaWdnZXIiLCJlcnJvciIsImVhY2giLCJrZXkiLCJ2YWx1ZSIsIndhcm5pbmciLCJpbmZvIiwic2V0SXRlbSIsInBvcHVwIiwicG9zaXRpb24iLCJkZWxheSIsInNob3ciLCJoaWRlIiwiZmluZCIsInRyYW5zaXRpb24iLCJzdWNjZXNzIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBRUEsSUFBTUEsYUFBYSxHQUFHO0FBQ3JCQyxFQUFBQSxPQUFPLEVBQUUsTUFEWTtBQUVyQkMsRUFBQUEsYUFBYSxFQUFFLEVBRk07QUFHckJD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QWtCLFlBQU07QUFDdkJuRCxFQUFBQSxhQUFhLENBQUNNLFVBQWQ7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCAoQykgMjAxNy0yMDIwIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBnbG9iYWxXZWJBZG1pbkxhbmd1YWdlLCBzZXNzaW9uU3RvcmFnZSwgJCwgZ2xvYmFsVHJhbnNsYXRlICovXG5cbmNvbnN0IGFkdmljZXNXb3JrZXIgPSB7XG5cdHRpbWVPdXQ6IDMwMDAwMCxcblx0dGltZU91dEhhbmRsZTogJycsXG5cdCRhZHZpY2VzOiAkKCcjYWR2aWNlcycpLFxuXHQkYWR2aWNlc0JlbGxCdXR0b246ICQoJyNzaG93LWFkdmljZXMtYnV0dG9uJyksXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0YWR2aWNlc1dvcmtlci5zaG93UHJldmlvdXNBZHZpY2UoKTtcblx0XHQvLyDQl9Cw0L/Rg9GB0YLQuNC8INC/0L7Qu9GD0YfQtdC90LjQtSDQvdC+0LLRi9GFINGB0L7QstC10YLQvtCyXG5cdFx0YWR2aWNlc1dvcmtlci5yZXN0YXJ0V29ya2VyKCk7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0NvbmZpZ0RhdGFDaGFuZ2VkJywgYWR2aWNlc1dvcmtlci5jYk9uRGF0YUNoYW5nZWQpO1xuXHR9LFxuXHRyZXN0YXJ0V29ya2VyKCkge1xuXHRcdHdpbmRvdy5jbGVhclRpbWVvdXQoYWR2aWNlc1dvcmtlci50aW1lb3V0SGFuZGxlKTtcblx0XHRhZHZpY2VzV29ya2VyLndvcmtlcigpO1xuXHR9LFxuXHQvKipcblx0ICog0J7QsdGA0LDQsdC+0YLQutCwINGB0L7QsdGL0YLQuNGPINGB0LzQtdC90Ysg0Y/Qt9GL0LrQsCDQuNC70Lgg0LTQsNC90L3Ri9GFXG5cdCAqL1xuXHRjYk9uRGF0YUNoYW5nZWQoKSB7XG5cdFx0c2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShgcHJldmlvdXNBZHZpY2Uke2dsb2JhbFdlYkFkbWluTGFuZ3VhZ2V9YCk7XG5cdFx0c2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShgcHJldmlvdXNBZHZpY2VCZWxsJHtnbG9iYWxXZWJBZG1pbkxhbmd1YWdlfWApO1xuXHRcdHNldFRpbWVvdXQoYWR2aWNlc1dvcmtlci5yZXN0YXJ0V29ya2VyLDMwMDApO1xuXHR9LFxuXHQvKipcblx0ICog0J/QvtC60LDQt9GL0LLQsNC10YIg0YHRgtCw0YDRi9C1INGB0L7QstC10YLRiyDQtNC+INC/0L7Qu9GD0YfQtdC90LjRjyDQvtCx0LLQvdC+0LvQtdC90LjRjyDRgdC+INGB0YLQsNC90YbQuNC4XG5cdCAqL1xuXHRzaG93UHJldmlvdXNBZHZpY2UoKSB7XG5cdFx0Y29uc3QgcHJldmlvdXNBZHZpY2VCZWxsID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShgcHJldmlvdXNBZHZpY2VCZWxsJHtnbG9iYWxXZWJBZG1pbkxhbmd1YWdlfWApO1xuXHRcdGlmIChwcmV2aW91c0FkdmljZUJlbGwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0YWR2aWNlc1dvcmtlci4kYWR2aWNlc0JlbGxCdXR0b24uaHRtbChwcmV2aW91c0FkdmljZUJlbGwpO1xuXHRcdH1cblx0XHRjb25zdCBwcmV2aW91c0FkdmljZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYHByZXZpb3VzQWR2aWNlJHtnbG9iYWxXZWJBZG1pbkxhbmd1YWdlfWApO1xuXHRcdGlmIChwcmV2aW91c0FkdmljZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRhZHZpY2VzV29ya2VyLiRhZHZpY2VzLmh0bWwocHJldmlvdXNBZHZpY2UpO1xuXHRcdH1cblx0fSxcblx0d29ya2VyKCkge1xuXHRcdFBieEFwaS5BZHZpY2VzR2V0TGlzdChhZHZpY2VzV29ya2VyLmNiQWZ0ZXJSZXNwb25zZSk7XG5cdH0sXG5cdGNiQWZ0ZXJSZXNwb25zZShyZXNwb25zZSkge1xuXHRcdGlmIChyZXNwb25zZSA9PT0gZmFsc2UpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0YWR2aWNlc1dvcmtlci4kYWR2aWNlcy5odG1sKCcnKTtcblx0XHRpZiAocmVzcG9uc2UuYWR2aWNlcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRsZXQgaHRtbE1lc3NhZ2VzID0gJyc7XG5cdFx0XHRsZXQgY291bnRNZXNzYWdlcyA9IDA7XG5cdFx0XHRsZXQgaWNvbkJlbGxDbGFzcyA9ICcnO1xuXHRcdFx0aHRtbE1lc3NhZ2VzICs9ICc8ZGl2IGNsYXNzPVwidWkgcmVsYXhlZCBkaXZpZGVkIGxpc3RcIj4nO1xuXG5cdFx0XHRpZiAocmVzcG9uc2UuYWR2aWNlcy5uZWVkVXBkYXRlICE9PSB1bmRlZmluZWRcblx0XHRcdFx0JiYgcmVzcG9uc2UuYWR2aWNlcy5uZWVkVXBkYXRlLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0JCh3aW5kb3cpLnRyaWdnZXIoJ1NlY3VyaXR5V2FybmluZycsIFtyZXNwb25zZS5hZHZpY2VzXSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChyZXNwb25zZS5hZHZpY2VzLmVycm9yICE9PSB1bmRlZmluZWRcblx0XHRcdFx0JiYgcmVzcG9uc2UuYWR2aWNlcy5lcnJvci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5hZHZpY2VzLmVycm9yLCAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGh0bWxNZXNzYWdlcyArPSAnPGRpdiBjbGFzcz1cIml0ZW1cIj4nO1xuXHRcdFx0XHRcdGh0bWxNZXNzYWdlcyArPSAnPGkgY2xhc3M9XCJmcm93biBvdXRsaW5lIHJlZCBpY29uXCI+PC9pPic7XG5cdFx0XHRcdFx0aHRtbE1lc3NhZ2VzICs9ICc8ZGl2IGNsYXNzPVwiY29udGVudFwiPic7XG5cdFx0XHRcdFx0aHRtbE1lc3NhZ2VzICs9IGA8ZGl2IGNsYXNzPVwidWkgc21hbGwgcmVkIGhlYWRlclwiPiR7dmFsdWV9PC9kaXY+YDtcblx0XHRcdFx0XHRodG1sTWVzc2FnZXMgKz0gJzwvZGl2Pic7XG5cdFx0XHRcdFx0aHRtbE1lc3NhZ2VzICs9ICc8L2Rpdj4nO1xuXHRcdFx0XHRcdGNvdW50TWVzc2FnZXMgKz0gMTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVzcG9uc2UuYWR2aWNlcy53YXJuaW5nICE9PSB1bmRlZmluZWRcblx0XHRcdFx0JiYgcmVzcG9uc2UuYWR2aWNlcy53YXJuaW5nLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLmFkdmljZXMud2FybmluZywgKGtleSwgdmFsdWUpID0+IHtcblx0XHRcdFx0XHRodG1sTWVzc2FnZXMgKz0gJzxkaXYgY2xhc3M9XCJpdGVtXCI+Jztcblx0XHRcdFx0XHRodG1sTWVzc2FnZXMgKz0gJzxpIGNsYXNzPVwibWVoIG91dGxpbmUgeWVsbG93IGljb25cIj48L2k+Jztcblx0XHRcdFx0XHRodG1sTWVzc2FnZXMgKz0gJzxkaXYgY2xhc3M9XCJjb250ZW50XCI+Jztcblx0XHRcdFx0XHRodG1sTWVzc2FnZXMgKz0gYDxkaXYgY2xhc3M9XCJ1aSBzbWFsbCBoZWFkZXJcIj4ke3ZhbHVlfTwvZGl2PmA7XG5cdFx0XHRcdFx0aHRtbE1lc3NhZ2VzICs9ICc8L2Rpdj4nO1xuXHRcdFx0XHRcdGh0bWxNZXNzYWdlcyArPSAnPC9kaXY+Jztcblx0XHRcdFx0XHRjb3VudE1lc3NhZ2VzICs9IDE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlc3BvbnNlLmFkdmljZXMuaW5mbyAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdCYmIHJlc3BvbnNlLmFkdmljZXMuaW5mby5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5hZHZpY2VzLmluZm8sIChrZXksIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0aHRtbE1lc3NhZ2VzICs9ICc8ZGl2IGNsYXNzPVwiaXRlbVwiPic7XG5cdFx0XHRcdFx0aHRtbE1lc3NhZ2VzICs9ICc8aSBjbGFzcz1cInNtaWxlIG91dGxpbmUgYmx1ZSBpY29uXCI+PC9pPic7XG5cdFx0XHRcdFx0aHRtbE1lc3NhZ2VzICs9ICc8ZGl2IGNsYXNzPVwiY29udGVudFwiPic7XG5cdFx0XHRcdFx0aHRtbE1lc3NhZ2VzICs9IGA8ZGl2IGNsYXNzPVwidWkgc21hbGwgaGVhZGVyXCI+JHt2YWx1ZX08L2Rpdj5gO1xuXHRcdFx0XHRcdGh0bWxNZXNzYWdlcyArPSAnPC9kaXY+Jztcblx0XHRcdFx0XHRodG1sTWVzc2FnZXMgKz0gJzwvZGl2Pic7XG5cdFx0XHRcdFx0Y291bnRNZXNzYWdlcyArPSAxO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHJlc3BvbnNlLmFkdmljZXMuZXJyb3IgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHQmJiByZXNwb25zZS5hZHZpY2VzLmVycm9yLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0aWNvbkJlbGxDbGFzcyA9ICdyZWQgbGFyZ2UgaWNvbiBiZWxsJztcblx0XHRcdH0gZWxzZSBpZiAocmVzcG9uc2UuYWR2aWNlcy53YXJuaW5nICE9PSB1bmRlZmluZWRcblx0XHRcdFx0JiYgcmVzcG9uc2UuYWR2aWNlcy53YXJuaW5nLmxlbmd0aCA+IDApe1xuXHRcdFx0XHRpY29uQmVsbENsYXNzID0gJ3llbGxvdyBpY29uIGJlbGwnO1xuXG5cdFx0XHR9IGVsc2UgaWYgKHJlc3BvbnNlLmFkdmljZXMuaW5mbyAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdCYmIHJlc3BvbnNlLmFkdmljZXMuaW5mby5sZW5ndGggPiAwKXtcblx0XHRcdFx0aWNvbkJlbGxDbGFzcyA9ICdibHVlIGljb24gYmVsbCc7XG5cdFx0XHR9XG5cblxuXHRcdFx0aHRtbE1lc3NhZ2VzICs9ICc8L2Rpdj4nO1xuXHRcdFx0YWR2aWNlc1dvcmtlci4kYWR2aWNlcy5odG1sKGh0bWxNZXNzYWdlcyk7XG5cdFx0XHRzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGBwcmV2aW91c0FkdmljZSR7Z2xvYmFsV2ViQWRtaW5MYW5ndWFnZX1gLCBodG1sTWVzc2FnZXMpO1xuXG5cdFx0XHRpZiAoY291bnRNZXNzYWdlcz4wKXtcblx0XHRcdFx0YWR2aWNlc1dvcmtlci4kYWR2aWNlc0JlbGxCdXR0b25cblx0XHRcdFx0XHQuaHRtbChgPGkgY2xhc3M9XCIke2ljb25CZWxsQ2xhc3N9XCI+PC9pPiR7Y291bnRNZXNzYWdlc31gKVxuXHRcdFx0XHRcdC5wb3B1cCh7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogJ2JvdHRvbSBsZWZ0Jyxcblx0XHRcdFx0XHRcdHBvcHVwOiBhZHZpY2VzV29ya2VyLiRhZHZpY2VzLFxuXHRcdFx0XHRcdFx0ZGVsYXk6IHtcblx0XHRcdFx0XHRcdFx0c2hvdzogMzAwLFxuXHRcdFx0XHRcdFx0XHRoaWRlOiAxMDAwMCxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdGFkdmljZXNXb3JrZXIuJGFkdmljZXNCZWxsQnV0dG9uLmZpbmQoJ2knKVxuXHRcdFx0XHRcdC50cmFuc2l0aW9uKCdzZXQgbG9vcGluZycpXG5cdFx0XHRcdFx0LnRyYW5zaXRpb24oJ3B1bHNlJywgJzEwMDBtcycpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWR2aWNlc1dvcmtlci4kYWR2aWNlc0JlbGxCdXR0b25cblx0XHRcdFx0XHQuaHRtbChgPGkgY2xhc3M9XCJncmV5IGljb24gYmVsbFwiPjwvaT5gKVxuXHRcdFx0fVxuXHRcdFx0c2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShgcHJldmlvdXNBZHZpY2VCZWxsJHtnbG9iYWxXZWJBZG1pbkxhbmd1YWdlfWAsIGFkdmljZXNXb3JrZXIuJGFkdmljZXNCZWxsQnV0dG9uLmh0bWwoKSk7XG5cdFx0XHRhZHZpY2VzV29ya2VyLnRpbWVvdXRIYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dChcblx0XHRcdFx0YWR2aWNlc1dvcmtlci53b3JrZXIsXG5cdFx0XHRcdGFkdmljZXNXb3JrZXIudGltZU91dCxcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChyZXNwb25zZS5zdWNjZXNzID09PSB0cnVlXG5cdFx0XHQmJiByZXNwb25zZS5hZHZpY2VzICE9PSB1bmRlZmluZWRcblx0XHRcdCYmIHJlc3BvbnNlLmFkdmljZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKGBwcmV2aW91c0FkdmljZSR7Z2xvYmFsV2ViQWRtaW5MYW5ndWFnZX1gKTtcblx0XHRcdHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oYHByZXZpb3VzQWR2aWNlQmVsbCR7Z2xvYmFsV2ViQWRtaW5MYW5ndWFnZX1gKTtcblx0XHRcdGFkdmljZXNXb3JrZXIuJGFkdmljZXNCZWxsQnV0dG9uXG5cdFx0XHRcdC5odG1sKCc8aSBjbGFzcz1cImdyZXkgaWNvbiBiZWxsIG91dGxpbmVcIj48L2k+Jyk7XG5cdFx0fVxuXHR9LFxufTtcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRhZHZpY2VzV29ya2VyLmluaXRpYWxpemUoKTtcbn0pO1xuIl19