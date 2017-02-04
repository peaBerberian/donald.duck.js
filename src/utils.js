import { FOCUSED_CLASSNAME } from './constants.js';

/**
 * Return false if the given element is not visible
 * @param {DOMElement} el
 * @return {Boolean}
 */
const isInScreen = (el) => {
  if (!el) {
    return false;
  }
  const position = el.getBoundingClientRect();
  return !(position.right <= 0 || position.bottom <= 0 ||
    position.left >= window.innerWidth ||
    position.top >= window.innerHeight);
};

/**
 * Simply checks if the given element is in the given
 * Array.
 * @param {Array} a
 * @param {*} obj
 */
const arrayIncludes = (a, obj) => {
  let i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
};

/**
 * Manually dispatch a mouse event.
 * @param {HTMLElement} el
 * @param {string} type]
 */
const dispatchMouseEvent = (el, type) => {
  if (!el) {
    return;
  }
  const ev = document.createEvent('MouseEvents');

  // const placement = el.getBoundingClientRect();

  const x = el.left;
  const y = el.top;
  ev.initMouseEvent(type, true, true, window, 0, x, y, x, y, false,
    false, false, false, 0, null);
  el.dispatchEvent(ev);
};

/**
 * Return true if the two elements overlap each other
 * @param {DOMElement} element1
 * @param {DOMElement} element2
 * @return {Boolean}
 */
// const elementsOverlap = (element1, element2) => {
//   return withinXAxis(element1, element2) &&
//     withinYAxis(element1, element2);
// };

/**
 * Return true if the two elements share the same x axis (horizontally)
 * @param {DOMElement} element1
 * @param {DOMElement} element2
 * @return {Boolean}
 */
const withinXAxis = (element1, element2) => {
  if (!element1 || !element2) {
    return false;
  }
  const position1 = element1.getBoundingClientRect();
  const position2 = element2.getBoundingClientRect();
  return position1.bottom > position2.top &&
    position1.top    < position2.bottom;
};

/**
 * Return true if the two elements share the same y axis (vertically)
 * @param {DOMElement} element1
 * @param {DOMElement} element2
 * @return {Boolean}
 */
const withinYAxis = (element1, element2) => {
  if (!element1 || !element2) {
    return false;
  }
  const position1 = element1.getBoundingClientRect();
  const position2 = element2.getBoundingClientRect();
  return position1.right > position2.left &&
    position1.left  < position2.right;
};

/**
 * Add FOCUSED_CLASSNAME to a Dom element
 * @param {Element} element
 */
const addFocusedClass = (element) => {
  return element.classList.add(FOCUSED_CLASSNAME);
};

/**
 * Remove FOCUSED_CLASSNAME to a Dom element
 * @param {Element} element
 */
const removeFocusedClass = (element) => {
  return element.classList.remove(FOCUSED_CLASSNAME);
};

/**
 * Return pixel distance between 2 points
 * @param {Object} point1 { x, y }
 * @param {Object} point2 { x, y }
 * @return {Number}
 */
const vectorLength = (point1, point2) => {
  let xs = point2.x - point1.x;
  let ys = point2.y - point1.y;
  xs *= xs;
  ys *= ys;
  return Math.sqrt( xs + ys );
};

/**
 * Return pixel distance between 2 elements when a translation towards
 * the bottom is wanted
 * @param {Element} start Starting element
 * @param {Element} end Destination element
 * @return {Number}
 */
const distanceDown = (start, end) => {
  const startPlace = start.getBoundingClientRect();
  const endPlace = end.getBoundingClientRect();

  // TODO
  // const startPlace = getElementPlacement(start);
  // const endPlace = getElementPlacement(end);

  const startPoint = {
    x: (startPlace.left + startPlace.right) / 2,
    y: startPlace.bottom
  };

  let x;
  if (endPlace.left < startPoint.x) {
    if (endPlace.right > startPoint.x) {
      x = startPoint.x;
    } else {
      x = endPlace.right;
    }
  } else {
    x = endPlace.left;
  }

  const endPoint = {
    x: x,
    y: endPlace.top
  };

  return parseInt(vectorLength(startPoint, endPoint), 10);
};

/**
 * Return pixel distance between 2 elements when a translation towards
 * the top is wanted
 * @param {Element} start Starting element
 * @param {Element} end Destination element
 * @return {Number}
 */
const distanceUp = (start, end) => {
  const startPlace = start.getBoundingClientRect();
  const endPlace = end.getBoundingClientRect();

  // TODO
  // const startPlace = getElementPlacement(start);
  // const endPlace = getElementPlacement(end);

  const startPoint = {
    x: (startPlace.left + startPlace.right) / 2,
    y: startPlace.top
  };

  let x;
  if (endPlace.left < startPoint.x) {
    if (endPlace.right > startPoint.x) {
      x = startPoint.x;
    } else {
      x = endPlace.right;
    }
  } else {
    x = endPlace.left;
  }

  const endPoint = {
    x: x,
    y: endPlace.bottom
  };

  return parseInt(vectorLength(startPoint, endPoint), 10);
};

/**
 * Return pixel distance between 2 elements when a translation towards
 * the left is wanted
 * @param {Element} start Starting element
 * @param {Element} end Destination element
 * @return {Number}
 */
const distanceLeft = (start, end) => {
  const startPlace = start.getBoundingClientRect();
  const endPlace = end.getBoundingClientRect();

  // TODO
  // const startPlace = getElementPlacement(start);
  // const endPlace = getElementPlacement(end);

  const startPoint = {
    x: startPlace.left,
    y: (startPlace.top + startPlace.bottom) / 2
  };

  let y;
  if (endPlace.top < startPoint.y) {
    if (endPlace.bottom > startPoint.y) {
      y = startPoint.y;
    } else {
      y = endPlace.bottom;
    }
  } else {
    y = endPlace.top;
  }

  const endPoint = {
    x: endPlace.right,
    y: y
  };

  return parseInt(vectorLength(startPoint, endPoint), 10);
};

/**
 * Return pixel distance between 2 elements when a translation towards
 * the right is wanted
 * @param {Element} start Starting element
 * @param {Element} end Destination element
 * @return {Number}
 */
const distanceRight = (start, end) => {
  const startPlace = start.getBoundingClientRect();
  const endPlace = end.getBoundingClientRect();

  // TODO
  // const startPlace = getElementPlacement(start);
  // const endPlace = getElementPlacement(end);

  const startPoint = {
    x: startPlace.right,
    y: (startPlace.top + startPlace.bottom) / 2
  };

  let y;
  if (endPlace.top < startPoint.y) {
    if (endPlace.bottom > startPoint.y) {
      y = startPoint.y;
    } else {
      y = endPlace.bottom;
    }
  } else {
    y = endPlace.top;
  }

  const endPoint = {
    x: endPlace.left,
    y: y
  };

  return parseInt(vectorLength(startPoint, endPoint));
};

/**
 * Get the placement of the givent element.
 * @param {HTMLElement} [el]
 * @returns {Object} placement
 * @returns {Number} placement.top
 * @returns {Number} placement.left
 * @returns {Number} placement.width
 * @returns {Number} placement.height
 */
const getElementPlacement = (el) => {
  const placement = el.getBoundingClientRect();

  return {
    top: placement.top,
    left: placement.left,
    width: placement.width,
    height: placement.height
  };
};

const utils = {
  isInScreen,
  arrayIncludes,
  dispatchMouseEvent,
  withinXAxis,
  withinYAxis,
  addFocusedClass,
  removeFocusedClass,
  distanceDown,
  distanceUp,
  distanceLeft,
  distanceRight,
  getElementPlacement
};

export default utils;
