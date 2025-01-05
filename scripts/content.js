let searchSymbol = ":";
let inputs, index;
let searchSymbolIndex = -1;
let emojiMenuUp = false;
let searchIndex = 0;
let focusedInputBox;
let emojiText = "";

chrome.storage.local.get("searchSymbol", function (data) {
  if (chrome.runtime.lastError) {
    console.error("Error getting storage:", chrome.runtime.lastError);
  } else {
    if (data.searchSymbol) {
      searchSymbol = data.searchSymbol;
    }
  }
});

// This run emoji menu function gets run multiple times on startup, incase the input boxes haven't loaded yet
// Tried using load on document end but didnt work consistently (example messenger.com)
// Seperate params for inputs, searchboxes and text areas because it didnt work otherwise for some reason
function runEmojiMenu(inputs, searchBoxes, textAreas, contentEditableBoxes) {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeEmojiMenu();
    }
  });

  for (index = 0; index < inputs.length; ++index) {
    let currentInput = inputs[index];
    currentInput.addEventListener("keydown", function (e) {
      handleInputKeydownEvents(e, currentInput);
    });
    currentInput.addEventListener("focus", function (e) {
      if (currentInput != focusedInputBox) {
        closeEmojiMenu();
      }
    });
    currentInput.addEventListener("input", function (e) {
      handleInputText(
        e.target.value,
        e.data,
        currentInput.selectionStart,
        currentInput,
      );
    });
  }

  for (index = 0; index < searchBoxes.length; ++index) {
    let currentInput = searchBoxes[index];
    currentInput.addEventListener("keydown", function (e) {
      handleInputKeydownEvents(e, currentInput);
    });
    currentInput.addEventListener("focus", function (e) {
      if (currentInput != focusedInputBox) {
        closeEmojiMenu();
      }
    });
    currentInput.addEventListener("input", function (e) {
      handleInputText(
        e.target.value,
        e.data,
        currentInput.selectionStart,
        currentInput,
      );
    });
  }

  for (index = 0; index < textAreas.length; ++index) {
    let currentInput = textAreas[index];
    currentInput.addEventListener("keydown", function (e) {
      handleInputKeydownEvents(e, currentInput);
    });
    currentInput.addEventListener("focus", function (e) {
      if (currentInput != focusedInputBox) {
        closeEmojiMenu();
      }
    });
    currentInput.addEventListener("input", function (e) {
      handleInputText(
        e.target.value,
        e.data,
        currentInput.selectionStart,
        currentInput,
      );
    });
  }

  contentEditableBoxes.forEach((currentInput) => {
    currentInput.addEventListener("keydown", function (e) {
      handleInputKeydownEvents(e, currentInput);
    });
    currentInput.addEventListener("focus", function (e) {
      if (currentInput != focusedInputBox) {
        closeEmojiMenu();
      }
    });
    currentInput.addEventListener("input", (e) => {
      console.log("AAA");
      handleInputText(
        e.target.textContent,
        e.data,
        getSelectionInfo(),
        currentInput,
      );
    });
  });
}

function setSearchIndex(newIndex) {
  let searchResults = document.getElementsByClassName(
    "emoji-search-box-result",
  );
  let searchSize = searchResults.length;

  searchIndex = Math.min(searchSize - 1, newIndex);
  searchIndex = Math.max(0, searchIndex);

  for (index = 0; index < searchSize; ++index) {
    let listItem = searchResults[index];
    if (index === searchIndex) {
      listItem.style.backgroundColor = "lavender";
    } else {
      listItem.style.backgroundColor = "#f2f2f2";
    }
  }
}

function handleInputKeydownEvents(e, currentInput) {
  if (!emojiMenuUp) return;
  if (e.key === "ArrowDown") {
    setSearchIndex(1);
    currentInput.blur();
    let emojiSearchBox = createEmojiMenu();
    emojiSearchBox.focus();
    focusedInputBox = currentInput;
  } else if (e.key === "ArrowUp") {
    currentInput.blur();
    let emojiSearchBox = createEmojiMenu();
    emojiSearchBox.focus();
  } else if (e.key === "Enter" && emojiMenuUp) {
    handleEmojjiInsertionWithEnter(e);
  }
}

function handleInputText(textContent, lastTyped, selectionStart, currentInput) {
  focusedInputBox = currentInput;

  // if there is no menu
  // They typed a search symbols -> open search menu
  // else -> exit out
  if (searchSymbolIndex == -1) {
    if (lastTyped != searchSymbol) return;
    searchSymbolIndex = selectionStart - 1;
    createEmojiMenu(currentInput, "");
    return;
  }
  // close menu if you start typing somewhere else;
  if (textContent[searchSymbolIndex] != searchSymbol) {
    closeEmojiMenu();
    return;
  }

  // if they type two search symbols, if there is only 1 result then insert it, otherwise close
  if (lastTyped == searchSymbol) {
    let exactEmoji = searchExactEmoji(emojiText);
    if (exactEmoji != null) {
      handleEmojiInsertion(exactEmoji, true);
    } else {
      closeEmojiMenu();
    }
    return;
  }

  // If the user types colon followed by a space, just close the menu
  if (lastTyped == " " && selectionStart - 2 == searchSymbolIndex) {
    closeEmojiMenu();
    return;
  }

  // Else they are currently typing out an emoji
  emojiText = textContent.substring(searchSymbolIndex + 1, selectionStart);
  setSearchIndex(0);
  let newEmojiMenu = createEmojiMenu();
  existingMenu = newEmojiMenu;
}

function createEmojiMenu() {
  emojiMenuUp = true;
  let emojiSearchMenu = createEmojiSearchMenuHtml(emojiText, searchIndex);

  emojiSearchMenu.addEventListener("keydown", function (e) {
    if (!emojiMenuUp) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchIndex(searchIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchIndex(searchIndex - 1);
    } else if (e.key === "Enter") {
      handleEmojjiInsertionWithEnter(e);
    } else {
      emojiSearchMenu.blur();
      focusedInputBox.focus();
    }
  });

  [...document.getElementsByClassName("emoji-search-box")].map(
    (n) => n && n.remove(),
  );

  const rect = focusedInputBox.getBoundingClientRect();
  emojiSearchMenu.style.left = rect.left + "px";

  document.body.appendChild(emojiSearchMenu);
  let emojiSearchMenuHeight = emojiSearchMenu.getBoundingClientRect().height;

  if (isDivInTopHalf(focusedInputBox)) {
    emojiSearchMenu.style.top = rect.top + rect.height + "px";
  } else {
    emojiSearchMenu.style.top = rect.top - emojiSearchMenuHeight + "px";
  }

  addMouseControls();

  return emojiSearchMenu;
}

function closeEmojiMenu() {
  emojiMenuUp = false;
  [...document.getElementsByClassName("emoji-search-box")].map(
    (n) => n && n.remove(),
  );
  setSearchIndex(0);
  searchSymbolIndex = -1;
  emojiText = "";
}

function handleEmojjiInsertionWithClick() {
  let searchResults = document.getElementsByClassName(
    "emoji-search-box-result",
  );
  if (searchResults == null || searchResults.length === 0) {
    closeEmojiMenu();
    return;
  }
  const searchedEmoji = getSearchedEmoji(emojiText, searchIndex);

  handleEmojiInsertion(searchedEmoji, false);
}

function handleEmojjiInsertionWithEnter(e) {
  e.preventDefault();
  let searchResults = document.getElementsByClassName(
    "emoji-search-box-result",
  );
  if (searchResults == null || searchResults.length === 0) {
    closeEmojiMenu();
    return;
  }
  const searchedEmoji = getSearchedEmoji(emojiText, searchIndex);

  handleEmojiInsertion(searchedEmoji, false);
}

function handleEmojiInsertion(searchedEmoji, insertedWithColon) {
  let currentText = focusedInputBox.value;
  let isAriaTextBox = false;
  if (!currentText) {
    isAriaTextBox = true;
    currentText = focusedInputBox.textContent;
  }
  console.log("Current text ", currentText);

  if (isAriaTextBox) {
    focusedInputBox.focus();
    const selection = window.getSelection();
    if (!selection) {
      console.error("Could not get selection object.");
      return;
    }

    const range = selection.getRangeAt(0); // Get the current range
    if (!range) {
      console.error("Could not get range object.");
      return;
    }

    // Check if the range is in the focused input box
    if (!focusedInputBox.contains(range.commonAncestorContainer)) {
      console.warn(
        "Selection is not within the focused input box. Doing nothing",
      );
      return;
    }

    // Calculate the new start position for the range
    let newStart = range.startOffset;
    newStart = searchSymbolIndex;
    range.setStart(range.startContainer, newStart);
    range.setEnd(range.startContainer, newStart + emojiText.length + 1);
    console.log(range);
    range.deleteContents();

    document.execCommand("insertText", false, searchedEmoji);
  } else {
    let left = currentText.substr(0, searchSymbolIndex);
    if (searchSymbolIndex === 0) {
      left = "";
    }
    let rigth_start_index = searchSymbolIndex + 1;
    if (insertedWithColon) {
      rigth_start_index += 1;
    }
    let right = currentText.substr(rigth_start_index + emojiText.length);
    const newText = left + searchedEmoji + right;
    focusedInputBox.value = newText;
    focusedInputBox.setSelectionRange(
      searchSymbolIndex + searchedEmoji.length,
      searchSymbolIndex + searchedEmoji.length,
    );
  }

  focusedInputBox.focus();
  closeEmojiMenu();
  return;
}

function addMouseControls() {
  Array.from(
    document.getElementsByClassName("emoji-search-box-result"),
  ).forEach((item, index) => {
    item.addEventListener("mouseover", () => {
      setSearchIndex(index);
    });
    item.addEventListener("click", () => {
      handleEmojjiInsertionWithClick();
    });
  });

  document
    .getElementById("search-box-tooltip")
    .addEventListener("click", () => {
      closeEmojiMenu();
      focusedInputBox.focus();
    });
}

function getSelectionInfo() {
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    return range.endOffset;
  } else {
    return 0;
  }
}
