// import Cursor from 'morora.js';

const KEY_SETS = {
  UPPER: [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '\'', '.', ',', '_',
    '-', '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
  ],
  LOWER: [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '\'', '.', ',', '_',
    '-', '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
  ],
  SYMBOLS: [
    ']', ']', '{', '}', ';', '\'', '\\', ':', '"', '|', ',', '.', '/', '-', '=',
    '_', '+', '*', '<', '>', 'à', 'á', 'â', 'ä', 'æ', 'ç', 'é', 'è', 'ê', 'ë',
    '&', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
  ]
};

const keyboardEl = document.getElementsByClassName('keyboard')[0];
const inputEl = document.getElementsByClassName('k-input')[0];

const onKey = (key) => {
  const initialLength = inputEl.textContent.length;
  inputEl.textContent += key;

  if (!initialLength && currentLayout === 'upper') {
    window.switchCase();
  }
};

const setKeyboardLayout = (layout) => {
  const setKeySet = (keySet) => {
    const keys = keyboardEl.getElementsByClassName('k-key');
    keySet.forEach((key, index) => {
      keys[index].textContent = key;
      keys[index].onclick = () => {
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
let currentLayout = 'upper';
let lastLetterLayout = 'upper';

new window.Cursor();

window.onDelete = () => {
  const initialLength = inputEl.textContent.length;
  if (!initialLength) {
    return;
  }

  inputEl.textContent = inputEl.textContent.substr(
    0, inputEl.textContent.length - 1
  );

  const newLength = inputEl.textContent.length;
  if (!newLength && currentLayout === 'lower') {
    window.switchCase();
  }
};

window.switchCase = () => {
  let newLayout = lastLetterLayout === 'upper' ? 'lower' : 'upper';
  setKeyboardLayout(newLayout);
  currentLayout = newLayout;
  lastLetterLayout = newLayout;
};

window.switchToSymbols = () => {
  if (currentLayout === 'symbols') {
    window.switchCase();
  } else {
    setKeyboardLayout('symbols');
    currentLayout = 'symbols';
  }
};

window.onKey = onKey;
