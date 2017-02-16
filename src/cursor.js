import { SELECTABLE_CLASSNAME, KEY_CODES } from './constants.js';
import utils from './utils.js';

/**
 * @class Cursor
 */
class Cursor {
  /**
   * Cursor constructor
   * @param {Object} [options]
   * @param {boolean} [options.manual]
   * @param {HTMLElement} [options.focus] - The first element to focus.
   */
  constructor (options) {
    const focus = options && options.focus;
    const manual = options && options.manual;

    this.__focused = null;
    this.__links = document.body.getElementsByClassName(SELECTABLE_CLASSNAME);

    this.focus(focus);

    if (!manual) {
      window.addEventListener('keydown', (ev) => {
        switch (ev.keyCode) {
          case KEY_CODES.LEFT:
            this.moveLeft();
            break;
          case KEY_CODES.UP:
            this.moveUp();
            break;
          case KEY_CODES.RIGHT:
            this.moveRight();
            break;
          case KEY_CODES.DOWN:
            this.moveDown();
            break;
          case KEY_CODES.ENTER:
            this.click();
            break;
        }
      });
    }
  }

  /**
   * Deactivate Cursor management and focus.
   */
  deactivate () {
    this.removeFocus();
    this.__deactivated = true;
  }

  /**
   * Activate Cursor management and focus.
   */
  activate () {
    this.__deactivated = false;
    this.focusFirst();
  }

  /**
   * Returns true if Cursor is activated.
   * @returns {Boolean}
   */
  isActivated () {
    return !this.__deactivated;
  }

  /**
   * Returns true if the given HTML element can be focused.
   * @param {HTMLElement} el
   * @returns {Boolean}
   */
  isFocusable (el) {
    return utils.arrayIncludes(this.__links, el) && utils.isInScreen(el);
  }

  /**
   * 'Clicks' on the focused element.
   */
  click () {
    if (this.__deactivated) {
      return;
    }
    if (!this.__focused) {
      return;
    }

    if (this.__focused.click) {
      this.__focused.click();
    } else if (this.__focused.hasOwnProperty('href')) {
      window.location = this.__focused.href;
    }
  }

  /**
   * Move the focus to the element on the left.
   */
  moveLeft () {
    if (!this.__focused) {
      return this.focusFirst();
    }
    return this.focus(this.getLeft());
  }

  /**
   * Move the focus to the element on the right.
   */
  moveRight () {
    if (!this.__focused) {
      return this.focusFirst();
    }
    return this.focus(this.getRight());
  }

  /**
   * Move the focus to the element on the top.
   */
  moveUp () {
    if (!this.__focused) {
      return this.focusFirst();
    }
    return this.focus(this.getUp());
  }

  /**
   * Move the focus to the element on the bottom.
   */
  moveDown () {
    if (!this.__focused) {
      return this.focusFirst();
    }
    return this.focus(this.getDown());
  }

  /**
   * Move the focus to the closest element.
   */
  moveClosest () {
    if (!this.__focused) {
      return this.focusFirst();
    }
    return this.focus(this.getClosest());
  }

  /**
   * Focus 'first' element focusable.
   * @see getFirst
   */
  focusFirst () {
    if (this.__focused) {
      this.removeFocus();
    }

    const link = this.getFirst();
    if (!link) {
      return;
    }
    return this.focus(link);
  }

  /**
   * Get 'first' element focusable (first focusable element in the DOM).
   * @returns {HTMLElement|undefined}
   */
  getFirst () {
    for (let i = 0, len = this.__links.length; i < len; i++) {
      if (utils.isInScreen(this.__links[i])) {
        return this.__links[i];
      }
    }
  }

  /**
   * Get closest element relatively to the currently focused one.
   * @returns {HTMLElement|undefined}
   */
  getClosest () {
    const cur = this.__focused;

    if (!cur) {
      return this.getFirst();
    }

    const elements = {
      left: this.getLeft(),
      right: this.getRight(),
      up: this.getUp(),
      down: this.getDown()
    };

    for (let direction in distances) {
      if (elements[direction] === cur) {
        elements[direction] = null;
      }
    }

    const distances = {
      left:  !!elements.left  && utils.distanceLeft(cur, elements.left),
      right: !!elements.right && utils.distanceRight(cur, elements.right),
      up:    !!elements.up    && utils.distanceUp(cur, elements.up),
      down:  !!elements.down  && utils.distanceDown(cur, elements.down)
    };

    const best = { el: null };

    for (let direction in distances) {
      if (distances[direction] &&
        (!best.el || distances[direction] < best.distance)) {
        best.el = elements[direction];
        best.distance = distances[direction];
      }
    }

    return best.el || (utils.isInScreen(cur) ? cur : null);
  }

  /**
   * Get next element to the right relatively to the currently focused
   * one.
   * @returns {HTMLElement|undefined}
   */
  getRight () {
    if (!this.__focused) {
      return this.getFirst();
    }

    const focused = {
      el: this.__focused,
      placement: this.getPlacement()
    };

    let currentBest = {
      el: null, placement: {}
    };

    let foundWithinXAxis = false;

    for (let i = 0, len = this.__links.length; i < len; i++) {
      const el = this.__links[i];
      const elem = {
        el,
        placement: this.getPlacement(el)
      };

      if (
        (utils.isInScreen(elem.el) && elem.el !== focused.el) &&
        !utils.withinYAxis(focused.el, elem.el) &&
        elem.placement.left > focused.placement.right
      ) {
        if (utils.withinXAxis(focused.el, elem.el)) {
          if (!foundWithinXAxis) {
            foundWithinXAxis = true;
            currentBest = elem;
          } else if (!currentBest.el) {
            currentBest = elem;
          } else if (elem.placement.left < currentBest.placement.left) {
            currentBest = elem;
          } else if (
            elem.placement.left === currentBest.placement.left &&
            elem.placement.top < currentBest.placement.top
          ) {
            currentBest = elem;
          }
        } else if (!foundWithinXAxis) {
          if (!currentBest.el) {
            currentBest = elem;
          } else if (elem.placement.left < currentBest.placement.left) {
            currentBest = elem;
          } if (
            elem.placement.left === currentBest.placement.left &&
            elem.placement.top < currentBest.placement.top
          ) {
            currentBest = elem;
          }
        }
      }
    }

    return currentBest.el ||
      (utils.isInScreen(this.__focused) ? this.__focused : null);
  }

  /**
   * Get next element to the left relatively to the currently focused
   * one.
   * @returns {HTMLElement|undefined}
   */
  getLeft () {
    if (!this.__focused) {
      return this.getFirst();
    }

    const focused = {
      el: this.__focused,
      placement: this.getPlacement()
    };

    let currentBest = {
      el: null, placement: {}
    };

    let foundWithinXAxis = false;

    for (let i = 0, len = this.__links.length; i < len; i++) {
      const el = this.__links[i];
      const elem = {
        el,
        placement: this.getPlacement(el)
      };

      if (
        (utils.isInScreen(elem.el) && elem.el !== focused.el) &&
        !utils.withinYAxis(focused.el, elem.el) &&
        elem.placement.right < focused.placement.left
      ) {
        if (utils.withinXAxis(focused.el, elem.el)) {
          if (!foundWithinXAxis) {
            foundWithinXAxis = true;
            currentBest = elem;
          } else if (!currentBest.el) {
            currentBest = elem;
          } else if (elem.placement.right > currentBest.placement.right) {
            currentBest = elem;
          } else if (
            elem.placement.right === currentBest.placement.right &&
            elem.placement.top < currentBest.placement.top
          ) {
            currentBest = elem;
          }
        } else if (!foundWithinXAxis) {
          if (!currentBest.el) {
            currentBest = elem;
          } else if (elem.placement.right > currentBest.placement.right) {
            currentBest = elem;
          } if (
            elem.placement.right === currentBest.placement.right &&
            elem.placement.top < currentBest.placement.top
          ) {
            currentBest = elem;
          }
        }
      }
    }

    return currentBest.el ||
      (utils.isInScreen(this.__focused) ? this.__focused : null);
  }

  /**
   * Get next element to the top relatively to the currently focused
   * one.
   * @returns {HTMLElement|undefined}
   */
  getUp () {
    if (!this.__focused) {
      return this.getFirst();
    }

    const focused = {
      el: this.__focused,
      placement: this.getPlacement()
    };

    let currentBest = {
      el: null, placement: {}
    };

    let foundWithinYAxis = false;

    for (let i = 0, len = this.__links.length; i < len; i++) {
      const el = this.__links[i];
      const elem = {
        el,
        placement: this.getPlacement(el)
      };

      if (
        (utils.isInScreen(elem.el) && elem.el !== focused.el) &&
        !utils.withinXAxis(focused.el, elem.el) &&
        elem.placement.bottom < focused.placement.top
      ) {
        if (utils.withinYAxis(focused.el, elem.el)) {
          if (!foundWithinYAxis) {
            foundWithinYAxis = true;
            currentBest = elem;
          } else if (!currentBest.el) {
            currentBest = elem;
          } else if (elem.placement.bottom > currentBest.placement.bottom) {
            currentBest = elem;
          } else if (
            elem.placement.bottom === currentBest.placement.bottom &&
            elem.placement.left < currentBest.placement.left
          ) {
            currentBest = elem;
          }
        } else if (!foundWithinYAxis) {
          if (!currentBest.el) {
            currentBest = elem;
          } else if (elem.placement.bottom < currentBest.placement.bottom) {
            currentBest = elem;
          } if (
            elem.placement.bottom === currentBest.placement.bottom &&
            elem.placement.left < currentBest.placement.left
          ) {
            currentBest = elem;
          }
        }
      }
    }

    return currentBest.el ||
      (utils.isInScreen(this.__focused) ? this.__focused : null);
  }

  /**
   * Get next element toward the bottom relatively to the currently focused
   * one.
   * @returns {HTMLElement|undefined}
   */
  getDown () {
    if (!this.__focused) {
      return this.getFirst();
    }

    const focused = {
      el: this.__focused,
      placement: this.getPlacement()
    };

    let currentBest = {
      el: null, placement: {}
    };

    let foundWithinYAxis = false;

    for (let i = 0, len = this.__links.length; i < len; i++) {
      const el = this.__links[i];
      const elem = {
        el,
        placement: this.getPlacement(el)
      };

      if (
        (utils.isInScreen(elem.el) && elem.el !== focused.el) &&
        !utils.withinXAxis(focused.el, elem.el) &&
        elem.placement.top > focused.placement.bottom
      ) {
        if (utils.withinYAxis(focused.el, elem.el)) {
          if (!foundWithinYAxis) {
            foundWithinYAxis = true;
            currentBest = elem;
          } else if (!currentBest.el) {
            currentBest = elem;
          } else if (elem.placement.top < currentBest.placement.top) {
            currentBest = elem;
          } else if (
            elem.placement.top === currentBest.placement.top &&
            elem.placement.left < currentBest.placement.left
          ) {
            currentBest = elem;
          }
        } else if (!foundWithinYAxis) {
          if (!currentBest.el) {
            currentBest = elem;
          } else if (elem.placement.top < currentBest.placement.top) {
            currentBest = elem;
          } if (
            elem.placement.top === currentBest.placement.top &&
            elem.placement.left < currentBest.placement.left
          ) {
            currentBest = elem;
          }
        }
      }
    }

    return currentBest.el ||
      (utils.isInScreen(this.__focused) ? this.__focused : null);
  }

  /**
   * Get the placement of the givent element.
   * TODO Move that, nothing to do in here but for the currently selected.
   * @param {HTMLElement} [el]
   * @returns {Object} placement
   * @returns {Number} placement.top
   * @returns {Number} placement.left
   * @returns {Number} placement.width
   * @returns {Number} placement.height
   */
  getPlacement (el) {
    if (!el) {
      if (!this.__focused) {
        return { top: 0, left: 0, width: 0, height: 0 };
      }
      el = this.__focused;
    }
    return el.getBoundingClientRect();
  }

  /**
   * Get currently focused element.
   * @returns {HTMLElement|null}
   */
  getFocused () {
    return this.__focused;
  }

  /**
   * Get list of focusable elements.
   * @returns {NodeList|undefined}
   */
  getList () {
    return this.__links;
  }

  /**
   * Focus element given / 'first' element.
   * @param {HTMLElement} [el]
   */
  focus (el) {
    if (this.__deactivated) {
      return;
    }
    if (!el) {
      return this.focusFirst();
    }
    if (el === this.__focused) {
      return;
    }
    if (this.__focused) {
      this.removeFocus();
    }
    if (this.isFocusable(el)) {
      utils.addFocusedClass(el);
      this.__focused = el;
      el.focus();
      utils.dispatchMouseEvent(el, 'mouseover');
    }
  }

  /**
   * Remove any current focus (trigger corresponding events).
   */
  removeFocus () {
    if (!this.__focused) {
      return;
    }

    utils.removeFocusedClass(this.__focused);
    this.__focused.blur();
    utils.dispatchMouseEvent(this.__focused, 'mouseout');
    this.__focused = null;
  }

  /**
   * Checks if the given element is currently being focused.
   * @param {HTMLElement} el
   * @returns {Boolean}
   */
  isFocused (el) {
    return this.__focused === el;
  }
}

export default Cursor;
