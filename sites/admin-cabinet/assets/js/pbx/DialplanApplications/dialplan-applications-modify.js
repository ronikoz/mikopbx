"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global globalRootUrl,globalTranslate, ace, Form, Extensions */
// Проверка нет ли ошибки занятого другой учеткой номера
$.fn.form.settings.rules.existRule = function (value, parameter) {
  return $("#".concat(parameter)).hasClass('hidden');
};

var dialplanApplication = {
  $number: $('#extension'),
  defaultExtension: '',
  $formObj: $('#dialplan-application-form'),
  $typeSelectDropDown: $('#dialplan-application-form .type-select'),
  $dirrtyField: $('#dirrty'),
  $tabMenuItems: $('#application-code-menu .item'),
  editor: '',
  validateRules: {
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.da_ValidateNameIsEmpty
      }]
    },
    extension: {
      identifier: 'extension',
      rules: [{
        type: 'number',
        prompt: globalTranslate.da_ValidateExtensionNumber
      }, {
        type: 'empty',
        prompt: globalTranslate.da_ValidateExtensionIsEmpty
      }, {
        type: 'existRule[extension-error]',
        prompt: globalTranslate.da_ValidateExtensionDouble
      }]
    }
  },
  initialize: function () {
    function initialize() {
      dialplanApplication.$tabMenuItems.tab();

      if (dialplanApplication.$formObj.form('get value', 'name').length === 0) {
        dialplanApplication.$tabMenuItems.tab('change tab', 'main');
      }

      dialplanApplication.$typeSelectDropDown.dropdown({
        onChange: dialplanApplication.changeAceMode
      }); // Динамическая проверка свободен ли внутренний номер

      dialplanApplication.$number.on('change', function () {
        var newNumber = dialplanApplication.$formObj.form('get value', 'extension');
        Extensions.checkAvailability(dialplanApplication.defaultExtension, newNumber);
      });
      dialplanApplication.initializeAce();
      dialplanApplication.initializeForm();
      dialplanApplication.changeAceMode();
      dialplanApplication.defaultExtension = dialplanApplication.$formObj.form('get value', 'extension');
    }

    return initialize;
  }(),
  initializeAce: function () {
    function initializeAce() {
      var aceHeight = window.innerHeight - 380;
      var rowsCount = Math.round(aceHeight / 16.3);
      $(window).load(function () {
        $('.application-code').css('min-height', "".concat(aceHeight, "px"));
      });
      dialplanApplication.editor = ace.edit('application-code');
      dialplanApplication.editor.setTheme('ace/theme/monokai');
      dialplanApplication.editor.resize();
      dialplanApplication.editor.getSession().on('change', function () {
        dialplanApplication.$dirrtyField.val(Math.random());
        dialplanApplication.$dirrtyField.trigger('change');
      });
      dialplanApplication.editor.setOptions({
        maxLines: rowsCount
      });
    }

    return initializeAce;
  }(),
  changeAceMode: function () {
    function changeAceMode() {
      var mode = dialplanApplication.$formObj.form('get value', 'type');
      var NewMode;

      if (mode === 'php') {
        NewMode = ace.require('ace/mode/php').Mode;
      } else {
        NewMode = ace.require('ace/mode/julia').Mode;
      }

      dialplanApplication.editor.session.setMode(new NewMode());
      dialplanApplication.editor.setTheme('ace/theme/monokai');
    }

    return changeAceMode;
  }(),
  cbBeforeSendForm: function () {
    function cbBeforeSendForm(settings) {
      var result = settings;
      result.data = dialplanApplication.$formObj.form('get values');
      result.data.applicationlogic = dialplanApplication.editor.getValue();
      return result;
    }

    return cbBeforeSendForm;
  }(),
  cbAfterSendForm: function () {
    function cbAfterSendForm() {}

    return cbAfterSendForm;
  }(),
  initializeForm: function () {
    function initializeForm() {
      Form.$formObj = dialplanApplication.$formObj;
      Form.url = "".concat(globalRootUrl, "dialplan-applications/save");
      Form.validateRules = dialplanApplication.validateRules;
      Form.cbBeforeSendForm = dialplanApplication.cbBeforeSendForm;
      Form.cbAfterSendForm = dialplanApplication.cbAfterSendForm;
      Form.initialize();
    }

    return initializeForm;
  }()
};
$(document).ready(function () {
  dialplanApplication.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9EaWFscGxhbkFwcGxpY2F0aW9ucy9kaWFscGxhbi1hcHBsaWNhdGlvbnMtbW9kaWZ5LmpzIl0sIm5hbWVzIjpbIiQiLCJmbiIsImZvcm0iLCJzZXR0aW5ncyIsInJ1bGVzIiwiZXhpc3RSdWxlIiwidmFsdWUiLCJwYXJhbWV0ZXIiLCJoYXNDbGFzcyIsImRpYWxwbGFuQXBwbGljYXRpb24iLCIkbnVtYmVyIiwiZGVmYXVsdEV4dGVuc2lvbiIsIiRmb3JtT2JqIiwiJHR5cGVTZWxlY3REcm9wRG93biIsIiRkaXJydHlGaWVsZCIsIiR0YWJNZW51SXRlbXMiLCJlZGl0b3IiLCJ2YWxpZGF0ZVJ1bGVzIiwibmFtZSIsImlkZW50aWZpZXIiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwiZGFfVmFsaWRhdGVOYW1lSXNFbXB0eSIsImV4dGVuc2lvbiIsImRhX1ZhbGlkYXRlRXh0ZW5zaW9uTnVtYmVyIiwiZGFfVmFsaWRhdGVFeHRlbnNpb25Jc0VtcHR5IiwiZGFfVmFsaWRhdGVFeHRlbnNpb25Eb3VibGUiLCJpbml0aWFsaXplIiwidGFiIiwibGVuZ3RoIiwiZHJvcGRvd24iLCJvbkNoYW5nZSIsImNoYW5nZUFjZU1vZGUiLCJvbiIsIm5ld051bWJlciIsIkV4dGVuc2lvbnMiLCJjaGVja0F2YWlsYWJpbGl0eSIsImluaXRpYWxpemVBY2UiLCJpbml0aWFsaXplRm9ybSIsImFjZUhlaWdodCIsIndpbmRvdyIsImlubmVySGVpZ2h0Iiwicm93c0NvdW50IiwiTWF0aCIsInJvdW5kIiwibG9hZCIsImNzcyIsImFjZSIsImVkaXQiLCJzZXRUaGVtZSIsInJlc2l6ZSIsImdldFNlc3Npb24iLCJ2YWwiLCJyYW5kb20iLCJ0cmlnZ2VyIiwic2V0T3B0aW9ucyIsIm1heExpbmVzIiwibW9kZSIsIk5ld01vZGUiLCJyZXF1aXJlIiwiTW9kZSIsInNlc3Npb24iLCJzZXRNb2RlIiwiY2JCZWZvcmVTZW5kRm9ybSIsInJlc3VsdCIsImRhdGEiLCJhcHBsaWNhdGlvbmxvZ2ljIiwiZ2V0VmFsdWUiLCJjYkFmdGVyU2VuZEZvcm0iLCJGb3JtIiwidXJsIiwiZ2xvYmFsUm9vdFVybCIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7O0FBUUE7QUFFQTtBQUNBQSxDQUFDLENBQUNDLEVBQUYsQ0FBS0MsSUFBTCxDQUFVQyxRQUFWLENBQW1CQyxLQUFuQixDQUF5QkMsU0FBekIsR0FBcUMsVUFBQ0MsS0FBRCxFQUFRQyxTQUFSO0FBQUEsU0FBc0JQLENBQUMsWUFBS08sU0FBTCxFQUFELENBQW1CQyxRQUFuQixDQUE0QixRQUE1QixDQUF0QjtBQUFBLENBQXJDOztBQUVBLElBQU1DLG1CQUFtQixHQUFHO0FBQzNCQyxFQUFBQSxPQUFPLEVBQUVWLENBQUMsQ0FBQyxZQUFELENBRGlCO0FBRTNCVyxFQUFBQSxnQkFBZ0IsRUFBRSxFQUZTO0FBRzNCQyxFQUFBQSxRQUFRLEVBQUVaLENBQUMsQ0FBQyw0QkFBRCxDQUhnQjtBQUkzQmEsRUFBQUEsbUJBQW1CLEVBQUViLENBQUMsQ0FBQyx5Q0FBRCxDQUpLO0FBSzNCYyxFQUFBQSxZQUFZLEVBQUVkLENBQUMsQ0FBQyxTQUFELENBTFk7QUFNM0JlLEVBQUFBLGFBQWEsRUFBRWYsQ0FBQyxDQUFDLDhCQUFELENBTlc7QUFPM0JnQixFQUFBQSxNQUFNLEVBQUUsRUFQbUI7QUFRM0JDLEVBQUFBLGFBQWEsRUFBRTtBQUNkQyxJQUFBQSxJQUFJLEVBQUU7QUFDTEMsTUFBQUEsVUFBVSxFQUFFLE1BRFA7QUFFTGYsTUFBQUEsS0FBSyxFQUFFLENBQ047QUFDQ2dCLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDQztBQUZ6QixPQURNO0FBRkYsS0FEUTtBQVVkQyxJQUFBQSxTQUFTLEVBQUU7QUFDVkwsTUFBQUEsVUFBVSxFQUFFLFdBREY7QUFFVmYsTUFBQUEsS0FBSyxFQUFFLENBQ047QUFDQ2dCLFFBQUFBLElBQUksRUFB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QixNQUFBQSxJQUFJLENBQUMxRCxRQUFMLEdBQWdCSCxtQkFBbUIsQ0FBQ0csUUFBcEM7QUFDQTBELE1BQUFBLElBQUksQ0FBQ0MsR0FBTCxhQUFjQyxhQUFkO0FBQ0FGLE1BQUFBLElBQUksQ0FBQ3JELGFBQUwsR0FBcUJSLG1CQUFtQixDQUFDUSxhQUF6QztBQUNBcUQsTUFBQUEsSUFBSSxDQUFDTixnQkFBTCxHQUF3QnZELG1CQUFtQixDQUFDdUQsZ0JBQTVDO0FBQ0FNLE1BQUFBLElBQUksQ0FBQ0QsZUFBTCxHQUF1QjVELG1CQUFtQixDQUFDNEQsZUFBM0M7QUFDQUMsTUFBQUEsSUFBSSxDQUFDMUMsVUFBTDtBQUNBOztBQW5HMEI7QUFBQTtBQUFBLENBQTVCO0FBc0dBNUIsQ0FBQyxDQUFDeUUsUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUN2QmpFLEVBQUFBLG1CQUFtQixDQUFDbUIsVUFBcEI7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAoQykgTUlLTyBMTEMgLSBBbGwgUmlnaHRzIFJlc2VydmVkXG4gKiBVbmF1dGhvcml6ZWQgY29weWluZyBvZiB0aGlzIGZpbGUsIHZpYSBhbnkgbWVkaXVtIGlzIHN0cmljdGx5IHByb2hpYml0ZWRcbiAqIFByb3ByaWV0YXJ5IGFuZCBjb25maWRlbnRpYWxcbiAqIFdyaXR0ZW4gYnkgTmlrb2xheSBCZWtldG92LCAxMiAyMDE5XG4gKlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLGdsb2JhbFRyYW5zbGF0ZSwgYWNlLCBGb3JtLCBFeHRlbnNpb25zICovXG5cbi8vINCf0YDQvtCy0LXRgNC60LAg0L3QtdGCINC70Lgg0L7RiNC40LHQutC4INC30LDQvdGP0YLQvtCz0L4g0LTRgNGD0LPQvtC5INGD0YfQtdGC0LrQvtC5INC90L7QvNC10YDQsFxuJC5mbi5mb3JtLnNldHRpbmdzLnJ1bGVzLmV4aXN0UnVsZSA9ICh2YWx1ZSwgcGFyYW1ldGVyKSA9PiAkKGAjJHtwYXJhbWV0ZXJ9YCkuaGFzQ2xhc3MoJ2hpZGRlbicpO1xuXG5jb25zdCBkaWFscGxhbkFwcGxpY2F0aW9uID0ge1xuXHQkbnVtYmVyOiAkKCcjZXh0ZW5zaW9uJyksXG5cdGRlZmF1bHRFeHRlbnNpb246ICcnLFxuXHQkZm9ybU9iajogJCgnI2RpYWxwbGFuLWFwcGxpY2F0aW9uLWZvcm0nKSxcblx0JHR5cGVTZWxlY3REcm9wRG93bjogJCgnI2RpYWxwbGFuLWFwcGxpY2F0aW9uLWZvcm0gLnR5cGUtc2VsZWN0JyksXG5cdCRkaXJydHlGaWVsZDogJCgnI2RpcnJ0eScpLFxuXHQkdGFiTWVudUl0ZW1zOiAkKCcjYXBwbGljYXRpb24tY29kZS1tZW51IC5pdGVtJyksXG5cdGVkaXRvcjogJycsXG5cdHZhbGlkYXRlUnVsZXM6IHtcblx0XHRuYW1lOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnbmFtZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5kYV9WYWxpZGF0ZU5hbWVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGV4dGVuc2lvbjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2V4dGVuc2lvbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ251bWJlcicsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUuZGFfVmFsaWRhdGVFeHRlbnNpb25OdW1iZXIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLmRhX1ZhbGlkYXRlRXh0ZW5zaW9uSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdleGlzdFJ1bGVbZXh0ZW5zaW9uLWVycm9yXScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUuZGFfVmFsaWRhdGVFeHRlbnNpb25Eb3VibGUsXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdH0sXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi4kdGFiTWVudUl0ZW1zLnRhYigpO1xuXHRcdGlmIChkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICduYW1lJykubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLiR0YWJNZW51SXRlbXMudGFiKCdjaGFuZ2UgdGFiJywgJ21haW4nKTtcblx0XHR9XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi4kdHlwZVNlbGVjdERyb3BEb3duLmRyb3Bkb3duKHtcblx0XHRcdG9uQ2hhbmdlOiBkaWFscGxhbkFwcGxpY2F0aW9uLmNoYW5nZUFjZU1vZGUsXG5cdFx0fSk7XG5cdFx0Ly8g0JTQuNC90LDQvNC40YfQtdGB0LrQsNGPINC/0YDQvtCy0LXRgNC60LAg0YHQstC+0LHQvtC00LXQvSDQu9C4INCy0L3Rg9GC0YDQtdC90L3QuNC5INC90L7QvNC10YBcblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLiRudW1iZXIub24oJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdGNvbnN0IG5ld051bWJlciA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgJ2V4dGVuc2lvbicpO1xuXHRcdFx0RXh0ZW5zaW9ucy5jaGVja0F2YWlsYWJpbGl0eShkaWFscGxhbkFwcGxpY2F0aW9uLmRlZmF1bHRFeHRlbnNpb24sIG5ld051bWJlcik7XG5cdFx0fSk7XG5cblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmluaXRpYWxpemVBY2UoKTtcblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmluaXRpYWxpemVGb3JtKCk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5jaGFuZ2VBY2VNb2RlKCk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5kZWZhdWx0RXh0ZW5zaW9uID0gZGlhbHBsYW5BcHBsaWNhdGlvbi4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCAnZXh0ZW5zaW9uJyk7XG5cdH0sXG5cdGluaXRpYWxpemVBY2UoKSB7XG5cdFx0Y29uc3QgYWNlSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0LTM4MDtcblx0XHRjb25zdCByb3dzQ291bnQgPSBNYXRoLnJvdW5kKGFjZUhlaWdodC8xNi4zKTtcblx0XHQkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcblx0XHRcdCQoJy5hcHBsaWNhdGlvbi1jb2RlJykuY3NzKCdtaW4taGVpZ2h0JywgYCR7YWNlSGVpZ2h0fXB4YCk7XG5cdFx0fSk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3IgPSBhY2UuZWRpdCgnYXBwbGljYXRpb24tY29kZScpO1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yLnNldFRoZW1lKCdhY2UvdGhlbWUvbW9ub2thaScpO1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yLnJlc2l6ZSgpO1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yLmdldFNlc3Npb24oKS5vbignY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi4kZGlycnR5RmllbGQudmFsKE1hdGgucmFuZG9tKCkpO1xuXHRcdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi4kZGlycnR5RmllbGQudHJpZ2dlcignY2hhbmdlJyk7XG5cdFx0fSk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3Iuc2V0T3B0aW9ucyh7XG5cdFx0XHRtYXhMaW5lczogcm93c0NvdW50LFxuXHRcdH0pO1xuXHR9LFxuXHRjaGFuZ2VBY2VNb2RlKCkge1xuXHRcdGNvbnN0IG1vZGUgPSBkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICd0eXBlJyk7XG5cdFx0bGV0IE5ld01vZGU7XG5cdFx0aWYgKG1vZGUgPT09ICdwaHAnKSB7XG5cdFx0XHROZXdNb2RlID0gYWNlLnJlcXVpcmUoJ2FjZS9tb2RlL3BocCcpLk1vZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE5ld01vZGUgPSBhY2UucmVxdWlyZSgnYWNlL21vZGUvanVsaWEnKS5Nb2RlO1xuXHRcdH1cblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5zZXNzaW9uLnNldE1vZGUobmV3IE5ld01vZGUoKSk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3Iuc2V0VGhlbWUoJ2FjZS90aGVtZS9tb25va2FpJyk7XG5cdH0sXG5cdGNiQmVmb3JlU2VuZEZvcm0oc2V0dGluZ3MpIHtcblx0XHRjb25zdCByZXN1bHQgPSBzZXR0aW5ncztcblx0XHRyZXN1bHQuZGF0YSA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdHJlc3VsdC5kYXRhLmFwcGxpY2F0aW9ubG9naWMgPSBkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5nZXRWYWx1ZSgpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblxuXHR9LFxuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gZGlhbHBsYW5BcHBsaWNhdGlvbi4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9ZGlhbHBsYW4tYXBwbGljYXRpb25zL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IGRpYWxwbGFuQXBwbGljYXRpb24udmFsaWRhdGVSdWxlcztcblx0XHRGb3JtLmNiQmVmb3JlU2VuZEZvcm0gPSBkaWFscGxhbkFwcGxpY2F0aW9uLmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBkaWFscGxhbkFwcGxpY2F0aW9uLmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplKCk7XG59KTtcblxuIl19