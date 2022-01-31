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
var DebuggerInfo = {
  $debugInfoDiv: $('#debug-info'),
  delta: 500,
  lastKeypressTime: 0,
  initialize: function initialize() {
    DebuggerInfo.$debugInfoDiv.addClass('ui right very wide sidebar');
    window.$(document).on('keydown', function (event) {
      DebuggerInfo.keyHandler(event);
    });
  },
  UpdateContent: function UpdateContent(newContent) {
    // let newHtml = `<h2>${globalTranslate.dbg_Header}</h2>`;
    // newHtml += newContent;
    DebuggerInfo.$debugInfoDiv.html(newContent);
  },
  showSidebar: function showSidebar() {
    if (DebuggerInfo.$debugInfoDiv.html().length === 0) return;
    DebuggerInfo.$debugInfoDiv.sidebar({
      context: $('#main'),
      transition: 'overlay',
      dimPage: false
    }).sidebar('toggle');
  },
  keyHandler: function keyHandler(event) {
    // Double press to ESC will show the debug information
    if (event.keyCode === 27) {
      var thisKeypressTime = new Date();

      if (thisKeypressTime - DebuggerInfo.lastKeypressTime <= DebuggerInfo.delta) {
        DebuggerInfo.showSidebar();
        thisKeypressTime = 0;
      }

      DebuggerInfo.lastKeypressTime = thisKeypressTime;
    }
  }
}; // export default DebuggerInfo;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluL2RlYnVnZ2VyLWluZm8uanMiXSwibmFtZXMiOlsiRGVidWdnZXJJbmZvIiwiJGRlYnVnSW5mb0RpdiIsIiQiLCJkZWx0YSIsImxhc3RLZXlwcmVzc1RpbWUiLCJpbml0aWFsaXplIiwiYWRkQ2xhc3MiLCJ3aW5kb3ciLCJkb2N1bWVudCIsIm9uIiwiZXZlbnQiLCJrZXlIYW5kbGVyIiwiVXBkYXRlQ29udGVudCIsIm5ld0NvbnRlbnQiLCJodG1sIiwic2hvd1NpZGViYXIiLCJsZW5ndGgiLCJzaWRlYmFyIiwiY29udGV4dCIsInRyYW5zaXRpb24iLCJkaW1QYWdlIiwia2V5Q29kZSIsInRoaXNLZXlwcmVzc1RpbWUiLCJEYXRlIl0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFNQSxZQUFZLEdBQUc7QUFDcEJDLEVBQUFBLGFBQWEsRUFBRUMsQ0FBQyxDQUFDLGFBQUQsQ0FESTtBQUVwQkMsRUFBQUEsS0FBSyxFQUFFLEdBRmE7QUFHcEJDLEVBQUFBLGdCQUFnQixFQUFFLENBSEU7QUFJcEJDLEVBQUFBLFVBSm9CLHdCQUlQO0FBQ1pMLElBQUFBLFlBQVksQ0FBQ0MsYUFBYixDQUEyQkssUUFBM0IsQ0FBb0MsNEJBQXBDO0FBQ0FDLElBQUFBLE1BQU0sQ0FBQ0wsQ0FBUCxDQUFTTSxRQUFULEVBQW1CQyxFQUFuQixDQUFzQixTQUF0QixFQUFpQyxVQUFDQyxLQUFELEVBQVc7QUFDM0NWLE1BQUFBLFlBQVksQ0FBQ1csVUFBYixDQUF3QkQsS0FBeEI7QUFDQSxLQUZEO0FBR0EsR0FUbUI7QUFVcEJFLEVBQUFBLGFBVm9CLHlCQVVOQyxVQVZNLEVBVU07QUFDekI7QUFDQTtBQUNBYixJQUFBQSxZQUFZLENBQUNDLGFBQWIsQ0FBMkJhLElBQTNCLENBQWdDRCxVQUFoQztBQUNBLEdBZG1CO0FBZXBCRSxFQUFBQSxXQWZvQix5QkFlTjtBQUNiLFFBQUlmLFlBQVksQ0FBQ0MsYUFBYixDQUEyQmEsSUFBM0IsR0FBa0NFLE1BQWxDLEtBQTZDLENBQWpELEVBQW9EO0FBQ3BEaEIsSUFBQUEsWUFBWSxDQUFDQyxhQUFiLENBQ0VnQixPQURGLENBQ1U7QUFDUkMsTUFBQUEsT0FBTyxFQUFFaEIsQ0FBQyxDQUFDLE9BQUQsQ0FERjtBQUVSaUIsTUFBQUEsVUFBVSxFQUFFLFNBRko7QUFHUkMsTUFBQUEsT0FBTyxFQUFFO0FBSEQsS0FEVixFQU1FSCxPQU5GLENBTVUsUUFOVjtBQU9BLEdBeEJtQjtBQXlCcEJOLEVBQUFBLFVBekJvQixzQkF5QlRELEtBekJTLEVBeUJGO0FBQ2pCO0FBQ0EsUUFBSUEsS0FBSyxDQUFDVyxPQUFOLEtBQWtCLEVBQXRCLEVBQTBCO0FBQ3pCLFVBQUlDLGdCQUFnQixHQUFHLElBQUlDLElBQUosRUFBdkI7O0FBQ0EsVUFBSUQsZ0JBQWdCLEdBQUd0QixZQUFZLENBQUNJLGdCQUFoQyxJQUFvREosWUFBWSxDQUFDRyxLQUFyRSxFQUE0RTtBQUMzRUgsUUFBQUEsWUFBWSxDQUFDZSxXQUFiO0FBQ0FPLFFBQUFBLGdCQUFnQixHQUFHLENBQW5CO0FBQ0E7O0FBQ0R0QixNQUFBQSxZQUFZLENBQUNJLGdCQUFiLEdBQWdDa0IsZ0JBQWhDO0FBQ0E7QUFDRDtBQW5DbUIsQ0FBckIsQyxDQXVDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTctMjAyMCBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5jb25zdCBEZWJ1Z2dlckluZm8gPSB7XG5cdCRkZWJ1Z0luZm9EaXY6ICQoJyNkZWJ1Zy1pbmZvJyksXG5cdGRlbHRhOiA1MDAsXG5cdGxhc3RLZXlwcmVzc1RpbWU6IDAsXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0RGVidWdnZXJJbmZvLiRkZWJ1Z0luZm9EaXYuYWRkQ2xhc3MoJ3VpIHJpZ2h0IHZlcnkgd2lkZSBzaWRlYmFyJyk7XG5cdFx0d2luZG93LiQoZG9jdW1lbnQpLm9uKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG5cdFx0XHREZWJ1Z2dlckluZm8ua2V5SGFuZGxlcihldmVudCk7XG5cdFx0fSk7XG5cdH0sXG5cdFVwZGF0ZUNvbnRlbnQobmV3Q29udGVudCkge1xuXHRcdC8vIGxldCBuZXdIdG1sID0gYDxoMj4ke2dsb2JhbFRyYW5zbGF0ZS5kYmdfSGVhZGVyfTwvaDI+YDtcblx0XHQvLyBuZXdIdG1sICs9IG5ld0NvbnRlbnQ7XG5cdFx0RGVidWdnZXJJbmZvLiRkZWJ1Z0luZm9EaXYuaHRtbChuZXdDb250ZW50KTtcblx0fSxcblx0c2hvd1NpZGViYXIoKSB7XG5cdFx0aWYgKERlYnVnZ2VySW5mby4kZGVidWdJbmZvRGl2Lmh0bWwoKS5sZW5ndGggPT09IDApIHJldHVybjtcblx0XHREZWJ1Z2dlckluZm8uJGRlYnVnSW5mb0RpdlxuXHRcdFx0LnNpZGViYXIoe1xuXHRcdFx0XHRjb250ZXh0OiAkKCcjbWFpbicpLFxuXHRcdFx0XHR0cmFuc2l0aW9uOiAnb3ZlcmxheScsXG5cdFx0XHRcdGRpbVBhZ2U6IGZhbHNlLFxuXHRcdFx0fSlcblx0XHRcdC5zaWRlYmFyKCd0b2dnbGUnKTtcblx0fSxcblx0a2V5SGFuZGxlcihldmVudCkge1xuXHRcdC8vIERvdWJsZSBwcmVzcyB0byBFU0Mgd2lsbCBzaG93IHRoZSBkZWJ1ZyBpbmZvcm1hdGlvblxuXHRcdGlmIChldmVudC5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0bGV0IHRoaXNLZXlwcmVzc1RpbWUgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0aWYgKHRoaXNLZXlwcmVzc1RpbWUgLSBEZWJ1Z2dlckluZm8ubGFzdEtleXByZXNzVGltZSA8PSBEZWJ1Z2dlckluZm8uZGVsdGEpIHtcblx0XHRcdFx0RGVidWdnZXJJbmZvLnNob3dTaWRlYmFyKCk7XG5cdFx0XHRcdHRoaXNLZXlwcmVzc1RpbWUgPSAwO1xuXHRcdFx0fVxuXHRcdFx0RGVidWdnZXJJbmZvLmxhc3RLZXlwcmVzc1RpbWUgPSB0aGlzS2V5cHJlc3NUaW1lO1xuXHRcdH1cblx0fSxcbn07XG5cblxuLy8gZXhwb3J0IGRlZmF1bHQgRGVidWdnZXJJbmZvO1xuIl19