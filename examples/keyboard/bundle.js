/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// import Cursor from 'morora.js';

var KEY_SETS = {
  UPPER: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '\'', '.', ',', '_', '-', '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  LOWER: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '\'', '.', ',', '_', '-', '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  SYMBOLS: [']', ']', '{', '}', ';', '\'', '\\', ':', '"', '|', ',', '.', '/', '-', '=', '_', '+', '*', '<', '>', 'à', 'á', 'â', 'ä', 'æ', 'ç', 'é', 'è', 'ê', 'ë', '&', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')']
};

var keyboardEl = document.getElementsByClassName('keyboard')[0];
var inputEl = document.getElementsByClassName('k-input')[0];

var onKey = function onKey(key) {
  var initialLength = inputEl.textContent.length;
  inputEl.textContent += key;

  if (!initialLength && currentLayout === 'upper') {
    window.switchCase();
  }
};

var setKeyboardLayout = function setKeyboardLayout(layout) {
  var setKeySet = function setKeySet(keySet) {
    var keys = keyboardEl.getElementsByClassName('k-key');
    keySet.forEach(function (key, index) {
      keys[index].textContent = key;
      keys[index].onclick = function () {
        onKey(key);
      };
    });
  };

  switch (layout) {
    case 'upper':
      setKeySet(KEY_SETS.UPPER);
      break;

    case 'lower':
      setKeySet(KEY_SETS.LOWER);
      break;

    case 'symbols':
      setKeySet(KEY_SETS.SYMBOLS);
      break;
  }
};

// set default layout
setKeyboardLayout('upper');
var currentLayout = 'upper';
var lastLetterLayout = 'upper';

new window.Cursor();

window.onDelete = function () {
  var initialLength = inputEl.textContent.length;
  if (!initialLength) {
    return;
  }

  inputEl.textContent = inputEl.textContent.substr(0, inputEl.textContent.length - 1);

  var newLength = inputEl.textContent.length;
  if (!newLength && currentLayout === 'lower') {
    window.switchCase();
  }
};

window.switchCase = function () {
  var newLayout = lastLetterLayout === 'upper' ? 'lower' : 'upper';
  setKeyboardLayout(newLayout);
  currentLayout = newLayout;
  lastLetterLayout = newLayout;
};

window.switchToSymbols = function () {
  if (currentLayout === 'symbols') {
    window.switchCase();
  } else {
    setKeyboardLayout('symbols');
    currentLayout = 'symbols';
  }
};

window.onKey = onKey;

/***/ })
/******/ ]);