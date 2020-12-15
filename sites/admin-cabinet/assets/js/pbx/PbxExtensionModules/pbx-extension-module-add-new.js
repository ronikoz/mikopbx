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

/* global UserMessage, globalTranslate, PbxApi, upgradeStatusLoopWorker */
var addNewExtension = {
  $uploadButton: $('#add-new-button'),
  $progressBar: $('#upload-progress-bar'),
  $progressBarLabel: $('#upload-progress-bar').find('.label'),
  uploadInProgress: false,
  initialize: function () {
    function initialize() {
      addNewExtension.$progressBar.hide();
      PbxApi.SystemUploadFileAttachToBtn('add-new-button', ['zip'], addNewExtension.cbResumableUploadFile);
    }

    return initialize;
  }(),

  /**
   * Upload file by chunks
   * @param action
   * @param params
   */
  cbResumableUploadFile: function () {
    function cbResumableUploadFile(action, params) {
      switch (action) {
        case 'fileSuccess':
          addNewExtension.checkStatusFileMerging(params.response);
          break;

        case 'uploadStart':
          addNewExtension.uploadInProgress = true;
          addNewExtension.$uploadButton.addClass('loading');
          addNewExtension.$progressBar.show();
          addNewExtension.$progressBarLabel.text(globalTranslate.ext_UploadInProgress);
          break;

        case 'progress':
          addNewExtension.$progressBar.progress({
            percent: parseInt(params.percent, 10)
          });
          break;

        case 'error':
          addNewExtension.$progressBarLabel.text(globalTranslate.ext_UploadError);
          addNewExtension.$uploadButton.removeClass('loading');
          UserMessage.showMultiString(globalTranslate.ext_UploadError);
          break;

        default:
      }
    }

    return cbResumableUploadFile;
  }(),

  /**
   * Wait for file ready to use
   *
   * @param response ответ функции /pbxcore/api/upload/status
   */
  checkStatusFileMerging: function () {
    function checkStatusFileMerging(response) {
      if (response === undefined || PbxApi.tryParseJSON(response) === false) {
        UserMessage.showMultiString("".concat(globalTranslate.ext_UploadError));
        return;
      }

      var json = JSON.parse(response);

      if (json === undefined || json.data === undefined) {
        UserMessage.showMultiString("".concat(globalTranslate.ext_UploadError));
        return;
      }

      var fileID = json.data.upload_id;
      var filePath = json.data.filename;
      mergingCheckWorker.initialize(fileID, filePath);
    }

    return checkStatusFileMerging;
  }()
};
var mergingCheckWorker = {
  timeOut: 3000,
  timeOutHandle: '',
  errorCounts: 0,
  $progressBarLabel: $('#upload-progress-bar').find('.label'),
  fileID: null,
  filePath: '',
  initialize: function () {
    function initialize(fileID, filePath) {
      // Запустим обновление статуса провайдера
      mergingCheckWorker.fileID = fileID;
      mergingCheckWorker.filePath = filePath;
      mergingCheckWorker.restartWorker(fileID);
    }

    return initialize;
  }(),
  restartWorker: function () {
    function restartWorker() {
      window.clearTimeout(mergingCheckWorker.timeoutHandle);
      mergingCheckWorker.worker();
    }

    return restartWorker;
  }(),
  worker: function () {
    function worker() {
      PbxApi.FilesGetStatusUploadFile(mergingCheckWorker.fileID, mergingCheckWorker.cbAfterResponse);
      mergingCheckWorker.timeoutHandle = window.setTimeout(mergingCheckWorker.worker, mergingCheckWorker.timeOut);
    }

    return worker;
  }(),
  cbAfterResponse: function () {
    function cbAfterResponse(response) {
      if (mergingCheckWorker.errorCounts > 10) {
        mergingCheckWorker.$progressBarLabel.text(globalTranslate.ext_UploadError);
        UserMessage.showMultiString(response, globalTranslate.ext_UploadError);
        addNewExtension.$uploadButton.removeClass('loading');
        window.clearTimeout(mergingCheckWorker.timeoutHandle);
      }

      if (response === undefined || Object.keys(response).length === 0) {
        mergingCheckWorker.errorCounts += 1;
        return;
      }

      if (response.d_status === 'UPLOAD_COMPLETE') {
        mergingCheckWorker.$progressBarLabel.text(globalTranslate.ext_InstallationInProgress);
        PbxApi.SystemInstallModule(mergingCheckWorker.filePath, mergingCheckWorker.cbAfterModuleInstall);
        window.clearTimeout(mergingCheckWorker.timeoutHandle);
      } else if (response.d_status !== undefined) {
        mergingCheckWorker.$progressBarLabel.text(globalTranslate.ext_UploadInProgress);
        mergingCheckWorker.errorCounts = 0;
      } else {
        mergingCheckWorker.errorCounts += 1;
      }
    }

    return cbAfterResponse;
  }(),
  cbAfterModuleInstall: function () {
    function cbAfterModuleInstall(response) {
      if (response === true) {
        window.location.reload();
      } else {
        UserMessage.showMultiString(response, globalTranslate.ext_InstallationError);
        addNewExtension.$uploadButton.removeClass('loading');
      }
    }

    return cbAfterModuleInstall;
  }()
};
$(document).ready(function () {
  addNewExtension.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QYnhFeHRlbnNpb25Nb2R1bGVzL3BieC1leHRlbnNpb24tbW9kdWxlLWFkZC1uZXcuanMiXSwibmFtZXMiOlsiYWRkTmV3RXh0ZW5zaW9uIiwiJHVwbG9hZEJ1dHRvbiIsIiQiLCIkcHJvZ3Jlc3NCYXIiLCIkcHJvZ3Jlc3NCYXJMYWJlbCIsImZpbmQiLCJ1cGxvYWRJblByb2dyZXNzIiwiaW5pdGlhbGl6ZSIsImhpZGUiLCJQYnhBcGkiLCJTeXN0ZW1VcGxvYWRGaWxlQXR0YWNoVG9CdG4iLCJjYlJlc3VtYWJsZVVwbG9hZEZpbGUiLCJhY3Rpb24iLCJwYXJhbXMiLCJjaGVja1N0YXR1c0ZpbGVNZXJnaW5nIiwicmVzcG9uc2UiLCJhZGRDbGFzcyIsInNob3ciLCJ0ZXh0IiwiZ2xvYmFsVHJhbnNsYXRlIiwiZXh0X1VwbG9hZEluUHJvZ3Jlc3MiLCJwcm9ncmVzcyIsInBlcmNlbnQiLCJwYXJzZUludCIsImV4dF9VcGxvYWRFcnJvciIsInJlbW92ZUNsYXNzIiwiVXNlck1lc3NhZ2UiLCJzaG93TXVsdGlTdHJpbmciLCJ1bmRlZmluZWQiLCJ0cnlQYXJzZUpTT04iLCJqc29uIiwiSlNPTiIsInBhcnNlIiwiZGF0YSIsImZpbGVJRCIsInVwbG9hZF9pZCIsImZpbGVQYXRoIiwiZmlsZW5hbWUiLCJtZXJnaW5nQ2hlY2tXb3JrZXIiLCJ0aW1lT3V0IiwidGltZU91dEhhbmRsZSIsImVycm9yQ291bnRzIiwicmVzdGFydFdvcmtlciIsIndpbmRvdyIsImNsZWFyVGltZW91dCIsInRpbWVvdXRIYW5kbGUiLCJ3b3JrZXIiLCJGaWxlc0dldFN0YXR1c1VwbG9hZEZpbGUiLCJjYkFmdGVyUmVzcG9uc2UiLCJzZXRUaW1lb3V0IiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImRfc3RhdHVzIiwiZXh0X0luc3RhbGxhdGlvbkluUHJvZ3Jlc3MiLCJTeXN0ZW1JbnN0YWxsTW9kdWxlIiwiY2JBZnRlck1vZHVsZUluc3RhbGwiLCJsb2NhdGlvbiIs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QUNBLE9BSE0sTUFHQTtBQUNOSCxRQUFBQSxrQkFBa0IsQ0FBQ0csV0FBbkIsSUFBa0MsQ0FBbEM7QUFDQTtBQUNEOztBQTdDeUI7QUFBQTtBQThDMUJlLEVBQUFBLG9CQTlDMEI7QUFBQSxrQ0E4Q0x6QyxRQTlDSyxFQThDSTtBQUM3QixVQUFJQSxRQUFRLEtBQUcsSUFBZixFQUFvQjtBQUNuQjRCLFFBQUFBLE1BQU0sQ0FBQ2MsUUFBUCxDQUFnQkMsTUFBaEI7QUFDQSxPQUZELE1BRU87QUFDTmhDLFFBQUFBLFdBQVcsQ0FBQ0MsZUFBWixDQUE0QlosUUFBNUIsRUFBc0NJLGVBQWUsQ0FBQ3dDLHFCQUF0RDtBQUNBM0QsUUFBQUEsZUFBZSxDQUFDQyxhQUFoQixDQUE4QndCLFdBQTlCLENBQTBDLFNBQTFDO0FBQ0E7QUFDRDs7QUFyRHlCO0FBQUE7QUFBQSxDQUEzQjtBQXdEQXZCLENBQUMsQ0FBQzBELFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkI3RCxFQUFBQSxlQUFlLENBQUNPLFVBQWhCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTctMjAyMCBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgVXNlck1lc3NhZ2UsIGdsb2JhbFRyYW5zbGF0ZSwgUGJ4QXBpLCB1cGdyYWRlU3RhdHVzTG9vcFdvcmtlciAqLyBcblxuY29uc3QgYWRkTmV3RXh0ZW5zaW9uID0ge1xuXHQkdXBsb2FkQnV0dG9uOiAkKCcjYWRkLW5ldy1idXR0b24nKSxcblx0JHByb2dyZXNzQmFyOiAkKCcjdXBsb2FkLXByb2dyZXNzLWJhcicpLFxuXHQkcHJvZ3Jlc3NCYXJMYWJlbDogJCgnI3VwbG9hZC1wcm9ncmVzcy1iYXInKS5maW5kKCcubGFiZWwnKSxcblx0dXBsb2FkSW5Qcm9ncmVzczogZmFsc2UsXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0YWRkTmV3RXh0ZW5zaW9uLiRwcm9ncmVzc0Jhci5oaWRlKCk7XG5cdFx0UGJ4QXBpLlN5c3RlbVVwbG9hZEZpbGVBdHRhY2hUb0J0bignYWRkLW5ldy1idXR0b24nLFsnemlwJ10sIGFkZE5ld0V4dGVuc2lvbi5jYlJlc3VtYWJsZVVwbG9hZEZpbGUpO1xuXHR9LFxuXHQvKipcblx0ICogVXBsb2FkIGZpbGUgYnkgY2h1bmtzXG5cdCAqIEBwYXJhbSBhY3Rpb25cblx0ICogQHBhcmFtIHBhcmFtc1xuXHQgKi9cblx0Y2JSZXN1bWFibGVVcGxvYWRGaWxlKGFjdGlvbiwgcGFyYW1zKXtcblx0XHRzd2l0Y2ggKGFjdGlvbikge1xuXHRcdFx0Y2FzZSAnZmlsZVN1Y2Nlc3MnOlxuXHRcdFx0XHRhZGROZXdFeHRlbnNpb24uY2hlY2tTdGF0dXNGaWxlTWVyZ2luZyhwYXJhbXMucmVzcG9uc2UpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3VwbG9hZFN0YXJ0Jzpcblx0XHRcdFx0YWRkTmV3RXh0ZW5zaW9uLnVwbG9hZEluUHJvZ3Jlc3MgPSB0cnVlO1xuXHRcdFx0XHRhZGROZXdFeHRlbnNpb24uJHVwbG9hZEJ1dHRvbi5hZGRDbGFzcygnbG9hZGluZycpO1xuXHRcdFx0XHRhZGROZXdFeHRlbnNpb24uJHByb2dyZXNzQmFyLnNob3coKTtcblx0XHRcdFx0YWRkTmV3RXh0ZW5zaW9uLiRwcm9ncmVzc0JhckxhYmVsLnRleHQoZ2xvYmFsVHJhbnNsYXRlLmV4dF9VcGxvYWRJblByb2dyZXNzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdwcm9ncmVzcyc6XG5cdFx0XHRcdGFkZE5ld0V4dGVuc2lvbi4kcHJvZ3Jlc3NCYXIucHJvZ3Jlc3Moe1xuXHRcdFx0XHRcdHBlcmNlbnQ6IHBhcnNlSW50KHBhcmFtcy5wZXJjZW50LCAxMCksXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2Vycm9yJzpcblx0XHRcdFx0YWRkTmV3RXh0ZW5zaW9uLiRwcm9ncmVzc0JhckxhYmVsLnRleHQoZ2xvYmFsVHJhbnNsYXRlLmV4dF9VcGxvYWRFcnJvcik7XG5cdFx0XHRcdGFkZE5ld0V4dGVuc2lvbi4kdXBsb2FkQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhnbG9iYWxUcmFuc2xhdGUuZXh0X1VwbG9hZEVycm9yKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFdhaXQgZm9yIGZpbGUgcmVhZHkgdG8gdXNlXG5cdCAqXG5cdCAqIEBwYXJhbSByZXNwb25zZSDQvtGC0LLQtdGCINGE0YPQvdC60YbQuNC4IC9wYnhjb3JlL2FwaS91cGxvYWQvc3RhdHVzXG5cdCAqL1xuXHRjaGVja1N0YXR1c0ZpbGVNZXJnaW5nKHJlc3BvbnNlKSB7XG5cdFx0aWYgKHJlc3BvbnNlID09PSB1bmRlZmluZWQgfHwgUGJ4QXBpLnRyeVBhcnNlSlNPTihyZXNwb25zZSkgPT09IGZhbHNlKSB7XG5cdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcoYCR7Z2xvYmFsVHJhbnNsYXRlLmV4dF9VcGxvYWRFcnJvcn1gKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QganNvbiA9IEpTT04ucGFyc2UocmVzcG9uc2UpO1xuXHRcdGlmIChqc29uID09PSB1bmRlZmluZWQgfHwganNvbi5kYXRhID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhgJHtnbG9iYWxUcmFuc2xhdGUuZXh0X1VwbG9hZEVycm9yfWApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBmaWxlSUQgPSBqc29uLmRhdGEudXBsb2FkX2lkO1xuXHRcdGNvbnN0IGZpbGVQYXRoID0ganNvbi5kYXRhLmZpbGVuYW1lO1xuXHRcdG1lcmdpbmdDaGVja1dvcmtlci5pbml0aWFsaXplKGZpbGVJRCwgZmlsZVBhdGgpO1xuXHR9LFxuXG59O1xuXG5jb25zdCBtZXJnaW5nQ2hlY2tXb3JrZXIgPSB7XG5cdHRpbWVPdXQ6IDMwMDAsXG5cdHRpbWVPdXRIYW5kbGU6ICcnLFxuXHRlcnJvckNvdW50czogMCxcblx0JHByb2dyZXNzQmFyTGFiZWw6ICQoJyN1cGxvYWQtcHJvZ3Jlc3MtYmFyJykuZmluZCgnLmxhYmVsJyksXG5cdGZpbGVJRDogbnVsbCxcblx0ZmlsZVBhdGg6ICcnLFxuXHRpbml0aWFsaXplKGZpbGVJRCwgZmlsZVBhdGgpIHtcblx0XHQvLyDQl9Cw0L/Rg9GB0YLQuNC8INC+0LHQvdC+0LLQu9C10L3QuNC1INGB0YLQsNGC0YPRgdCwINC/0YDQvtCy0LDQudC00LXRgNCwXG5cdFx0bWVyZ2luZ0NoZWNrV29ya2VyLmZpbGVJRCA9IGZpbGVJRDtcblx0XHRtZXJnaW5nQ2hlY2tXb3JrZXIuZmlsZVBhdGggPSBmaWxlUGF0aDtcblx0XHRtZXJnaW5nQ2hlY2tXb3JrZXIucmVzdGFydFdvcmtlcihmaWxlSUQpO1xuXHR9LFxuXHRyZXN0YXJ0V29ya2VyKCkge1xuXHRcdHdpbmRvdy5jbGVhclRpbWVvdXQobWVyZ2luZ0NoZWNrV29ya2VyLnRpbWVvdXRIYW5kbGUpO1xuXHRcdG1lcmdpbmdDaGVja1dvcmtlci53b3JrZXIoKTtcblx0fSxcblx0d29ya2VyKCkge1xuXHRcdFBieEFwaS5GaWxlc0dldFN0YXR1c1VwbG9hZEZpbGUobWVyZ2luZ0NoZWNrV29ya2VyLmZpbGVJRCwgbWVyZ2luZ0NoZWNrV29ya2VyLmNiQWZ0ZXJSZXNwb25zZSk7XG5cdFx0bWVyZ2luZ0NoZWNrV29ya2VyLnRpbWVvdXRIYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dChcblx0XHRcdG1lcmdpbmdDaGVja1dvcmtlci53b3JrZXIsXG5cdFx0XHRtZXJnaW5nQ2hlY2tXb3JrZXIudGltZU91dCxcblx0XHQpO1xuXHR9LFxuXHRjYkFmdGVyUmVzcG9uc2UocmVzcG9uc2UpIHtcblx0XHRpZiAobWVyZ2luZ0NoZWNrV29ya2VyLmVycm9yQ291bnRzID4gMTApIHtcblx0XHRcdG1lcmdpbmdDaGVja1dvcmtlci4kcHJvZ3Jlc3NCYXJMYWJlbC50ZXh0KGdsb2JhbFRyYW5zbGF0ZS5leHRfVXBsb2FkRXJyb3IpO1xuXHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLCBnbG9iYWxUcmFuc2xhdGUuZXh0X1VwbG9hZEVycm9yKTtcblx0XHRcdGFkZE5ld0V4dGVuc2lvbi4kdXBsb2FkQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KG1lcmdpbmdDaGVja1dvcmtlci50aW1lb3V0SGFuZGxlKTtcblx0XHR9XG5cdFx0aWYgKHJlc3BvbnNlID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmtleXMocmVzcG9uc2UpLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0bWVyZ2luZ0NoZWNrV29ya2VyLmVycm9yQ291bnRzICs9IDE7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChyZXNwb25zZS5kX3N0YXR1cyA9PT0gJ1VQTE9BRF9DT01QTEVURScpIHtcblx0XHRcdG1lcmdpbmdDaGVja1dvcmtlci4kcHJvZ3Jlc3NCYXJMYWJlbC50ZXh0KGdsb2JhbFRyYW5zbGF0ZS5leHRfSW5zdGFsbGF0aW9uSW5Qcm9ncmVzcyk7XG5cdFx0XHRQYnhBcGkuU3lzdGVtSW5zdGFsbE1vZHVsZShtZXJnaW5nQ2hlY2tXb3JrZXIuZmlsZVBhdGgsIG1lcmdpbmdDaGVja1dvcmtlci5jYkFmdGVyTW9kdWxlSW5zdGFsbCk7XG5cdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KG1lcmdpbmdDaGVja1dvcmtlci50aW1lb3V0SGFuZGxlKTtcblx0XHR9IGVsc2UgaWYgKHJlc3BvbnNlLmRfc3RhdHVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdG1lcmdpbmdDaGVja1dvcmtlci4kcHJvZ3Jlc3NCYXJMYWJlbC50ZXh0KGdsb2JhbFRyYW5zbGF0ZS5leHRfVXBsb2FkSW5Qcm9ncmVzcyk7XG5cdFx0XHRtZXJnaW5nQ2hlY2tXb3JrZXIuZXJyb3JDb3VudHMgPSAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtZXJnaW5nQ2hlY2tXb3JrZXIuZXJyb3JDb3VudHMgKz0gMTtcblx0XHR9XG5cdH0sXG5cdGNiQWZ0ZXJNb2R1bGVJbnN0YWxsKHJlc3BvbnNlKXtcblx0XHRpZiAocmVzcG9uc2U9PT10cnVlKXtcblx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLCBnbG9iYWxUcmFuc2xhdGUuZXh0X0luc3RhbGxhdGlvbkVycm9yKTtcblx0XHRcdGFkZE5ld0V4dGVuc2lvbi4kdXBsb2FkQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0fVxuXHR9LFxufTtcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRhZGROZXdFeHRlbnNpb24uaW5pdGlhbGl6ZSgpO1xufSk7XG4iXX0=