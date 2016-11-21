# Morora.js

## Overview

Add a Cursor class allowing to navigate between items just with the keyboard.

## How to use

### Automatic navigation

The Cursor is created with sane defaults.

If you just want to navigate between item with the Left, Right, Up and Down key,
and click with the enter keyi you can just instanciate a new Cursor:

```js
// create a new cursor
new Cursor();
```

### Manual navigation

You can also chose to move yourself the cursor on the events you want.

To do that, put the _manual_ option to __true__:
```js
const cursor = new Cursor({ manual: true });

// move left
cursor.moveLeft();

// move Right
cursor.moveRight();

// move up
cursor.moveUp();

// move down
cursor.moveDown();

// launch a click action on the current element
cursor.click();

// focus a particular item
cursor.focus(item);
```
Note that you can do that even with automatic navigation. The only differences
being that the keys _Left_, _Right_, _Up_, _Down_ and _Enter_ are not binded.

### Initially focused element

By default, the _first_ (at the top left of the screen) item is focused. If you
want to select another element by default you can specify the __focus__ option
on instanciation.

```js
new Cursor({ focus: document.getElementById('firstItem') });
```

### How it works

TODO
