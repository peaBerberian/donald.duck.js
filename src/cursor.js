import { FOCUSABLE_CLASSNAME, KEY_CODES } from './constants.js';
import utils from './utils.js';

/**
 * @class Cursor
 */
class Cursor {
  /**
   * Cursor constructor
   * @param {Object} [options = {}]
   * @param {Boolean} [options.manual] - If true, the left, right, up, down and
   * enter key are not binded.
   * @param {HTMLElement} [options.focus] - The first element to focus. If falsy
   * the first valable element encountered will be focused.
   * @param {Boolean} [options.deactivated] - Wether the cursor should be
   * initially deactivated. False by default.
   * @param {Boolean} [options.lazy] - If true, the placement of each element
   * will only be calculated:
   *   - on instanciation
   *   - when calling the refresh method
   * If falsy, the calculation will be done each time the user wants to move the
   * cursor. TODO?
   * @param {Boolean
   */
  constructor (options = {}) {
    this._deactivated = !!options.deactivated;
    this._focused = null;
    this._links = document.body.getElementsByClassName(FOCUSABLE_CLASSNAME);
    this.focus(options.focus);

    if (!options.manual) {
      window.addEventListener('keydown', ({ keyCode }) => {
        switch (keyCode) {
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
    this._deactivated = true;
  }

  /**
   * Activate Cursor management and focus.
   */
  activate () {
    this._deactivated = false;
    this.focusFirst();
  }

  /**
   * Returns true if Cursor is activated.
   * @returns {Boolean}
   */
  isActivated () {
    return !this._deactivated;
  }

  /**
   * Returns true if the given HTML element can be focused.
   * @param {HTMLElement} el
   * @returns {Boolean}
   */
  isFocusable (el) {
    return utils.arrayIncludes(this._links, el) &&
      utils.isInScreen(this.getPlacement(el));
  }

  /**
   * 'Clicks' on the focused element.
   */
  click () {
    if (this._deactivated || !this._focused) {
      return;
    }

    if (this._focused.click) {
      this._focused.click();
    }
  }

  /**
   * Move the focus to the element on the left.
   */
  moveLeft () {
    this._focused ? this.focus(this.getLeft()) : this.focusFirst();
  }

  /**
   * Move the focus to the element on the right.
   */
  moveRight () {
    this._focused ? this.focus(this.getRight()) : this.focusFirst();
  }

  /**
   * Move the focus to the element on the top.
   */
  moveUp () {
    this._focused ? this.focus(this.getUp()) : this.focusFirst();
  }

  /**
   * Move the focus to the element on the bottom.
   */
  moveDown () {
    this._focused ? this.focus(this.getDown()) : this.focusFirst();
  }

  /**
   * Move the focus to the closest element.
   */
  moveClosest () {
    this._focused ? this.focus(this.getClosest()) : this.focusFirst();
  }

  /**
   * Focus 'first' element focusable.
   * @see getFirst
   */
  focusFirst () {
    this.focus(this.getFirst());
  }

  /**
   * Get 'first' element focusable (first focusable element entirely in the
   * DOM).
   * @returns {HTMLElement|undefined}
   */
  getFirst () {
    for (let i = 0, len = this._links.length; i < len; i++) {
      if (utils.isInScreen(this.getPlacement(this._links[i]))) {
        return this._links[i];
      }
    }
  }

  /**
   * Get closest element relatively to the currently focused one.
   * @returns {HTMLElement|undefined}
   */
  getClosest () {
    const current = this._focused;

    // TODO limit to only one getElementPlacement call
    // const currentPlacement = utils.getElementPlacement();

    if (!current) {
      return this.getFirst();
    }

    const focP = this.getPlacement();

    const elements = {
      left: this.getLeft(),
      right: this.getRight(),
      up: this.getUp(),
      down: this.getDown()
    };

    const candidates = Object.keys(elements).reduce((acc, k) => {
      const el = elements[k];
      acc[k] = !el || el === current ? null : {
        el,
        placement: this.getPlacement(el)
      };
      return acc;
    }, {});

    const distances = {
      left: candidates.left &&
        utils.distanceLeft(focP, candidates.left.placement),

      right: candidates.right &&
        utils.distanceRight(focP, candidates.right.placement),

      up: candidates.up &&
        utils.distanceUp(focP, candidates.up.placement),

      down: candidates.down &&
        utils.distanceDown(focP, candidates.down.placement)
    };

    let best = {};

    Object.keys(distances).forEach((k) => {
      const distance = distances[k];
      if (k && (!best.el || k < best.distance)) {
        best = {
          el: elements[k],
          distance
        };
      }
    });

    return best.el || (utils.isInScreen(focP) ? current : null);
  }

  /**
   * Get next element to the right relatively to the currently focused
   * one.
   * @returns {HTMLElement|undefined}
   */
  getRight () {
    if (!this._focused) {
      return this.getFirst();
    }

    const foc = {
      el: null,
      placement: this.getPlacement()
    };

    let best = {
      el: null,
      placement: {}
    };

    let foundWithinXAxis = false;

    for (let i = 0, len = this._links.length; i < len; i++) {
      const el = this._links[i];

      if (el !== foc.el) {
        const curr = {
          el,
          placement: this.getPlacement(el)
        };

        if (
          utils.isInScreen(curr.placement) &&
          !utils.withinYAxis(foc.placement, curr.placement) &&
          curr.placement.left > foc.placement.right
        ) {
          if (utils.withinXAxis(foc.placement, curr.placement)) {
            if (!foundWithinXAxis) {
              foundWithinXAxis = true;
              best = curr;
            } else if (
              !best.el ||
              curr.placement.left < best.placement.left ||
              (
                curr.placement.left === best.placement.left &&
                curr.placement.top < best.placement.top
              )
            ) {
              best = curr;
            }
          } else if (!foundWithinXAxis) {
            if (
              !best.el ||
              curr.placement.left < best.placement.left ||
              (
                curr.placement.left === best.placement.left &&
                curr.placement.top < best.placement.top
              )
            ) {
              best = curr;
            }
          }
        }
      }
    }

    return best.el ||
      (utils.isInScreen(foc.placement) ? this._focused : null);
  }

  /**
   * Get next element to the left relatively to the currently focused
   * one.
   * @returns {HTMLElement|undefined}
   */
  getLeft () {
    if (!this._focused) {
      return this.getFirst();
    }

    const foc = {
      el: null,
      placement: this.getPlacement()
    };

    let best = {
      el: null,
      placement: {}
    };

    let foundWithinXAxis = false;

    for (let i = 0, len = this._links.length; i < len; i++) {
      const el = this._links[i];

      if (el !== foc.el) {
        const curr = {
          el,
          placement: this.getPlacement(el)
        };

        if (
          utils.isInScreen(curr.placement) &&
          !utils.withinYAxis(foc.placement, curr.placement) &&
          curr.placement.right < foc.placement.left
        ) {
          if (utils.withinXAxis(foc.placement, curr.placement)) {
            if (!foundWithinXAxis) {
              foundWithinXAxis = true;
              best = curr;
            } else if (
              !best.el ||
              curr.placement.right > best.placement.right ||
              (
                curr.placement.right === best.placement.right &&
                curr.placement.top < best.placement.top
              )
            ) {
              best = curr;
            }
          } else if (!foundWithinXAxis) {
            if (
              !best.el ||
              curr.placement.right > best.placement.right ||
              (
                curr.placement.right === best.placement.right &&
                curr.placement.top < best.placement.top
              )
            ) {
              best = curr;
            }
          }
        }
      }
    }

    return best.el ||
      (utils.isInScreen(foc.placement) ? this._focused : null);
  }

  /**
   * Get next element to the top relatively to the currently focused
   * one.
   * @returns {HTMLElement|undefined}
   */
  getUp () {
    if (!this._focused) {
      return this.getFirst();
    }

    const foc = {
      el: null,
      placement: this.getPlacement()
    };

    let best = {
      el: null,
      placement: {}
    };

    let foundWithinYAxis = false;

    for (let i = 0, len = this._links.length; i < len; i++) {
      const el = this._links[i];

      if (el !== foc.el) {
        const curr = {
          el,
          placement: this.getPlacement(el)
        };

        if (
          utils.isInScreen(curr.placement) &&
          !utils.withinXAxis(foc.placement, curr.placement) &&
          curr.placement.bottom < foc.placement.top
        ) {
          if (utils.withinYAxis(foc.placement, curr.placement)) {
            if (!foundWithinYAxis) {
              foundWithinYAxis = true;
              best = curr;
            } else if (
              !best.el ||
              curr.placement.bottom > best.placement.bottom ||
              (
                curr.placement.bottom === best.placement.bottom &&
                curr.placement.left < best.placement.left
              )
            ) {
              best = curr;
            }
          } else if (!foundWithinYAxis) {
            if (
              !best.el ||
              curr.placement.bottom < best.placement.bottom ||
              (
                curr.placement.bottom === best.placement.bottom &&
                curr.placement.left < best.placement.left
              )
            ) {
              best = curr;
            }
          }
        }
      }
    }

    return best.el ||
      (utils.isInScreen(foc.placement) ? this._focused : null);
  }

  /**
   * Get next element toward the bottom relatively to the currently focused
   * one.
   * @returns {HTMLElement|undefined}
   */
  getDown () {
    if (!this._focused) {
      return this.getFirst();
    }

    const foc = {
      el: null,
      placement: this.getPlacement()
    };

    let best = {
      el: null,
      placement: {}
    };

    let foundWithinYAxis = false;

    for (let i = 0, len = this._links.length; i < len; i++) {
      const el = this._links[i];

      if (el !== foc.el) {
        const curr = {
          el,
          placement: this.getPlacement(el)
        };

        if (
          utils.isInScreen(curr.placement) &&
          !utils.withinXAxis(foc.placement, curr.placement) &&
          curr.placement.top > foc.placement.bottom
        ) {
          if (utils.withinYAxis(foc.placement, curr.placement)) {
            if (!foundWithinYAxis) {
              foundWithinYAxis = true;
              best = curr;
            } else if (
              !best.el ||
              curr.placement.top < best.placement.top ||
              (
                curr.placement.top === best.placement.top &&
                curr.placement.left < best.placement.left
              )
            ) {
              best = curr;
            }
          } else if (!foundWithinYAxis) {
            if (
              !best.el ||
              curr.placement.top < best.placement.top ||
              (
                curr.placement.top === best.placement.top &&
                curr.placement.left < best.placement.left
              )
            ) {
              best = curr;
            }
          }
        }
      }
    }

    return best.el ||
      (utils.isInScreen(foc.placement) ? this._focused : null);
  }

  /**
   * Get the placement of the givent element.
   * @param {HTMLElement} [el]
   * @returns {Object|null} placement
   */
  getPlacement (el) {
    if (!el) {
      return this._focused ?
        utils.getElementPlacement(this._focused) : null;
    }
    return utils.getElementPlacement(el);
  }

  /**
   * Get currently focused element.
   * @returns {HTMLElement|null}
   */
  getFocused () {
    return this._focused;
  }

  /**
   * Move the focus to the closest element from a point on the screen, in pixel.
   * TODO
   */
  placeFocus () {
    return;
  }

  /**
   * Get list of focusable elements.
   * @returns {NodeList|undefined}
   */
  getList () {
    return this._links;
  }

  /**
   * Focus element given / 'first' element.
   * @param {HTMLElement} [el]
   */
  focus (el) {
    if (this._deactivated) {
      return;
    }
    if (!el) {
      return this.focusFirst();
    }
    if (el === this._focused) {
      return;
    }
    this.removeFocus();
    if (this.isFocusable(el)) {
      utils.addFocusedClass(el);
      this._focused = el;
      el.focus();

      // utils.dispatchMouseEvent(el, 'mouseover');
    }
  }

  /**
   * Remove any current focus (trigger corresponding events).
   */
  removeFocus () {
    if (!this._focused) {
      return;
    }

    utils.removeFocusedClass(this._focused);
    this._focused.blur();

    // utils.dispatchMouseEvent(this._focused, 'mouseout');
    this._focused = null;
  }

  /**
   * Checks if the given element is currently being focused.
   * @param {HTMLElement} el
   * @returns {Boolean}
   */
  isFocused (el) {
    return !!el && this._focused === el;
  }

  /**
   * Refresh the list of 'focusable' elements.
   */
  refreshList () {
    this._links = document.body.getElementsByClassName(FOCUSABLE_CLASSNAME);
  }
}

export default Cursor;
