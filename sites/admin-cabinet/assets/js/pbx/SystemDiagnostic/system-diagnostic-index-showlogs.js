"use strict";

/*
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 8 2020
 */

/* global ace, PbxApi */
var updateLogViewWorker = {
  timeOut: 3000,
  timeOutHandle: '',
  errorCounts: 0,
  initialize: function () {
    function initialize() {
      updateLogViewWorker.restartWorker();
    }

    return initialize;
  }(),
  restartWorker: function () {
    function restartWorker() {
      window.clearTimeout(updateLogViewWorker.timeoutHandle);
      updateLogViewWorker.worker();
    }

    return restartWorker;
  }(),
  worker: function () {
    function worker() {
      systemDiagnosticLogs.updateLogFromServer();
      updateLogViewWorker.timeoutHandle = window.setTimeout(updateLogViewWorker.worker, updateLogViewWorker.timeOut);
    }

    return worker;
  }(),
  stop: function () {
    function stop() {
      window.clearTimeout(updateLogViewWorker.timeoutHandle);
    }

    return stop;
  }()
};
var systemDiagnosticLogs = {
  $showBtn: $('#show-last-log'),
  $downloadBtn: $('#download-file'),
  $showAutoBtn: $('#show-last-log-auto'),
  viewer: '',
  $fileSelectDropDown: $('#system-diagnostic-form .filenames-select'),
  logsItems: [],
  defaultLogItem: null,
  $dimmer: $('#get-logs-dimmer'),
  $formObj: $('#system-diagnostic-form'),
  $fileName: $('#system-diagnostic-form .filename'),
  initialize: function () {
    function initialize() {
      var aceHeight = window.innerHeight - 300;
      $(window).load(function () {
        systemDiagnosticLogs.$dimmer.closest('div').css('min-height', "".concat(aceHeight, "px"));
      });
      systemDiagnosticLogs.$fileSelectDropDown.dropdown({
        values: systemDiagnosticLogs.logsItems,
        onChange: systemDiagnosticLogs.cbOnChangeFile,
        ignoreCase: true,
        fullTextSearch: true,
        forceSelection: false
      });
      systemDiagnosticLogs.initializeAce();
      PbxApi.SyslogGetLogsList(systemDiagnosticLogs.cbFormatDropdownResults);
      systemDiagnosticLogs.$showBtn.on('click', function (e) {
        e.preventDefault();
        systemDiagnosticLogs.updateLogFromServer();
      });
      systemDiagnosticLogs.$downloadBtn.on('click', function (e) {
        e.preventDefault();
        var data = systemDiagnosticLogs.$formObj.form('get values');
        PbxApi.SyslogDownloadLogFile(data.filename, systemDiagnosticLogs.cbDownloadFile);
      });
      systemDiagnosticLogs.$showAutoBtn.on('click', function (e) {
        e.preventDefault();
        var $reloadIcon = systemDiagnosticLogs.$showAutoBtn.find('i.refresh');

        if ($reloadIcon.hasClass('loading')) {
          $reloadIcon.removeClass('loading');
          updateLogViewWorker.stop();
        } else {
          $reloadIcon.addClass('loading');
          updateLogViewWorker.initialize();
        }
      });
      $('input').keyup(function (event) {
        if (event.keyCode === 13) {
          systemDiagnosticLogs.updateLogFromServer();
        }
      });
    }

    return initialize;
  }(),
  initializeAce: function () {
    function initializeAce() {
      var aceHeight = window.innerHeight - 300;
      var rowsCount = Math.round(aceHeight / 15.7);
      $(window).load(function () {
        $('.log-content-readonly').css('min-height', "".concat(aceHeight, "px"));
      });

      var IniMode = ace.require('ace/mode/julia').Mode;

      systemDiagnosticLogs.viewer = ace.edit('log-content-readonly');
      systemDiagnosticLogs.viewer.session.setMode(new IniMode());
      systemDiagnosticLogs.viewer.setTheme('ace/theme/monokai');
      systemDiagnosticLogs.viewer.resize();
      systemDiagnosticLogs.viewer.renderer.setShowGutter(false);
      systemDiagnosticLogs.viewer.setOptions({
        showLineNumbers: false,
        showPrintMargin: false,
        readOnly: true,
        maxLines: rowsCount
      });
    }

    return initializeAce;
  }(),

  /**
   * Makes formatted menu structure
   */
  cbFormatDropdownResults: function () {
    function cbFormatDropdownResults(response) {
      if (response === false) {
        return;
      }

      systemDiagnosticLogs.logsItems = [];
      var files = response.files;
      $.each(files, function (index, item) {
        systemDiagnosticLogs.logsItems.push({
          name: "".concat(index, " (").concat(item.size, ")"),
          value: item.path,
          selected: item["default"]
        });
      });
      systemDiagnosticLogs.$fileSelectDropDown.dropdown('change values', systemDiagnosticLogs.logsItems);
    }

    return cbFormatDropdownResults;
  }(),

  /**
   * Callback after change log file in select
   * @param value
   */
  cbOnChangeFile: function () {
    function cbOnChangeFile(value) {
      if (value.length === 0) {
        return;
      }

      systemDiagnosticLogs.$formObj.form('set value', 'filename', value);
      systemDiagnosticLogs.updateLogFromServer();
    }

    return cbOnChangeFile;
  }(),

  /**
   * Asks log file content from server
   */
  updateLogFromServer: function () {
    function updateLogFromServer() {
      var params = systemDiagnosticLogs.$formObj.form('get values');
      PbxApi.SyslogGetLogFromFile(params, systemDiagnosticLogs.cbUpdateLogText);
    }

    return updateLogFromServer;
  }(),

  /**
   * Updates log view
   * @param data
   */
  cbUpdateLogText: function () {
    function cbUpdateLogText(data) {
      systemDiagnosticLogs.viewer.getSession().setValue(data.content);
      var row = systemDiagnosticLogs.viewer.session.getLength() - 1;
      var column = systemDiagnosticLogs.viewer.session.getLine(row).length; // or simply Infinity

      systemDiagnosticLogs.viewer.gotoLine(row + 1, column);
      systemDiagnosticLogs.$dimmer.removeClass('active');
    }

    return cbUpdateLogText;
  }(),

  /**
   * After push button download file
   * @param response
   */
  cbDownloadFile: function () {
    function cbDownloadFile(response) {
      if (response !== false) {
        window.location = response.filename;
      }
    }

    return cbDownloadFile;
  }()
};
$(document).ready(function () {
  systemDiagnosticLogs.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9TeXN0ZW1EaWFnbm9zdGljL3N5c3RlbS1kaWFnbm9zdGljLWluZGV4LXNob3dsb2dzLmpzIl0sIm5hbWVzIjpbInVwZGF0ZUxvZ1ZpZXdXb3JrZXIiLCJ0aW1lT3V0IiwidGltZU91dEhhbmRsZSIsImVycm9yQ291bnRzIiwiaW5pdGlhbGl6ZSIsInJlc3RhcnRXb3JrZXIiLCJ3aW5kb3ciLCJjbGVhclRpbWVvdXQiLCJ0aW1lb3V0SGFuZGxlIiwid29ya2VyIiwic3lzdGVtRGlhZ25vc3RpY0xvZ3MiLCJ1cGRhdGVMb2dGcm9tU2VydmVyIiwic2V0VGltZW91dCIsInN0b3AiLCIkc2hvd0J0biIsIiQiLCIkZG93bmxvYWRCdG4iLCIkc2hvd0F1dG9CdG4iLCJ2aWV3ZXIiLCIkZmlsZVNlbGVjdERyb3BEb3duIiwibG9nc0l0ZW1zIiwiZGVmYXVsdExvZ0l0ZW0iLCIkZGltbWVyIiwiJGZvcm1PYmoiLCIkZmlsZU5hbWUiLCJhY2VIZWlnaHQiLCJpbm5lckhlaWdodCIsImxvYWQiLCJjbG9zZXN0IiwiY3NzIiwiZHJvcGRvd24iLCJ2YWx1ZXMiLCJvbkNoYW5nZSIsImNiT25DaGFuZ2VGaWxlIiwiaWdub3JlQ2FzZSIsImZ1bGxUZXh0U2VhcmNoIiwiZm9yY2VTZWxlY3Rpb24iLCJpbml0aWFsaXplQWNlIiwiUGJ4QXBpIiwiU3lzbG9nR2V0TG9nc0xpc3QiLCJjYkZvcm1hdERyb3Bkb3duUmVzdWx0cyIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZGF0YSIsImZvcm0iLCJTeXNsb2dEb3dubG9hZExvZ0ZpbGUiLCJmaWxlbmFtZSIsImNiRG93bmxvYWRGaWxlIiwiJHJlbG9hZEljb24iLCJmaW5kIiwiaGFzQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImFkZENsYXNzIiwia2V5dXAiLCJldmVudCIsImtleUNvZGUiLCJyb3dzQ291bnQiLCJNYXRoIiwicm91bmQiLCJJbmlNb2RlIiwiYWNlIiwicmVxdWlyZSIsIk1vZGUiLCJlZGl0Iiwic2Vzc2lvbiIsInNldE1vZGUiLCJzZXRUaGVtZSIsInJlc2l6ZSIsInJlbmRlcmVyIiwic2V0U2hvd0d1dHRlciIsInNldE9wdGlvbnMiLCJzaG93TGluZU51bWJlcnMiLCJzaG93UHJpbnRNYXJnaW4iLCJyZWFkT25seSIsIm1heExpbmVzIiwicmVzcG9uc2UiLCJmaWxlcyIsImVhY2giLCJpbmRleCIsIml0ZW0iLCJwdXNoIiwibmFtZSIsInNpemUiLCJ2YWx1ZSIsInBhdGgiLCJzZWxlY3RlZCIsImxlbmd0aCIsInBhcmFtcyIsIlN5c2xvZ0dldExvZ0Zyb21GaWxlIiwiY2JVcGRhdGVMb2dUZXh0IiwiZ2V0U2Vzc2lvbiIsInNldFZhbHVlIiwiY29udGVudCIsInJvdyIsImdldExlbmd0aCIsImNvbHVtbiIsImdldExpbmUiLCJnb3RvTGluZSIsImxvY2F0aW9uIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQU1BO0FBR0EsSUFBTUEsbUJBQW1CLEdBQUc7QUFDM0JDLEVBQUFBLE9BQU8sRUFBRSxJQURrQjtBQUUzQkMsRUFBQUEsYUFBYSxFQUFFLEVBRlk7QUFHM0JDLEVBQUFBLFdBQVcsRUFBRSxDQUhjO0FBSTNCQyxFQUFBQSxVQUoyQjtBQUFBLDBCQUlkO0FBQ1pKLE1BQUFBLG1CQUFtQixDQUFDSyxhQUFwQjtBQUNBOztBQU4wQjtBQUFBO0FBTzNCQSxFQUFBQSxhQVAyQjtBQUFBLDZCQU9YO0FBQ2ZDLE1BQUFBLE1BQU0sQ0FBQ0MsWUFBUCxDQUFvQlAsbUJBQW1CLENBQUNRLGFBQXhDO0FBQ0FSLE1BQUFBLG1CQUFtQixDQUFDUyxNQUFwQjtBQUNBOztBQVYwQjtBQUFBO0FBVzNCQSxFQUFBQSxNQVgyQjtBQUFBLHNCQVdsQjtBQUNSQyxNQUFBQSxvQkFBb0IsQ0FBQ0MsbUJBQXJCO0FBQ0FYLE1BQUFBLG1CQUFtQixDQUFDUSxhQUFwQixHQUFvQ0YsTUFBTSxDQUFDTSxVQUFQLENBQ25DWixtQkFBbUIsQ0FBQ1MsTUFEZSxFQUVuQ1QsbUJBQW1C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LE9BQXJCLENBQTZCOEIsV0FBN0IsQ0FBeUMsUUFBekM7QUFDQTs7QUF6SDJCO0FBQUE7O0FBMEg1Qjs7OztBQUlBSixFQUFBQSxjQTlINEI7QUFBQSw0QkE4SGI0QixRQTlIYSxFQThISjtBQUN2QixVQUFJQSxRQUFRLEtBQUcsS0FBZixFQUFxQjtBQUNwQnRFLFFBQUFBLE1BQU0sQ0FBQzZGLFFBQVAsR0FBa0J2QixRQUFRLENBQUM3QixRQUEzQjtBQUNBO0FBQ0Q7O0FBbEkyQjtBQUFBO0FBQUEsQ0FBN0I7QUFxSUFoQyxDQUFDLENBQUNxRixRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCM0YsRUFBQUEsb0JBQW9CLENBQUNOLFVBQXJCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgwqkgTUlLTyBMTEMgLSBBbGwgUmlnaHRzIFJlc2VydmVkXG4gKiBVbmF1dGhvcml6ZWQgY29weWluZyBvZiB0aGlzIGZpbGUsIHZpYSBhbnkgbWVkaXVtIGlzIHN0cmljdGx5IHByb2hpYml0ZWRcbiAqIFByb3ByaWV0YXJ5IGFuZCBjb25maWRlbnRpYWxcbiAqIFdyaXR0ZW4gYnkgQWxleGV5IFBvcnRub3YsIDggMjAyMFxuICovXG4vKiBnbG9iYWwgYWNlLCBQYnhBcGkgKi9cblxuXG5jb25zdCB1cGRhdGVMb2dWaWV3V29ya2VyID0ge1xuXHR0aW1lT3V0OiAzMDAwLFxuXHR0aW1lT3V0SGFuZGxlOiAnJyxcblx0ZXJyb3JDb3VudHM6IDAsXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dXBkYXRlTG9nVmlld1dvcmtlci5yZXN0YXJ0V29ya2VyKCk7XG5cdH0sXG5cdHJlc3RhcnRXb3JrZXIoKSB7XG5cdFx0d2luZG93LmNsZWFyVGltZW91dCh1cGRhdGVMb2dWaWV3V29ya2VyLnRpbWVvdXRIYW5kbGUpO1xuXHRcdHVwZGF0ZUxvZ1ZpZXdXb3JrZXIud29ya2VyKCk7XG5cdH0sXG5cdHdvcmtlcigpIHtcblx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy51cGRhdGVMb2dGcm9tU2VydmVyKCk7XG5cdFx0dXBkYXRlTG9nVmlld1dvcmtlci50aW1lb3V0SGFuZGxlID0gd2luZG93LnNldFRpbWVvdXQoXG5cdFx0XHR1cGRhdGVMb2dWaWV3V29ya2VyLndvcmtlcixcblx0XHRcdHVwZGF0ZUxvZ1ZpZXdXb3JrZXIudGltZU91dCxcblx0XHQpO1xuXHR9LFxuXHRzdG9wKCkge1xuXHRcdHdpbmRvdy5jbGVhclRpbWVvdXQodXBkYXRlTG9nVmlld1dvcmtlci50aW1lb3V0SGFuZGxlKTtcblx0fVxufTtcblxuY29uc3Qgc3lzdGVtRGlhZ25vc3RpY0xvZ3MgPSB7XG5cdCRzaG93QnRuOiAkKCcjc2hvdy1sYXN0LWxvZycpLFxuXHQkZG93bmxvYWRCdG46ICQoJyNkb3dubG9hZC1maWxlJyksXG5cdCRzaG93QXV0b0J0bjogJCgnI3Nob3ctbGFzdC1sb2ctYXV0bycpLFxuXHR2aWV3ZXI6ICcnLFxuXHQkZmlsZVNlbGVjdERyb3BEb3duOiAkKCcjc3lzdGVtLWRpYWdub3N0aWMtZm9ybSAuZmlsZW5hbWVzLXNlbGVjdCcpLFxuXHRsb2dzSXRlbXM6IFtdLFxuXHRkZWZhdWx0TG9nSXRlbTogbnVsbCxcblx0JGRpbW1lcjogJCgnI2dldC1sb2dzLWRpbW1lcicpLFxuXHQkZm9ybU9iajogJCgnI3N5c3RlbS1kaWFnbm9zdGljLWZvcm0nKSxcblx0JGZpbGVOYW1lOiAkKCcjc3lzdGVtLWRpYWdub3N0aWMtZm9ybSAuZmlsZW5hbWUnKSxcblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRjb25zdCBhY2VIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQtMzAwO1xuXHRcdCQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3MuJGRpbW1lci5jbG9zZXN0KCdkaXYnKS5jc3MoJ21pbi1oZWlnaHQnLCBgJHthY2VIZWlnaHR9cHhgKTtcblx0XHR9KTtcblx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy4kZmlsZVNlbGVjdERyb3BEb3duLmRyb3Bkb3duKFxuXHRcdFx0e1xuXHRcdFx0XHR2YWx1ZXM6IHN5c3RlbURpYWdub3N0aWNMb2dzLmxvZ3NJdGVtcyxcblx0XHRcdFx0b25DaGFuZ2U6IHN5c3RlbURpYWdub3N0aWNMb2dzLmNiT25DaGFuZ2VGaWxlLFxuXHRcdFx0XHRpZ25vcmVDYXNlOiB0cnVlLFxuXHRcdFx0XHRmdWxsVGV4dFNlYXJjaDogdHJ1ZSxcblx0XHRcdFx0Zm9yY2VTZWxlY3Rpb246IGZhbHNlLFxuXHRcdFx0fVxuXHRcdCk7XG5cdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3MuaW5pdGlhbGl6ZUFjZSgpO1xuXHRcdFBieEFwaS5TeXNsb2dHZXRMb2dzTGlzdChzeXN0ZW1EaWFnbm9zdGljTG9ncy5jYkZvcm1hdERyb3Bkb3duUmVzdWx0cyk7XG5cblx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy4kc2hvd0J0bi5vbignY2xpY2snLCAoZSkgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3MudXBkYXRlTG9nRnJvbVNlcnZlcigpO1xuXHRcdH0pO1xuXG5cdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3MuJGRvd25sb2FkQnRuLm9uKCdjbGljaycsIChlKSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRjb25zdCBkYXRhID0gc3lzdGVtRGlhZ25vc3RpY0xvZ3MuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0UGJ4QXBpLlN5c2xvZ0Rvd25sb2FkTG9nRmlsZShkYXRhLmZpbGVuYW1lLCBzeXN0ZW1EaWFnbm9zdGljTG9ncy5jYkRvd25sb2FkRmlsZSk7XG5cdFx0fSk7XG5cblx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy4kc2hvd0F1dG9CdG4ub24oJ2NsaWNrJywgKGUpID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0ICRyZWxvYWRJY29uID0gc3lzdGVtRGlhZ25vc3RpY0xvZ3MuJHNob3dBdXRvQnRuLmZpbmQoJ2kucmVmcmVzaCcpO1xuXHRcdFx0aWYgKCRyZWxvYWRJY29uLmhhc0NsYXNzKCdsb2FkaW5nJykpe1xuXHRcdFx0XHQkcmVsb2FkSWNvbi5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuXHRcdFx0XHR1cGRhdGVMb2dWaWV3V29ya2VyLnN0b3AoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCRyZWxvYWRJY29uLmFkZENsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRcdHVwZGF0ZUxvZ1ZpZXdXb3JrZXIuaW5pdGlhbGl6ZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdCQoJ2lucHV0Jykua2V5dXAoKGV2ZW50KT0+IHtcblx0XHRcdGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuXHRcdFx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy51cGRhdGVMb2dGcm9tU2VydmVyKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGluaXRpYWxpemVBY2UoKSB7XG5cdFx0Y29uc3QgYWNlSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0LTMwMDtcblx0XHRjb25zdCByb3dzQ291bnQgPSBNYXRoLnJvdW5kKGFjZUhlaWdodC8xNS43KTtcblx0XHQkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcblx0XHRcdCQoJy5sb2ctY29udGVudC1yZWFkb25seScpLmNzcygnbWluLWhlaWdodCcsIGAke2FjZUhlaWdodH1weGApO1xuXHRcdH0pO1xuXHRcdGNvbnN0IEluaU1vZGUgPSBhY2UucmVxdWlyZSgnYWNlL21vZGUvanVsaWEnKS5Nb2RlO1xuXHRcdHN5c3RlbURpYWdub3N0aWNMb2dzLnZpZXdlciA9IGFjZS5lZGl0KCdsb2ctY29udGVudC1yZWFkb25seScpO1xuXHRcdHN5c3RlbURpYWdub3N0aWNMb2dzLnZpZXdlci5zZXNzaW9uLnNldE1vZGUobmV3IEluaU1vZGUoKSk7XG5cdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3Mudmlld2VyLnNldFRoZW1lKCdhY2UvdGhlbWUvbW9ub2thaScpO1xuXHRcdHN5c3RlbURpYWdub3N0aWNMb2dzLnZpZXdlci5yZXNpemUoKTtcblx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy52aWV3ZXIucmVuZGVyZXIuc2V0U2hvd0d1dHRlcihmYWxzZSk7XG5cdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3Mudmlld2VyLnNldE9wdGlvbnMoe1xuXHRcdFx0IHNob3dMaW5lTnVtYmVyczpmYWxzZSxcblx0XHRcdCBzaG93UHJpbnRNYXJnaW46IGZhbHNlLFxuXHRcdFx0IHJlYWRPbmx5OiB0cnVlLFxuXHRcdFx0IG1heExpbmVzOiByb3dzQ291bnQsXG5cdFx0IH0pO1xuXHR9LFxuXHQvKipcblx0ICogTWFrZXMgZm9ybWF0dGVkIG1lbnUgc3RydWN0dXJlXG5cdCAqL1xuXHRjYkZvcm1hdERyb3Bkb3duUmVzdWx0cyhyZXNwb25zZSkge1xuXHRcdGlmIChyZXNwb25zZSA9PT1mYWxzZSl7XG5cdFx0XHRyZXR1cm4gO1xuXHRcdH1cblx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy5sb2dzSXRlbXMgPSBbXTtcblx0XHRjb25zdCBmaWxlcyA9IHJlc3BvbnNlLmZpbGVzO1xuXHRcdCQuZWFjaChmaWxlcywgKGluZGV4LCBpdGVtKSA9PiB7XG5cdFx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy5sb2dzSXRlbXMucHVzaCh7XG5cdFx0XHRcdG5hbWU6IGAke2luZGV4fSAoJHtpdGVtLnNpemV9KWAsXG5cdFx0XHRcdHZhbHVlOiBpdGVtLnBhdGgsXG5cdFx0XHRcdHNlbGVjdGVkOiBpdGVtLmRlZmF1bHRcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHN5c3RlbURpYWdub3N0aWNMb2dzLiRmaWxlU2VsZWN0RHJvcERvd24uZHJvcGRvd24oJ2NoYW5nZSB2YWx1ZXMnLCBzeXN0ZW1EaWFnbm9zdGljTG9ncy5sb2dzSXRlbXMpO1xuXHR9LFxuXHQvKipcblx0ICogQ2FsbGJhY2sgYWZ0ZXIgY2hhbmdlIGxvZyBmaWxlIGluIHNlbGVjdFxuXHQgKiBAcGFyYW0gdmFsdWVcblx0ICovXG5cdGNiT25DaGFuZ2VGaWxlKHZhbHVlKSB7XG5cdFx0aWYgKHZhbHVlLmxlbmd0aD09PTApe1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRzeXN0ZW1EaWFnbm9zdGljTG9ncy4kZm9ybU9iai5mb3JtKCdzZXQgdmFsdWUnLCAnZmlsZW5hbWUnLCB2YWx1ZSk7XG5cdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3MudXBkYXRlTG9nRnJvbVNlcnZlcigpO1xuXHR9LFxuXHQvKipcblx0ICogQXNrcyBsb2cgZmlsZSBjb250ZW50IGZyb20gc2VydmVyXG5cdCAqL1xuXHR1cGRhdGVMb2dGcm9tU2VydmVyKCl7XG5cdFx0Y29uc3QgcGFyYW1zID0gc3lzdGVtRGlhZ25vc3RpY0xvZ3MuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFBieEFwaS5TeXNsb2dHZXRMb2dGcm9tRmlsZShwYXJhbXMsIHN5c3RlbURpYWdub3N0aWNMb2dzLmNiVXBkYXRlTG9nVGV4dCk7XG5cdH0sXG5cdC8qKlxuXHQgKiBVcGRhdGVzIGxvZyB2aWV3XG5cdCAqIEBwYXJhbSBkYXRhXG5cdCAqL1xuXHRjYlVwZGF0ZUxvZ1RleHQoZGF0YSkge1xuXHRcdHN5c3RlbURpYWdub3N0aWNMb2dzLnZpZXdlci5nZXRTZXNzaW9uKCkuc2V0VmFsdWUoZGF0YS5jb250ZW50KTtcblx0XHRjb25zdCByb3cgPSBzeXN0ZW1EaWFnbm9zdGljTG9ncy52aWV3ZXIuc2Vzc2lvbi5nZXRMZW5ndGgoKSAtIDE7XG5cdFx0Y29uc3QgY29sdW1uID0gc3lzdGVtRGlhZ25vc3RpY0xvZ3Mudmlld2VyLnNlc3Npb24uZ2V0TGluZShyb3cpLmxlbmd0aDsgLy8gb3Igc2ltcGx5IEluZmluaXR5XG5cdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3Mudmlld2VyLmdvdG9MaW5lKHJvdyArIDEsIGNvbHVtbik7XG5cdFx0c3lzdGVtRGlhZ25vc3RpY0xvZ3MuJGRpbW1lci5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdH0sXG5cdC8qKlxuXHQgKiBBZnRlciBwdXNoIGJ1dHRvbiBkb3dubG9hZCBmaWxlXG5cdCAqIEBwYXJhbSByZXNwb25zZVxuXHQgKi9cblx0Y2JEb3dubG9hZEZpbGUocmVzcG9uc2Upe1xuXHRcdGlmIChyZXNwb25zZSE9PWZhbHNlKXtcblx0XHRcdHdpbmRvdy5sb2NhdGlvbiA9IHJlc3BvbnNlLmZpbGVuYW1lO1xuXHRcdH1cblx0fVxufTtcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRzeXN0ZW1EaWFnbm9zdGljTG9ncy5pbml0aWFsaXplKCk7XG59KTtcblxuIl19