/*let acc = document.getElementsByClassName("accordion");
let allPanels = document.getElementsByClassName("panel");

[...acc].forEach(function(elem) {
  if (elem.classList.contains("active")) {
    let activePanel = elem.nextElementSibling;
    activePanel.style.maxHeight = activePanel.scrollHeight + "px";
  }
});

for (let i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    [...acc].forEach(elem => elem.classList.remove("active"));
    [...allPanels].forEach(function(elem) {
      elem.style.maxHeight = null;
    });
    this.classList.add("active");
    let panel = this.nextElementSibling;
    panel.style.maxHeight = panel.scrollHeight + "px";
  });
}*/
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var acc = document.getElementsByClassName("accordion");
var allPanels = document.getElementsByClassName("panel");

_toConsumableArray(acc).forEach(function (elem) {
  if (elem.classList.contains("active")) {
    var activePanel = elem.nextElementSibling;
    activePanel.style.maxHeight = activePanel.scrollHeight + "px";
  }
});

for (var i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function () {
    _toConsumableArray(acc).forEach(function (elem) {
      return elem.classList.remove("active");
    });

    _toConsumableArray(allPanels).forEach(function (elem) {
      elem.style.maxHeight = null;
    });

    this.classList.add("active");
    var panel = this.nextElementSibling;
    panel.style.maxHeight = panel.scrollHeight + "px";
  });
}