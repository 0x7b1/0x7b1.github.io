/*let toggleTheme = function() {
  if (isDark) {
    for (let key in darkTheme) {
      let elems = document.querySelectorAll(`.${darkTheme[key]}`);
      elems.forEach(elem => elem.classList.add(lightTheme[key]));
      elems.forEach(elem => elem.classList.remove(darkTheme[key]));
      themeColor.content = "#fff"
    }
    isDark = !isDark;
  } else {
    for (let key in darkTheme) {
      let elems = document.querySelectorAll(`.${lightTheme[key]}`);
      elems.forEach(elem => elem.classList.add(darkTheme[key]));
      elems.forEach(elem => elem.classList.remove(lightTheme[key]));
      themeColor.content = "#000000"
    }
    isDark = !isDark;
  }
};*/

"use strict";

var toggleTheme = function toggleTheme() {
  if (isDark) {
    var _loop = function _loop(key) {
      var elems = document.querySelectorAll(".".concat(darkTheme[key]));
      elems.forEach(function (elem) {
        return elem.classList.add(lightTheme[key]);
      });
      elems.forEach(function (elem) {
        return elem.classList.remove(darkTheme[key]);
      });
      themeColor.content = "#fff";
    };

    for (var key in darkTheme) {
      _loop(key);
    }

    isDark = !isDark;
  } else {
    var _loop2 = function _loop2(key) {
      var elems = document.querySelectorAll(".".concat(lightTheme[key]));
      elems.forEach(function (elem) {
        return elem.classList.add(darkTheme[key]);
      });
      elems.forEach(function (elem) {
        return elem.classList.remove(lightTheme[key]);
      });
      themeColor.content = "#000000";
    };

    for (var key in darkTheme) {
      _loop2(key);
    }

    isDark = !isDark;
  }
};
