import { FOCUSED_CLASSNAME } from './constants.js';

/**
 * Returns true if the given placement has at least 1 pixel which is visible in
 * the current window.
 * @param {Object} placement
 * @returns {Boolean}
 */
const isVisible = (placement) => {
  return !(placement.right <= 0 || placement.bottom <= 0 ||
    placement.left >= window.innerWidth ||
    placement.top >= window.innerHeight);
};

/**
 * Returns true if the given placement is entirely visible in the current
 * window.
 * @param {Object} placement
 * @returns {Boolean}
 */
const isInScreen = (placement) => {
  return !(placement.right <= 0 || placement.bottom <= 0 ||
    placement.left >= window.innerWidth ||
    placement.top >= window.innerHeight);
};

/**
 * Simply checks if the given element is in the given
 * Array.
 * @param {Array} a
 * @param {*} obj
 * @returns {Boolean}
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
 * Manually dispatch a MouseEvents event.
 * @param {HTMLElement} el
 * @param {string} type]
 */
const dispatchMouseEvent = (el, type) => {
  const ev = document.createEvent('MouseEvents');

  const placement = el.getBoundingClientRect();

  const x = placement.left;
  const y = placement.top;
  ev.initMouseEvent(type, true, true, window, 0, x, y, x, y, false,
    false, false, false, 0, null);
  el.dispatchEvent(ev);
};

/**
 * Return true if the two elements overlap each other
 * @param {Object} placement
 * @return {Boolean}
 */
const elementsOverlap = (placement1, placement2) =>
  withinXAxis(placement1, placement2) &&
    withinYAxis(placement1, placement2);

/**
 * Return true if the two placements share the same x axis (horizontally).
 * @param {Object} placement
 * @returns {Boolean}
 */
const withinXAxis = (placement1, placement2) => {
  return placement1.bottom > placement2.top &&
    placement1.top < placement2.bottom;
};

/**
 * Return true if the two placements share the same y axis (vertically).
 * @param {Object} placement
 * @return {Boolean}
 */
const withinYAxis = (placement1, placement2) => {
  return placement1.right > placement2.left &&
    placement1.left  < placement2.right;
};

/**
 * Add FOCUSED_CLASSNAME to a Dom element
 * @param {HTMLElement} element
 */
const addFocusedClass = (element) => {
  element.classList.add(FOCUSED_CLASSNAME);
};

/**
 * Remove FOCUSED_CLASSNAME to a Dom element
 * @param {HTMLElement} element
 */
const removeFocusedClass = (element) => {
  element.classList.remove(FOCUSED_CLASSNAME);
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
 * Return pixel distance between 2 placements when a translation towards
 * the bottom is wanted
 * @param {Object} placementStart
 * @param {Object} placementEnd
 * @returns {Number}
 */
const distanceDown = (placementStart, placementEnd) => {
  const startPoint = {
    x: (placementStart.left + placementStart.right) / 2,
    y: placementStart.bottom
  };

  let x;
  if (placementEnd.left < startPoint.x) {
    if (placementEnd.right > startPoint.x) {
      x = startPoint.x;
    } else {
      x = placementEnd.right;
    }
  } else {
    x = placementEnd.left;
  }

  const endPoint = {
    x: x,
    y: placementEnd.top
  };

  return parseInt(vectorLength(startPoint, endPoint), 10);
};

/**
 * Return pixel distance between 2 placements when a translation towards
 * the top is wanted
 * @param {Object} placementStart
 * @param {Object} placementEnd
 * @return {Number}
 */
const distanceUp = (placementStart, placementEnd) => {
  const startPoint = {
    x: (placementStart.left + placementStart.right) / 2,
    y: placementStart.top
  };

  let x;
  if (placementEnd.left < startPoint.x) {
    if (placementEnd.right > startPoint.x) {
      x = startPoint.x;
    } else {
      x = placementEnd.right;
    }
  } else {
    x = placementEnd.left;
  }

  const endPoint = {
    x: x,
    y: placementEnd.bottom
  };

  return parseInt(vectorLength(startPoint, endPoint), 10);
};

/**
 * Return pixel distance between 2 placements when a translation towards
 * the left is wanted
 * @param {Object} placementStart
 * @param {Object} placementEnd
 * @return {Number}
 */
const distanceLeft = (placementStart, placementEnd) => {
  const startPoint = {
    x: placementStart.left,
    y: (placementStart.top + placementStart.bottom) / 2
  };

  let y;
  if (placementEnd.top < startPoint.y) {
    if (placementEnd.bottom > startPoint.y) {
      y = startPoint.y;
    } else {
      y = placementEnd.bottom;
    }
  } else {
    y = placementEnd.top;
  }

  const endPoint = {
    x: placementEnd.right,
    y: y
  };

  return parseInt(vectorLength(startPoint, endPoint), 10);
};

/**
 * Return pixel distance between 2 elements when a translation towards
 * the right is wanted
 * @param {Object} placementStart
 * @param {Object} placementEnd
 * @return {Number}
 */
const distanceRight = (start, end) => {
  const placementStart = start.getBoundingClientRect();
  const placementEnd = end.getBoundingClientRect();

  const startPoint = {
    x: placementStart.right,
    y: (placementStart.top + placementStart.bottom) / 2
  };

  let y;
  if (placementEnd.top < startPoint.y) {
    if (placementEnd.bottom > startPoint.y) {
      y = startPoint.y;
    } else {
      y = placementEnd.bottom;
    }
  } else {
    y = placementEnd.top;
  }

  const endPoint = {
    x: placementEnd.left,
    y: y
  };

  return parseInt(vectorLength(startPoint, endPoint));
};

/**
 * Get the placement of the givent element.
 * @param {HTMLElement} [el]
 * @returns {Object} placement
 */
const getElementPlacement = (el) =>
  el.getBoundingClientRect();

const utils = {
  isVisible,
  isInScreen,
  elementsOverlap,
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
