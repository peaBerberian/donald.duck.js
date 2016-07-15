// TODO Clean up Donald class check state and all
// TODO move events management to utils.
// TODO Checks event sent are the one we want / are needed.
// TODO Webpack?
// TODO DRYer?
// TODO Lint
// TODO Tests?

(function(exports) {
  /**
   * ClassName added to a focused link
   * @type {string}
   */
  var FOCUSED_CLASSNAME = '_donald_';

  /**
   * Tag name of the 'selectable' elements
   * @type {string}
   */
  var SELECTABLE_TAG_NAME = 'a';

  /**
   * Key codes from keyboard events
   * @type {Object}
   */
  var KEY_CODES = {
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
  var isInScreen = function(el) {
    if (!el) { return false; }
    var position = el.getBoundingClientRect();
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
  var arrayIncludes = function(a, obj) {
    var i = a.length;
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
  var dispatchMouseEvent = function(el, type) {
    if (!el) return;
    var ev = document.createEvent('MouseEvents');
    var placement = el.getBoundingClientRect();
    var x = el.left;
    var y = el.top;
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
  var elementsOverlap = function(element1, element2) {
    return withinXAxis(element1, element2) && withinYAxis(element1, element2);
  };

  /**
   * Return true if the two elements share the same x axis (horizontally)
   * @param {DOMElement} element1
   * @param {DOMElement} element2
   * @return {Boolean}
   */
  var withinXAxis = function(element1, element2) {
    if (!element1 || !element2) { return false; }
    var position1 = element1.getBoundingClientRect();
    var position2 = element2.getBoundingClientRect();
    return position1.bottom > position2.top &&
           position1.top    < position2.bottom;
  };

  /**
   * Return true if the two elements share the same y axis (vertically)
   * @param {DOMElement} element1
   * @param {DOMElement} element2
   * @return {Boolean}
   */
  var withinYAxis = function(element1, element2) {
    if (!element1 || !element2) { return false; }
    var position1 = element1.getBoundingClientRect();
    var position2 = element2.getBoundingClientRect();
    return position1.right > position2.left &&
           position1.left  < position2.right;
  };

  /**
   * Add FOCUSED_CLASSNAME to a Dom element
   * @param {Element} element
   */
  var addFocusedClass = function(element) {
    return element.classList.add(FOCUSED_CLASSNAME);
  };

  /**
   * Remove FOCUSED_CLASSNAME to a Dom element
   * @param {Element} element
   */
  var removeFocusedClass = function(element) {
    return element.classList.remove(FOCUSED_CLASSNAME);
  };

  /**
   * Return pixel distance between 2 points
   * @param {Object} point1 { x, y }
   * @param {Object} point2 { x, y }
   * @return {Number}
   */
  var vectorLength = function(point1, point2) {
    var xs = point2.x - point1.x;
    var ys = point2.y - point1.y;
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
  var distanceDown = function(start, end) {
    start = start.getBoundingClientRect();
    end = end.getBoundingClientRect();

    // TODO
    // var startPlace = getElementPlacement(start);
    // var endPlace = getElementPlacement(end);

   var startPoint = {
     x: (start.left + start.right) / 2,
     y: start.bottom
   };

   var endPoint = {
     x: end.left < startPoint.x ?
       (end.right > startPoint.x ? startPoint.x : end.right)
       : end.left,
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
  var distanceUp = function(start, end) {
    start = start.getBoundingClientRect();
    end = end.getBoundingClientRect();

    // TODO
    // var startPlace = getElementPlacement(start);
    // var endPlace = getElementPlacement(end);

   var startPoint = {
     x: (start.left + start.right) / 2,
     y: start.top
   };

   var endPoint = {
     x: end.left < startPoint.x ?
       (end.right > startPoint.x ? startPoint.x : end.right)
       : end.left,
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
  var distanceLeft = function(start, end) {
    start = start.getBoundingClientRect();
    end = end.getBoundingClientRect();

    // TODO
    // var startPlace = getElementPlacement(start);
    // var endPlace = getElementPlacement(end);

    var startPoint = {
      x: start.left,
      y: (start.top + start.bottom) / 2
    };

    var endPoint = {
      x: end.right,
      y: end.top < startPoint.y ?
        (end.bottom > startPoint.y ? startPoint.y : end.bottom)
        : end.top
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
  var distanceRight = function(start, end) {
    var startPlace = getElementPlacement(start);
    var endPlace = getElementPlacement(end);

    var startPoint = {
      x: startPlace.right,
      y: (startPlace.top + startPlace.bottom) / 2
    };

    var endPoint = {
      x: endPlace.left,
      y: endPlace.top < startPoint.y ?
        (endPlace.bottom > startPoint.y ? startPoint.y : endPlace.bottom)
        : endPlace.top
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
  var getElementPlacement: function(el) {
    var placement = el.getBoundingClientRect();

    return {
      top: placement.top,
      left: placement.left,
      width: placement.width,
      height: placement.height
    };
  };

  var Donald = function(el) {
    this.__focused = null;
    this.__links = document.body.getElementsByTagName(SELECTABLE_TAG_NAME);

    var donald = this;
    window.addEventListener('keydown', function(ev) {
      switch (ev.keyCode) {
        case KEY_CODES.LEFT:
          donald.moveLeft();
        break;
        case KEY_CODES.UP:
          donald.moveUp();
        break;
        case KEY_CODES.RIGHT:
          donald.moveRight();
        break;
        case KEY_CODES.DOWN:
          donald.moveDown();
        break;
        case KEY_CODES.ENTER:
          donald.click();
        break;
      }
    });

    if (el) {
      this.focus(el);
    }

    // document.body.addEventListener("mouseout", function(ev) {
    //   if (donald.getFocused() === ev.fromElement && donald.isActivated()) {
    //     donald.removeFocus();
    //   }
    // });

   document.body.addEventListener("mouseover", function(ev) {
      if (donald.isActivated() && donald.isFocusable(ev.fromElement)) {
        donald.focus(ev.fromElement);
      }
    });

    document.body.addEventListener("DOMSubtreeModified", function(){
      if (!donald.getFocused() && donald.isActivated()) {
        donald.focusFirst();
      } else if (!isInScreen(donald.getFocused())) {
        donald.moveClosest();
      }
    });

  };

  Donald.prototype = {

    /**
     * Deactivate Donald management and focus.
     */
    deactivate: function() {
      this.removeFocus();
      this.__deactivated = true;
    },

    /**
     * Activate Donald management and focus.
     */
    activate: function() {
      this.__deactivated = false;
      this.focusFirst();
    },

    /**
     * Returns true if donald is activated.
     * @returns {Boolean}
     */
    isActivated: function() {
      return !this.__deactivated;
    },

    /**
     * Returns true if the given HTML element can be focused.
     * @param {HTMLElement} el
     * @returns {Boolean}
     */
    isFocusable: function(el) {
      return arrayIncludes(this.__links, el) && isInScreen(el);
    },

    /**
     * "Clicks" on the focused element.
     */
    click: function() {
      if (this.__deactivated) { return ; }
      if (!this.__focused) { return ; }

      if (this.__focused.click) {
        this.__focused.click();
      } else if (this.__focused.hasAttribute('href')) {
        window.location = href;
      }
    },

    /**
     * Move the focus to the element on the left.
     */
    moveLeft: function() {
      if (!this.__focused) {
        return this.focusFirst();
      }
      return this.focus(this.getLeft());
    },

    /**
     * Move the focus to the element on the right.
     */
    moveRight: function() {
      if (!this.__focused) {
        return this.focusFirst();
      }
      return this.focus(this.getRight());
    },

    /**
     * Move the focus to the element on the top.
     */
    moveUp: function() {
      if (!this.__focused) {
        return this.focusFirst();
      }
      return this.focus(this.getUp());
    },

    /**
     * Move the focus to the element on the bottom.
     */
    moveDown: function() {
      if (!this.__focused) {
        return this.focusFirst();
      }
      return this.focus(this.getDown());
    },

    /**
     * Move the focus to the closest element.
     */
    moveClosest: function() {
      if (!this.__focused) {
        return this.focusFirst();
      }
      return this.focus(this.getClosest());
    },

    /**
     * Focus 'first' element focusable.
     * @see getFirst
     */
    focusFirst: function() {
      if (this.__focused) {
        this.removeFocus();
      }

      var link = this.getFirst();
      if (!link) { return; }
      return this.focus(link);
    },

    /**
     * Get 'first' element focusable (first focusable element in the DOM).
     * @returns {HTMLElement|undefined}
     */
    getFirst: function() {
      for (var i = 0, len = this.__links.length; i < len; i++) {
        if (isInScreen(this.__links[i])) {
          return this.__links[i];
        }
      }
    },

    /**
     * Get closest element relatively to the currently focused one.
     * @returns {HTMLElement|undefined}
     */
    getClosest: function() {
      var cur = this.__focused;

      if (!cur) {
        return this.getFirst();
      }

      var elements = {
        left: this.getLeft(),
        right: this.getRight(),
        up: this.getUp(),
        down: this.getDown()
      };

      for (var direction in distances) {
        if (elements[direction] === cur) {
          elements[direction] = null;
        }
      }

      var distances = {
        left:  !!elements.left  && distanceLeft(cur, elements.left),
        right: !!elements.right && distanceRight(cur, elements.right),
        up:    !!elements.up    && distanceUp(cur, elements.up),
        down:  !!elements.down  && distanceDown(cur, elements.down)
      };

      var best = { el: null };

      for (direction in distances) {
        if (distances[direction] &&
            (!best.el || distances[direction] < best.distance)) {
          best.el = elements[direction];
          best.distance = distances[direction];
        }
      }

      return best.el || (isInScreen(cur) ? cur : null);
    },

    /**
     * Get next element to the right relatively to the currently focused
     * one.
     * @returns {HTMLElement|undefined}
     */
    getRight: function() {
      if (!this.__focused) {
        return this.getFirst();
      }

      var focused     = {
        el: this.__focused,
        placement: this.getPlacement()
      };

      var currentBest = {
        el: null,
        placement: {}
      };

      for (var i = 0, len = this.__links.length; i < len; i++) {
        var elem = { el: this.__links[i] };
        if (!isInScreen(elem.el) || elem.el === focused.el) {
          continue;
        }
        // if both in X and Y axis, it means that they are overlaping
        if (!withinXAxis(focused.el, elem.el) &&
            withinYAxis(focused.el, elem.el)) {
          continue;
        }
        elem.placement = this.getPlacement(elem.el);
        if (elem.placement.left > focused.placement.left) {
          elem.distance = distanceRight(focused.el, elem.el);
          if (!currentBest.el || elem.distance < currentBest.distance ) {
            currentBest = elem;
          }
        }
      }
      return currentBest.el ||
        (isInScreen(this.__focused) ? this.__focused : null);
    },

    /**
     * Get next element to the left relatively to the currently focused
     * one.
     * @returns {HTMLElement|undefined}
     */
    getLeft: function() {
      if (!this.__focused) {
        return this.getFirst();
      }

      var focused     = { el: this.__focused, placement: this.getPlacement()},
          currentBest = { el: null, placement: {} };

      for (var i = 0, len = this.__links.length; i < len; i++) {
        var elem = { el: this.__links[i] };
        if (!isInScreen(elem.el) || elem.el === focused.el) {
          continue;
        }
        // if both in X and Y axis, it means that they are overlaping
        if (!withinXAxis(focused.el, elem.el) &&
            withinYAxis(focused.el, elem.el)) {
          continue;
        }
        elem.placement = this.getPlacement(elem.el);
        if (elem.placement.right < focused.placement.right) {
          elem.distance = distanceLeft(focused.el, elem.el);
          if (!currentBest.el || elem.distance < currentBest.distance ) {
            currentBest = elem;
          }
        }
      }
      return currentBest.el ||
        (isInScreen(this.__focused) ? this.__focused : null);
    },

    /**
     * Get next element to the top relatively to the currently focused
     * one.
     * @returns {HTMLElement|undefined}
     */
    getUp: function() {
      if (!this.__focused) {
        return this.getFirst();
      }

      var focused = {
        el: this.__focused,
        placement: this.getPlacement()
      };

      var currentBest = {
        el: null,
        placement: {}
      };

      for (var i = 0, len = this.__links.length; i < len; i++) {
        var elem = { el: this.__links[i] };
        if (!isInScreen(elem.el) || elem.el === focused.e) {
          continue;
        }
        // if both in X and Y axis, it means that they are overlaping
        if (withinXAxis(focused.el, elem.el) &&
            !withinYAxis(focused.el, elem.el)) {
          continue;
        }
        elem.placement = this.getPlacement(elem.el);
        if (elem.placement.bottom < focused.placement.bottom) {
          elem.distance = distanceUp(focused.el, elem.el);
          if (!currentBest.el || elem.distance < currentBest.distance ) {
            currentBest = elem;
          }
        }
      }
      return currentBest.el ||
        (isInScreen(this.__focused) ? this.__focused : null);
    },

    /**
     * Get next element toward the bottom relatively to the currently focused
     * one.
     * @returns {HTMLElement|undefined}
     */
    getDown: function() {
      if (!this.__focused) {
        return this.getFirst();
      }

      var focused     = { el: this.__focused, placement: this.getPlacement()},
          currentBest = { el: null, placement: {} };

      for (var i = 0, len = this.__links.length; i < len; i++) {
        var elem = { el: this.__links[i] };
        if (!isInScreen(elem.el) || elem.el === focused.el) {
          continue;
        }
        // if both in X and Y axis, it means that they are overlaping
        if (withinXAxis(focused.el, elem.el) && !withinYAxis(focused.el, elem.el)) {
          continue;
        }
        elem.placement = this.getPlacement(elem.el);
        if (elem.placement.top > focused.placement.top) {
          elem.distance = distanceDown(focused.el, elem.el);
          if (!currentBest.el || elem.distance < currentBest.distance ) {
            currentBest = elem;
          }
        }
      }
      return currentBest.el || (isInScreen(this.__focused) ? this.__focused : null);
    },

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
    getPlacement: function(el) {
      if (!el) {
        if (!this.__focused) {
          return { top: 0, left: 0, width: 0, height: 0 };
        }
        el = this.__focused;
      }
      return el.getBoundingClientRect();
    },

    /**
     * Get currently focused element.
     * @returns {HTMLElement|null}
     */
    getFocused: function() {
      return this.__focused;
    },

    /**
     * Get list of focusable elements.
     * @returns {NodeList|undefined}
     */
    getList: function() {
      return this.__links;
    },

    /**
     * Focus element given / 'first' element.
     * @param {HTMLElement} [el]
     */
    focus: function(el) {
      if (this.__deactivated) { return ; }
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
    },

    /**
     * Remove any current focus (trigger corresponding events).
     */
    removeFocus: function() {
      if (!this.__focused) { return ; }

      removeFocusedClass(this.__focused);
      this.__focused.blur();
      dispatchMouseEvent(this.__focused, 'mouseout');
      this.__focused = null;
    },

    /**
     * Checks if the given element is currently being focused.
     * @param {HTMLElement} el
     * @returns {Boolean}
     */
    isFocused: function(el) {
      return this.__focused === el;
    }
  };

  exports.Donald = new Donald();
})(this);
