// TODO Clean up Cursor class check state and all
// TODO move events management to utils.
// TODO Checks event sent are the one we want / are needed.
// TODO DRYer?

(function (exports) {
  /**
   * ClassName added to a focused link
   * @type {string}
   */
  const FOCUSED_CLASSNAME = '_cursor_';

  /**
   * Tag name of the 'selectable' elements
   * @type {string}
   */
  const SELECTABLE_TAG_NAME = 'a';

  /**
   * Key codes from keyboard events
   * @type {Object}
   */
  const KEY_CODES = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13
  };

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
    start = start.getBoundingClientRect();
    end = end.getBoundingClientRect();

    // TODO
    // const startPlace = getElementPlacement(start);
    // const endPlace = getElementPlacement(end);

    const startPoint = {
      x: (start.left + start.right) / 2,
      y: start.bottom
    };

    let x;
    if (end.left < startPoint.x) {
      if (end.right > startPoint.x) {
        x = startPoint.x;
      } else {
        x = end.right;
      }
    } else {
      x = end.left;
    }

    const endPoint = {
      x: x,
      y: end.top
    };

    return vectorLength(startPoint, endPoint);
  };

  /**
   * Return pixel distance between 2 elements when a translation towards
   * the top is wanted
   * @param {Element} start Starting element
   * @param {Element} end Destination element
   * @return {Number}
   */
  const distanceUp = (start, end) => {
    start = start.getBoundingClientRect();
    end = end.getBoundingClientRect();

    // TODO
    // const startPlace = getElementPlacement(start);
    // const endPlace = getElementPlacement(end);

    const startPoint = {
      x: (start.left + start.right) / 2,
      y: start.top
    };

    let x;
    if (end.left < startPoint.x) {
      if (end.right > startPoint.x) {
        x = startPoint.x;
      } else {
        x = end.right;
      }
    } else {
      x = end.left;
    }

    const endPoint = {
      x: x,
      y: end.bottom
    };

    return vectorLength(startPoint, endPoint);
  };

  /**
   * Return pixel distance between 2 elements when a translation towards
   * the left is wanted
   * @param {Element} start Starting element
   * @param {Element} end Destination element
   * @return {Number}
   */
  const distanceLeft = (start, end) => {
    start = start.getBoundingClientRect();
    end = end.getBoundingClientRect();

    // TODO
    // const startPlace = getElementPlacement(start);
    // const endPlace = getElementPlacement(end);

    const startPoint = {
      x: start.left,
      y: (start.top + start.bottom) / 2
    };

    let y;
    if (end.top < startPoint.y) {
      if (end.bottom > startPoint.y) {
        y = startPoint.y;
      } else {
        y = end.bottom;
      }
    } else {
      y = end.top;
    }

    const endPoint = {
      x: end.right,
      y: y
    };

    return vectorLength(startPoint, endPoint);
  };

  /**
   * Return pixel distance between 2 elements when a translation towards
   * the right is wanted
   * @param {Element} start Starting element
   * @param {Element} end Destination element
   * @return {Number}
   */
  const distanceRight = (start, end) => {
    const startPlace = getElementPlacement(start);
    const endPlace = getElementPlacement(end);

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
    return vectorLength(startPoint, endPoint);
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
      this.__links = document.body.getElementsByTagName(SELECTABLE_TAG_NAME);

      // document.body.addEventListener('mouseover', (ev) => {
      //   if (this.isActivated() && this.isFocusable(ev.fromElement)) {
      //     this.focus(ev.fromElement);
      //   }
      // });

      // document.body.addEventListener('mouseout', (ev) => {
      //   if (this.getFocused() === ev.fromElement && this.isActivated()) {
      //     this.removeFocus();
      //   }
      // });

      document.body.addEventListener('DOMSubtreeModified', () => {
        if (!this.getFocused() && this.isActivated()) {
          this.focusFirst();
        } else if (!isInScreen(this.getFocused())) {
          this.moveClosest();
        }
      });

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
      return arrayIncludes(this.__links, el) && isInScreen(el);
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
        if (isInScreen(this.__links[i])) {
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
        left:  !!elements.left  && distanceLeft(cur, elements.left),
        right: !!elements.right && distanceRight(cur, elements.right),
        up:    !!elements.up    && distanceUp(cur, elements.up),
        down:  !!elements.down  && distanceDown(cur, elements.down)
      };

      const best = { el: null };

      for (let direction in distances) {
        if (distances[direction] &&
          (!best.el || distances[direction] < best.distance)) {
          best.el = elements[direction];
          best.distance = distances[direction];
        }
      }

      return best.el || (isInScreen(cur) ? cur : null);
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
        el: null,
        placement: {}
      };

      for (let i = 0, len = this.__links.length; i < len; i++) {
        const elem = {
          el: this.__links[i]
        };

        if (
          (isInScreen(elem.el) && elem.el !== focused.el) &&

          // if both in X and Y axis, it means that they are overlaping
          (withinXAxis(focused.el, elem.el) ||
           !withinYAxis(focused.el, elem.el))
        ) {
          elem.placement = this.getPlacement(elem.el);
          if (elem.placement.left > focused.placement.left) {
            elem.distance = distanceRight(focused.el, elem.el);
            if (!currentBest.el || elem.distance < currentBest.distance ) {
              currentBest = elem;
            }
          }
        }
      }
      return currentBest.el ||
        (isInScreen(this.__focused) ? this.__focused : null);
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
        el: null,
        placement: {}
      };

      for (let i = 0, len = this.__links.length; i < len; i++) {
        const elem = { el: this.__links[i] };
        if (
          (isInScreen(elem.el) && elem.el !== focused.el) &&

          // if both in X and Y axis, it means that they are overlaping
          (withinXAxis(focused.el, elem.el) ||
            !withinYAxis(focused.el, elem.el))
        ) {
          elem.placement = this.getPlacement(elem.el);
          if (elem.placement.right < focused.placement.right) {
            elem.distance = distanceLeft(focused.el, elem.el);
            if (!currentBest.el || elem.distance < currentBest.distance ) {
              currentBest = elem;
            }
          }
        }
      }
      return currentBest.el ||
        (isInScreen(this.__focused) ? this.__focused : null);
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
        el: null,
        placement: {}
      };

      for (let i = 0, len = this.__links.length; i < len; i++) {
        const elem = {
          el: this.__links[i]
        };

        if (
          (isInScreen(elem.el) && elem.el !== focused.e) &&

          // if both in X and Y axis, it means that they are overlaping
          (!withinXAxis(focused.el, elem.el) ||
            withinYAxis(focused.el, elem.el))
        ) {
          elem.placement = this.getPlacement(elem.el);
          if (elem.placement.bottom < focused.placement.bottom) {
            elem.distance = distanceUp(focused.el, elem.el);
            if (!currentBest.el || elem.distance < currentBest.distance ) {
              currentBest = elem;
            }
          }
        }
      }
      return currentBest.el ||
        (isInScreen(this.__focused) ? this.__focused : null);
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

      for (let i = 0, len = this.__links.length; i < len; i++) {
        const elem = { el: this.__links[i] };
        if (
          (isInScreen(elem.el) && elem.el !== focused.el) &&

          // if both in X and Y axis, it means that they are overlaping
          (!withinXAxis(focused.el, elem.el) ||
            withinYAxis(focused.el, elem.el))
        ) {
          elem.placement = this.getPlacement(elem.el);
          if (elem.placement.top > focused.placement.top) {
            elem.distance = distanceDown(focused.el, elem.el);
            if (!currentBest.el || elem.distance < currentBest.distance ) {
              currentBest = elem;
            }
          }
        }
      }
      return currentBest.el ||
        (isInScreen(this.__focused) ? this.__focused : null);
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
        addFocusedClass(el);
        this.__focused = el;
        el.focus();
        dispatchMouseEvent(el, 'mouseover');
      }
    }

    /**
     * Remove any current focus (trigger corresponding events).
     */
    removeFocus () {
      if (!this.__focused) {
        return;
      }

      removeFocusedClass(this.__focused);
      this.__focused.blur();
      dispatchMouseEvent(this.__focused, 'mouseout');
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

  exports.Cursor = Cursor;
})(this);
