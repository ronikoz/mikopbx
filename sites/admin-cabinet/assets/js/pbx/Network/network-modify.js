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

/* global globalRootUrl,globalTranslate, Form, PbxApi */
var networks = {
  $getMyIpButton: $('#getmyip'),
  $formObj: $('#network-form'),
  $dropDowns: $('#network-form .dropdown'),
  $extipaddr: $('#extipaddr'),
  $ipaddressInput: $('.ipaddress'),
  vlansArray: {},
  validateRules: {
    gateway: {
      optional: true,
      rules: [{
        type: 'ipaddr',
        prompt: globalTranslate.nw_ValidateIppaddrNotRight
      }]
    },
    primarydns: {
      optional: true,
      rules: [{
        type: 'ipaddr',
        prompt: globalTranslate.nw_ValidateIppaddrNotRight
      }]
    },
    secondarydns: {
      optional: true,
      rules: [{
        type: 'ipaddr',
        prompt: globalTranslate.nw_ValidateIppaddrNotRight
      }]
    },
    extipaddr: {
      optional: true,
      rules: [{
        type: 'ipaddrWithPortOptional',
        prompt: globalTranslate.nw_ValidateExtIppaddrNotRight
      }, {
        type: 'extenalIpHost',
        prompt: globalTranslate.nw_ValidateExtIppaddrOrHostIsEmpty
      }]
    },
    exthostname: {
      depends: 'usenat',
      rules: [{
        type: 'extenalIpHost',
        prompt: globalTranslate.nw_ValidateExtIppaddrOrHostIsEmpty
      }]
    }
  },
  initialize: function () {
    function initialize() {
      networks.toggleDisabledFieldClass();
      $('#eth-interfaces-menu .item').tab();
      $('#usenat-checkbox').checkbox({
        onChange: function () {
          function onChange() {
            networks.toggleDisabledFieldClass();
          }

          return onChange;
        }()
      });
      networks.$dropDowns.dropdown();
      $('.dhcp-checkbox').checkbox({
        onChange: function () {
          function onChange() {
            networks.toggleDisabledFieldClass();
          }

          return onChange;
        }()
      });
      networks.$getMyIpButton.on('click', function (e) {
        e.preventDefault();
        networks.$getMyIpButton.addClass('loading disabled');
        PbxApi.GetExternalIp(networks.cbAfterGetExternalIp);
      }); // Удаление дополнительного сетевого интерфейса

      $('.delete-interface').api({
        url: "".concat(globalRootUrl, "network/delete/{value}"),
        method: 'POST',
        beforeSend: function () {
          function beforeSend(settings) {
            $(this).addClass('loading disabled');
            return settings;
          }

          return beforeSend;
        }(),
        onSuccess: function () {
          function onSuccess(response) {
            $(this).removeClass('loading disabled');
            $('.ui.message.ajax').remove();
            $.each(response.message, function (index, value) {
              networks.$formObj.after("<div class=\"ui ".concat(index, " message ajax\">").concat(value, "</div>"));
            });
            if (response.success) window.location.reload();
          }

          return onSuccess;
        }(),
        onFailure: function () {
          function onFailure(response) {
            $(this).removeClass('loading disabled');
            $('form').after(response);
          }

          return onFailure;
        }()
      }); // Очистка настроек дополнительного сетевого

      $('.delete-interface-0').on('click', function () {
        var initialValues = {
          interface_0: '',
          name_0: '',
          dhcp_0: 'on',
          ipaddr_0: '',
          subnet_0: '0'
        };
        networks.$formObj.form('set values', initialValues);
        $('#interface_0').dropdown('restore defaults');
        $('#dhcp-0-checkbox').checkbox('check');
        $('#eth-interfaces-menu .item').tab('change tab', $('#eth-interfaces-menu a.item').first().attr('data-tab'));
      });
      networks.$ipaddressInput.inputmask({
        alias: 'ip',
        'placeholder': '_'
      });
      networks.initializeForm();
    }

    return initialize;
  }(),

  /**
   * Gets external IP by request to remote server
   */
  cbAfterGetExternalIp: function () {
    function cbAfterGetExternalIp(response) {
      if (response === false) {
        networks.$getMyIpButton.removeClass('loading disabled');
      } else {
        networks.$formObj.form('set value', 'extipaddr', response.ip);
        networks.$extipaddr.trigger('change');
        networks.$getMyIpButton.removeClass('loading disabled');
      }
    }

    return cbAfterGetExternalIp;
  }(),
  toggleDisabledFieldClass: function () {
    function toggleDisabledFieldClass() {
      $('#eth-interfaces-menu a').each(function (index, obj) {
        var eth = $(obj).attr('data-tab');

        if ($("#dhcp-".concat(eth, "-checkbox")).checkbox('is unchecked')) {
          $("#ip-address-group-".concat(eth)).removeClass('disabled');
          $("#not-dhcp-".concat(eth)).val('1');
        } else {
          $("#ip-address-group-".concat(eth)).addClass('disabled');
          $("#not-dhcp-".concat(eth)).val('');
        }

        networks.addNewFormRules(eth);
      });

      if ($('#usenat-checkbox').checkbox('is checked')) {
        $('.nated-settings-group').removeClass('disabled');
      } else {
        $('.nated-settings-group').addClass('disabled');
      }
    }

    return toggleDisabledFieldClass;
  }(),
  addNewFormRules: function () {
    function addNewFormRules(newRowId) {
      var nameClass = "name_".concat(newRowId);
      networks.validateRules[nameClass] = {
        identifier: nameClass,
        depends: "interface_".concat(newRowId),
        rules: [{
          type: 'empty',
          prompt: globalTranslate.nw_ValidateNameIsNotBeEmpty
        }]
      };
      var vlanClass = "vlanid_".concat(newRowId);
      networks.validateRules[vlanClass] = {
        depends: "interface_".concat(newRowId),
        identifier: vlanClass,
        rules: [{
          type: 'integer[0..4095]',
          prompt: globalTranslate.nw_ValidateVlanRange
        }, {
          type: "checkVlan[".concat(newRowId, "]"),
          prompt: globalTranslate.nw_ValidateVlanCross
        }]
      };
      var ipaddrClass = "ipaddr_".concat(newRowId);
      networks.validateRules[ipaddrClass] = {
        identifier: ipaddrClass,
        depends: "not-dhcp-".concat(newRowId),
        rules: [{
          type: 'empty',
          prompt: globalTranslate.nw_ValidateIppaddrIsEmpty
        }, {
          type: 'ipaddr',
          prompt: globalTranslate.nw_ValidateIppaddrNotRight
        }]
      };
      var dhcpClass = "dhcp_".concat(newRowId);
      networks.validateRules[dhcpClass] = {
        identifier: dhcpClass,
        depends: "interface_".concat(newRowId),
        rules: [{
          type: "dhcpOnVlanNetworks[".concat(newRowId, "]"),
          prompt: globalTranslate.nw_ValidateDHCPOnVlansDontSupport
        }]
      };
    }

    return addNewFormRules;
  }(),
  cbBeforeSendForm: function () {
    function cbBeforeSendForm(settings) {
      var result = settings;
      result.data = networks.$formObj.form('get values');
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
      Form.$formObj = networks.$formObj;
      Form.url = "".concat(globalRootUrl, "network/save");
      Form.validateRules = networks.validateRules;
      Form.cbBeforeSendForm = networks.cbBeforeSendForm;
      Form.cbAfterSendForm = networks.cbAfterSendForm;
      Form.initialize();
    }

    return initializeForm;
  }()
};

$.fn.form.settings.rules.ipaddr = function (value) {
  var result = true;
  var f = value.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

  if (f == null) {
    result = false;
  } else {
    for (var i = 1; i < 5; i += 1) {
      var a = f[i];

      if (a > 255) {
        result = false;
      }
    }

    if (f[5] > 32) {
      result = false;
    }
  }

  return result;
};

$.fn.form.settings.rules.ipaddrWithPortOptional = function (value) {
  var result = true;
  var f = value.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(:[0-9]+)?$/);

  if (f == null) {
    result = false;
  } else {
    for (var i = 1; i < 5; i += 1) {
      var a = f[i];

      if (a > 255) {
        result = false;
      }
    }

    if (f[5] > 32) {
      result = false;
    }
  }

  return result;
};

$.fn.form.settings.rules.checkVlan = function (vlanValue, param) {
  var result = true;
  var vlansArray = {};
  var allValues = networks.$formObj.form('get values');

  if (allValues.interface_0 !== undefined && allValues.interface_0 > 0) {
    var newEthName = allValues["interface_".concat(allValues.interface_0)];
    vlansArray[newEthName] = [allValues.vlanid_0];

    if (allValues.vlanid_0 === '') {
      result = false;
    }
  }

  $.each(allValues, function (index, value) {
    if (index === 'interface_0' || index === 'vlanid_0') return;

    if (index.indexOf('vlanid') >= 0) {
      var ethName = allValues["interface_".concat(index.split('_')[1])];

      if ($.inArray(value, vlansArray[ethName]) >= 0 && vlanValue === value && param === index.split('_')[1]) {
        result = false;
      } else {
        if (!(ethName in vlansArray)) {
          vlansArray[ethName] = [];
        }

        vlansArray[ethName].push(value);
      }
    }
  });
  return result;
};

$.fn.form.settings.rules.dhcpOnVlanNetworks = function (value, param) {
  var result = true;
  var vlanValue = networks.$formObj.form('get value', "vlanid_".concat(param));
  var dhcpValue = networks.$formObj.form('get value', "dhcp_".concat(param));

  if (vlanValue > 0 && dhcpValue === 'on') {
    result = false;
  }

  return result;
};

$.fn.form.settings.rules.extenalIpHost = function () {
  var allValues = networks.$formObj.form('get values');

  if (allValues.usenat === 'on') {
    if (allValues.exthostname === '' && allValues.extipaddr === '') {
      return false;
    }
  }

  return true;
};

$(document).ready(function () {
  networks.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9OZXR3b3JrL25ldHdvcmstbW9kaWZ5LmpzIl0sIm5hbWVzIjpbIm5ldHdvcmtzIiwiJGdldE15SXBCdXR0b24iLCIkIiwiJGZvcm1PYmoiLCIkZHJvcERvd25zIiwiJGV4dGlwYWRkciIsIiRpcGFkZHJlc3NJbnB1dCIsInZsYW5zQXJyYXkiLCJ2YWxpZGF0ZVJ1bGVzIiwiZ2F0ZXdheSIsIm9wdGlvbmFsIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibndfVmFsaWRhdGVJcHBhZGRyTm90UmlnaHQiLCJwcmltYXJ5ZG5zIiwic2Vjb25kYXJ5ZG5zIiwiZXh0aXBhZGRyIiwibndfVmFsaWRhdGVFeHRJcHBhZGRyTm90UmlnaHQiLCJud19WYWxpZGF0ZUV4dElwcGFkZHJPckhvc3RJc0VtcHR5IiwiZXh0aG9zdG5hbWUiLCJkZXBlbmRzIiwiaW5pdGlhbGl6ZSIsInRvZ2dsZURpc2FibGVkRmllbGRDbGFzcyIsInRhYiIsImNoZWNrYm94Iiwib25DaGFuZ2UiLCJkcm9wZG93biIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0IiwiYWRkQ2xhc3MiLCJQYnhBcGkiLCJHZXRFeHRlcm5hbElwIiwiY2JBZnRlckdldEV4dGVybmFsSXAiLCJhcGkiLCJ1cmwiLCJnbG9iYWxSb290VXJsIiwibWV0aG9kIiwiYmVmb3JlU2VuZCIsInNldHRpbmdzIiwib25TdWNjZXNzIiwicmVzcG9uc2UiLCJyZW1vdmVDbGFzcyIsInJlbW92ZSIsImVhY2giLCJtZXNzYWdlIiwiaW5kZXgiLCJ2YWx1ZSIsImFmdGVyIiwic3VjY2VzcyIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVsb2FkIiwib25GYWlsdXJlIiwiaW5pdGlhbFZhbHVlcyIsImludGVyZmFjZV8wIiwibmFtZV8wIiwiZGhjcF8wIiwiaXBhZGRyXzAiLCJzdWJuZXRfMCIsImZvcm0iLCJmaXJzdCIsImF0dHIiLCJpbnB1dG1hc2siLCJhbGlhcyIsImluaXRpYWxpemVGb3JtIiwiaXAiLCJ0cmlnZ2VyIiwib2JqIiwiZXRoIiwidmFsIiwiYWRkTmV3Rm9ybVJ1bGVzIiwibmV3Um93SWQiLCJuYW1lQ2xhc3MiLCJpZGVudGlmaWVyIiwibndfVmFsaWRhdGVOYW1lSXNOb3RCZUVtcHR5IiwidmxhbkNsYXNzIiwibndfVmFsaWRhdGVWbGFuUmFuZ2UiLCJud19WYWxpZGF0ZVZsYW5Dcm9zcyIsImlwYWRkckNsYXNzIiwibndfVmFsaWRhdGVJcHBhZGRySXNFbXB0eSIsImRoY3BDbGFzcyIsIm53X1ZhbGlkYXRlREhDUE9uVmxhbnNEb250U3VwcG9ydCIsImNiQmVmb3JlU2VuZEZvcm0iLCJyZXN1bHQiLCJkYXRhIiwiY2JBZnRlclNlbmRGb3JtIiwiRm9ybSIsImZuIiwiaXBhZGRyIiwiZiIsIm1hdGNoIiwiaSIsImEiLCJpcGFkZHJXaXRoUG9ydE9wdGlvbmFsIiwiY2hlY2tWbGFuIiwidmxhblZhbHVlIiwicGFyYW0iLCJhbGxWYWx1ZXMiLCJ1bmRlZmluZWQiLCJuZXdFdGhOYW1lIiwidmxhbmlkXzAiLCJpbmRleE9mIiwiZXRoTmFtZSIsInNwbGl0IiwiaW5BcnJheSIsInB1c2giLCJkaGNwT25WbGFuTmV0d29ya3MiLCJkaGNwVmFsdWUiLCJleHRlbmFsSXBIb3N0IiwidXNlbmF0IiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBO0FBRUEsSUFBTUEsUUFBUSxHQUFHO0FBQ2hCQyxFQUFBQSxjQUFjLEVBQUVDLENBQUMsQ0FBQyxVQUFELENBREQ7QUFFaEJDLEVBQUFBLFFBQVEsRUFBRUQsQ0FBQyxDQUFDLGVBQUQsQ0FGSztBQUdoQkUsRUFBQUEsVUFBVSxFQUFFRixDQUFDLENBQUMseUJBQUQsQ0FIRztBQUloQkcsRUFBQUEsVUFBVSxFQUFDSCxDQUFDLENBQUMsWUFBRCxDQUpJO0FBS2hCSSxFQUFBQSxlQUFlLEVBQUVKLENBQUMsQ0FBQyxZQUFELENBTEY7QUFNaEJLLEVBQUFBLFVBQVUsRUFBRSxF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LEtBQUssSUFBbkMsRUFBeUM7QUFDeEN4QixJQUFBQSxNQUFNLEdBQUcsS0FBVDtBQUNBOztBQUNELFNBQU9BLE1BQVA7QUFDQSxDQVJEOztBQVVBcEYsQ0FBQyxDQUFDd0YsRUFBRixDQUFLNUIsSUFBTCxDQUFVckIsUUFBVixDQUFtQjlCLEtBQW5CLENBQXlCb0csYUFBekIsR0FBeUMsWUFBTTtBQUM5QyxNQUFNWCxTQUFTLEdBQUdwRyxRQUFRLENBQUNHLFFBQVQsQ0FBa0IyRCxJQUFsQixDQUF1QixZQUF2QixDQUFsQjs7QUFDQSxNQUFJc0MsU0FBUyxDQUFDWSxNQUFWLEtBQXFCLElBQXpCLEVBQStCO0FBQzlCLFFBQUlaLFNBQVMsQ0FBQy9FLFdBQVYsS0FBMEIsRUFBMUIsSUFBZ0MrRSxTQUFTLENBQUNsRixTQUFWLEtBQXdCLEVBQTVELEVBQWdFO0FBQy9ELGFBQU8sS0FBUDtBQUNBO0FBQ0Q7O0FBQ0QsU0FBTyxJQUFQO0FBQ0EsQ0FSRDs7QUFVQWhCLENBQUMsQ0FBQytHLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJsSCxFQUFBQSxRQUFRLENBQUN1QixVQUFUO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTctMjAyMCBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCxnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIFBieEFwaSAqL1xuXG5jb25zdCBuZXR3b3JrcyA9IHtcblx0JGdldE15SXBCdXR0b246ICQoJyNnZXRteWlwJyksXG5cdCRmb3JtT2JqOiAkKCcjbmV0d29yay1mb3JtJyksXG5cdCRkcm9wRG93bnM6ICQoJyNuZXR3b3JrLWZvcm0gLmRyb3Bkb3duJyksXG5cdCRleHRpcGFkZHI6JCgnI2V4dGlwYWRkcicpLFxuXHQkaXBhZGRyZXNzSW5wdXQ6ICQoJy5pcGFkZHJlc3MnKSxcblx0dmxhbnNBcnJheToge30sXG5cdHZhbGlkYXRlUnVsZXM6IHtcblx0XHRnYXRld2F5OiB7XG5cdFx0XHRvcHRpb25hbDogdHJ1ZSxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnaXBhZGRyJyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5ud19WYWxpZGF0ZUlwcGFkZHJOb3RSaWdodCxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRwcmltYXJ5ZG5zOiB7XG5cdFx0XHRvcHRpb25hbDogdHJ1ZSxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnaXBhZGRyJyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5ud19WYWxpZGF0ZUlwcGFkZHJOb3RSaWdodCxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRzZWNvbmRhcnlkbnM6IHtcblx0XHRcdG9wdGlvbmFsOiB0cnVlLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdpcGFkZHInLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm53X1ZhbGlkYXRlSXBwYWRkck5vdFJpZ2h0LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGV4dGlwYWRkcjoge1xuXHRcdFx0b3B0aW9uYWw6IHRydWUsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2lwYWRkcldpdGhQb3J0T3B0aW9uYWwnLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm53X1ZhbGlkYXRlRXh0SXBwYWRkck5vdFJpZ2h0LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2V4dGVuYWxJcEhvc3QnLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm53X1ZhbGlkYXRlRXh0SXBwYWRkck9ySG9zdElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0ZXh0aG9zdG5hbWU6IHtcblx0XHRcdGRlcGVuZHM6ICd1c2VuYXQnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdleHRlbmFsSXBIb3N0Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5ud19WYWxpZGF0ZUV4dElwcGFkZHJPckhvc3RJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXHRpbml0aWFsaXplKCkge1xuXHRcdG5ldHdvcmtzLnRvZ2dsZURpc2FibGVkRmllbGRDbGFzcygpO1xuXHRcdCQoJyNldGgtaW50ZXJmYWNlcy1tZW51IC5pdGVtJykudGFiKCk7XG5cblx0XHQkKCcjdXNlbmF0LWNoZWNrYm94JykuY2hlY2tib3goe1xuXHRcdFx0b25DaGFuZ2UoKSB7XG5cdFx0XHRcdG5ldHdvcmtzLnRvZ2dsZURpc2FibGVkRmllbGRDbGFzcygpO1xuXHRcdFx0fSxcblx0XHR9KTtcblx0XHRuZXR3b3Jrcy4kZHJvcERvd25zLmRyb3Bkb3duKCk7XG5cdFx0JCgnLmRoY3AtY2hlY2tib3gnKVxuXHRcdFx0LmNoZWNrYm94KHtcblx0XHRcdFx0b25DaGFuZ2UoKSB7XG5cdFx0XHRcdFx0bmV0d29ya3MudG9nZ2xlRGlzYWJsZWRGaWVsZENsYXNzKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblx0XHRuZXR3b3Jrcy4kZ2V0TXlJcEJ1dHRvbi5vbignY2xpY2snLCAoZSkgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0bmV0d29ya3MuJGdldE15SXBCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFBieEFwaS5HZXRFeHRlcm5hbElwKG5ldHdvcmtzLmNiQWZ0ZXJHZXRFeHRlcm5hbElwKTtcblx0XHR9KTtcblxuXHRcdC8vINCj0LTQsNC70LXQvdC40LUg0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90L7Qs9C+INGB0LXRgtC10LLQvtCz0L4g0LjQvdGC0LXRgNGE0LXQudGB0LBcblx0XHQkKCcuZGVsZXRlLWludGVyZmFjZScpLmFwaSh7XG5cdFx0XHR1cmw6IGAke2dsb2JhbFJvb3RVcmx9bmV0d29yay9kZWxldGUve3ZhbHVlfWAsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXG5cdFx0XHRvblN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5tZXNzYWdlLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0bmV0d29ya3MuJGZvcm1PYmouYWZ0ZXIoYDxkaXYgY2xhc3M9XCJ1aSAke2luZGV4fSBtZXNzYWdlIGFqYXhcIj4ke3ZhbHVlfTwvZGl2PmApO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdH0sXG5cblx0XHRcdG9uRmFpbHVyZShyZXNwb25zZSkge1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJ2Zvcm0nKS5hZnRlcihyZXNwb25zZSk7XG5cdFx0XHR9LFxuXHRcdH0pO1xuXG5cdFx0Ly8g0J7Rh9C40YHRgtC60LAg0L3QsNGB0YLRgNC+0LXQuiDQtNC+0L/QvtC70L3QuNGC0LXQu9GM0L3QvtCz0L4g0YHQtdGC0LXQstC+0LPQvlxuXHRcdCQoJy5kZWxldGUtaW50ZXJmYWNlLTAnKS5vbignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBpbml0aWFsVmFsdWVzID0ge1xuXHRcdFx0XHRpbnRlcmZhY2VfMDogJycsXG5cdFx0XHRcdG5hbWVfMDogJycsXG5cdFx0XHRcdGRoY3BfMDogJ29uJyxcblx0XHRcdFx0aXBhZGRyXzA6ICcnLFxuXHRcdFx0XHRzdWJuZXRfMDogJzAnLFxuXHRcdFx0fTtcblx0XHRcdG5ldHdvcmtzLiRmb3JtT2JqLmZvcm0oJ3NldCB2YWx1ZXMnLCBpbml0aWFsVmFsdWVzKTtcblx0XHRcdCQoJyNpbnRlcmZhY2VfMCcpLmRyb3Bkb3duKCdyZXN0b3JlIGRlZmF1bHRzJyk7XG5cdFx0XHQkKCcjZGhjcC0wLWNoZWNrYm94JykuY2hlY2tib3goJ2NoZWNrJyk7XG5cdFx0XHQkKCcjZXRoLWludGVyZmFjZXMtbWVudSAuaXRlbScpLnRhYignY2hhbmdlIHRhYicsICQoJyNldGgtaW50ZXJmYWNlcy1tZW51IGEuaXRlbScpLmZpcnN0KCkuYXR0cignZGF0YS10YWInKSk7XG5cdFx0fSk7XG5cdFx0bmV0d29ya3MuJGlwYWRkcmVzc0lucHV0LmlucHV0bWFzayh7YWxpYXM6ICdpcCcsICdwbGFjZWhvbGRlcic6ICdfJ30pO1xuXG5cdFx0bmV0d29ya3MuaW5pdGlhbGl6ZUZvcm0oKTtcblx0fSxcblx0LyoqXG5cdCAqIEdldHMgZXh0ZXJuYWwgSVAgYnkgcmVxdWVzdCB0byByZW1vdGUgc2VydmVyXG5cdCAqL1xuXHRjYkFmdGVyR2V0RXh0ZXJuYWxJcChyZXNwb25zZSkge1xuXHRcdGlmIChyZXNwb25zZSA9PT0gZmFsc2UpIHtcblx0XHRcdG5ldHdvcmtzLiRnZXRNeUlwQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5ldHdvcmtzLiRmb3JtT2JqLmZvcm0oJ3NldCB2YWx1ZScsICdleHRpcGFkZHInLCByZXNwb25zZS5pcCk7XG5cdFx0XHRuZXR3b3Jrcy4kZXh0aXBhZGRyLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHRcdFx0bmV0d29ya3MuJGdldE15SXBCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHR9XG5cdH0sXG5cdHRvZ2dsZURpc2FibGVkRmllbGRDbGFzcygpIHtcblx0XHQkKCcjZXRoLWludGVyZmFjZXMtbWVudSBhJykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0Y29uc3QgZXRoID0gJChvYmopLmF0dHIoJ2RhdGEtdGFiJyk7XG5cdFx0XHRpZiAoJChgI2RoY3AtJHtldGh9LWNoZWNrYm94YCkuY2hlY2tib3goJ2lzIHVuY2hlY2tlZCcpKSB7XG5cdFx0XHRcdCQoYCNpcC1hZGRyZXNzLWdyb3VwLSR7ZXRofWApLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKGAjbm90LWRoY3AtJHtldGh9YCkudmFsKCcxJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKGAjaXAtYWRkcmVzcy1ncm91cC0ke2V0aH1gKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRcdFx0JChgI25vdC1kaGNwLSR7ZXRofWApLnZhbCgnJyk7XG5cdFx0XHR9XG5cdFx0XHRuZXR3b3Jrcy5hZGROZXdGb3JtUnVsZXMoZXRoKTtcblx0XHR9KTtcblxuXHRcdGlmICgkKCcjdXNlbmF0LWNoZWNrYm94JykuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0JCgnLm5hdGVkLXNldHRpbmdzLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJy5uYXRlZC1zZXR0aW5ncy1ncm91cCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdH1cblx0fSxcblx0YWRkTmV3Rm9ybVJ1bGVzKG5ld1Jvd0lkKSB7XG5cdFx0Y29uc3QgbmFtZUNsYXNzID0gYG5hbWVfJHtuZXdSb3dJZH1gO1xuXHRcdG5ldHdvcmtzLnZhbGlkYXRlUnVsZXNbbmFtZUNsYXNzXSA9IHtcblx0XHRcdGlkZW50aWZpZXI6IG5hbWVDbGFzcyxcblx0XHRcdGRlcGVuZHM6IGBpbnRlcmZhY2VfJHtuZXdSb3dJZH1gLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubndfVmFsaWRhdGVOYW1lSXNOb3RCZUVtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblxuXHRcdH07XG5cblx0XHRjb25zdCB2bGFuQ2xhc3MgPSBgdmxhbmlkXyR7bmV3Um93SWR9YDtcblx0XHRuZXR3b3Jrcy52YWxpZGF0ZVJ1bGVzW3ZsYW5DbGFzc10gPSB7XG5cdFx0XHRkZXBlbmRzOiBgaW50ZXJmYWNlXyR7bmV3Um93SWR9YCxcblx0XHRcdGlkZW50aWZpZXI6IHZsYW5DbGFzcyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnaW50ZWdlclswLi40MDk1XScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubndfVmFsaWRhdGVWbGFuUmFuZ2UsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiBgY2hlY2tWbGFuWyR7bmV3Um93SWR9XWAsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubndfVmFsaWRhdGVWbGFuQ3Jvc3MsXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXG5cdFx0fTtcblxuXHRcdGNvbnN0IGlwYWRkckNsYXNzID0gYGlwYWRkcl8ke25ld1Jvd0lkfWA7XG5cdFx0bmV0d29ya3MudmFsaWRhdGVSdWxlc1tpcGFkZHJDbGFzc10gPSB7XG5cdFx0XHRpZGVudGlmaWVyOiBpcGFkZHJDbGFzcyxcblx0XHRcdGRlcGVuZHM6IGBub3QtZGhjcC0ke25ld1Jvd0lkfWAsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5ud19WYWxpZGF0ZUlwcGFkZHJJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2lwYWRkcicsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubndfVmFsaWRhdGVJcHBhZGRyTm90UmlnaHQsXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH07XG5cblx0XHRjb25zdCBkaGNwQ2xhc3MgPSBgZGhjcF8ke25ld1Jvd0lkfWA7XG5cdFx0bmV0d29ya3MudmFsaWRhdGVSdWxlc1tkaGNwQ2xhc3NdID0ge1xuXHRcdFx0aWRlbnRpZmllcjogZGhjcENsYXNzLFxuXHRcdFx0ZGVwZW5kczogYGludGVyZmFjZV8ke25ld1Jvd0lkfWAsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogYGRoY3BPblZsYW5OZXR3b3Jrc1ske25ld1Jvd0lkfV1gLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm53X1ZhbGlkYXRlREhDUE9uVmxhbnNEb250U3VwcG9ydCxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fTtcblxuXHR9LFxuXHRjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gc2V0dGluZ3M7XG5cdFx0cmVzdWx0LmRhdGEgPSBuZXR3b3Jrcy4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0Y2JBZnRlclNlbmRGb3JtKCkge1xuXG5cdH0sXG5cdGluaXRpYWxpemVGb3JtKCkge1xuXHRcdEZvcm0uJGZvcm1PYmogPSBuZXR3b3Jrcy4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9bmV0d29yay9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBuZXR3b3Jrcy52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IG5ldHdvcmtzLmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBuZXR3b3Jrcy5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kLmZuLmZvcm0uc2V0dGluZ3MucnVsZXMuaXBhZGRyID0gKHZhbHVlKSA9PiB7XG5cdGxldCByZXN1bHQgPSB0cnVlO1xuXHRjb25zdCBmID0gdmFsdWUubWF0Y2goL14oXFxkezEsM30pXFwuKFxcZHsxLDN9KVxcLihcXGR7MSwzfSlcXC4oXFxkezEsM30pJC8pO1xuXHRpZiAoZiA9PSBudWxsKSB7XG5cdFx0cmVzdWx0ID0gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCA1OyBpICs9IDEpIHtcblx0XHRcdGNvbnN0IGEgPSBmW2ldO1xuXHRcdFx0aWYgKGEgPiAyNTUpIHtcblx0XHRcdFx0cmVzdWx0ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChmWzVdID4gMzIpIHtcblx0XHRcdHJlc3VsdCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuJC5mbi5mb3JtLnNldHRpbmdzLnJ1bGVzLmlwYWRkcldpdGhQb3J0T3B0aW9uYWwgPSAodmFsdWUpID0+IHtcblx0bGV0IHJlc3VsdCA9IHRydWU7XG5cdGNvbnN0IGYgPSB2YWx1ZS5tYXRjaCgvXihcXGR7MSwzfSlcXC4oXFxkezEsM30pXFwuKFxcZHsxLDN9KVxcLihcXGR7MSwzfSkoOlswLTldKyk/JC8pO1xuXHRpZiAoZiA9PSBudWxsKSB7XG5cdFx0cmVzdWx0ID0gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCA1OyBpICs9IDEpIHtcblx0XHRcdGNvbnN0IGEgPSBmW2ldO1xuXHRcdFx0aWYgKGEgPiAyNTUpIHtcblx0XHRcdFx0cmVzdWx0ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChmWzVdID4gMzIpIHtcblx0XHRcdHJlc3VsdCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuJC5mbi5mb3JtLnNldHRpbmdzLnJ1bGVzLmNoZWNrVmxhbiA9ICh2bGFuVmFsdWUsIHBhcmFtKSA9PiB7XG5cdGxldCByZXN1bHQgPSB0cnVlO1xuXHRjb25zdCB2bGFuc0FycmF5ID0ge307XG5cdGNvbnN0IGFsbFZhbHVlcyA9IG5ldHdvcmtzLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0aWYgKGFsbFZhbHVlcy5pbnRlcmZhY2VfMCAhPT0gdW5kZWZpbmVkICYmIGFsbFZhbHVlcy5pbnRlcmZhY2VfMCA+IDApIHtcblx0XHRjb25zdCBuZXdFdGhOYW1lID0gYWxsVmFsdWVzW2BpbnRlcmZhY2VfJHthbGxWYWx1ZXMuaW50ZXJmYWNlXzB9YF07XG5cdFx0dmxhbnNBcnJheVtuZXdFdGhOYW1lXSA9IFthbGxWYWx1ZXMudmxhbmlkXzBdO1xuXHRcdGlmIChhbGxWYWx1ZXMudmxhbmlkXzAgPT09ICcnKSB7XG5cdFx0XHRyZXN1bHQgPSBmYWxzZTtcblx0XHR9XG5cdH1cblx0JC5lYWNoKGFsbFZhbHVlcywgKGluZGV4LCB2YWx1ZSkgPT4ge1xuXHRcdGlmIChpbmRleCA9PT0gJ2ludGVyZmFjZV8wJyB8fCBpbmRleCA9PT0gJ3ZsYW5pZF8wJykgcmV0dXJuO1xuXHRcdGlmIChpbmRleC5pbmRleE9mKCd2bGFuaWQnKSA+PSAwKSB7XG5cdFx0XHRjb25zdCBldGhOYW1lID0gYWxsVmFsdWVzW2BpbnRlcmZhY2VfJHtpbmRleC5zcGxpdCgnXycpWzFdfWBdO1xuXHRcdFx0aWYgKCQuaW5BcnJheSh2YWx1ZSwgdmxhbnNBcnJheVtldGhOYW1lXSkgPj0gMFxuXHRcdFx0XHQmJiB2bGFuVmFsdWUgPT09IHZhbHVlXG5cdFx0XHRcdCYmIHBhcmFtID09PSBpbmRleC5zcGxpdCgnXycpWzFdKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCEoZXRoTmFtZSBpbiB2bGFuc0FycmF5KSkge1xuXHRcdFx0XHRcdHZsYW5zQXJyYXlbZXRoTmFtZV0gPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2bGFuc0FycmF5W2V0aE5hbWVdLnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4kLmZuLmZvcm0uc2V0dGluZ3MucnVsZXMuZGhjcE9uVmxhbk5ldHdvcmtzID0gKHZhbHVlLCBwYXJhbSkgPT4ge1xuXHRsZXQgcmVzdWx0ID0gdHJ1ZTtcblx0Y29uc3QgdmxhblZhbHVlID0gbmV0d29ya3MuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgYHZsYW5pZF8ke3BhcmFtfWApO1xuXHRjb25zdCBkaGNwVmFsdWUgPSBuZXR3b3Jrcy4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCBgZGhjcF8ke3BhcmFtfWApO1xuXHRpZiAodmxhblZhbHVlID4gMCAmJiBkaGNwVmFsdWUgPT09ICdvbicpIHtcblx0XHRyZXN1bHQgPSBmYWxzZTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuJC5mbi5mb3JtLnNldHRpbmdzLnJ1bGVzLmV4dGVuYWxJcEhvc3QgPSAoKSA9PiB7XG5cdGNvbnN0IGFsbFZhbHVlcyA9IG5ldHdvcmtzLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0aWYgKGFsbFZhbHVlcy51c2VuYXQgPT09ICdvbicpIHtcblx0XHRpZiAoYWxsVmFsdWVzLmV4dGhvc3RuYW1lID09PSAnJyAmJiBhbGxWYWx1ZXMuZXh0aXBhZGRyID09PSAnJykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0bmV0d29ya3MuaW5pdGlhbGl6ZSgpO1xufSk7XG4iXX0=