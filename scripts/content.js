let searchSymbol = ":";

chrome.storage.local.get("searchSymbol", function (data) {
  if (chrome.runtime.lastError) {
    console.error("Error getting storage:", chrome.runtime.lastError);
  } else {
    if (data.searchSymbol) {
      searchSymbol = data.searchSymbol;
    }
  }
});

let inputs, index;
let searchSymbolIndex = -1;
let emojiMenuUp = false;
let searchIndex = 0;
let focusedInputBox;
let emojiText = "";

function runEmojiMenu(inputs, ariaInputs) {
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

  ariaTextBoxes.forEach((textbox) => {
    textbox.addEventListener("keydown", function (e) {
      handleInputKeydownEvents(e, textbox);
    });
    textbox.addEventListener("input", (event) => {
      handleInputText(event.target.textContent, textbox);
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

function handleInputKeydownEvents(e, currentInput) {
  if (!emojiMenuUp) return;
  let searchResults = document.getElementsByClassName(
    "emoji-search-box-result",
  );
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
    let searchResults = document.getElementsByClassName(
      "emoji-search-box-result",
    );
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
  focusedInputBox.focus();
  closeEmojiMenu();
  return;
}
