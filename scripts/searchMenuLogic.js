let searchSymbol = ":";
let searchSymbolIndex = -1;
let searchMenuIsUp = false;
let highlightedSearchResultIndex = 0;
let focusedInputBox;
let searchText = "";

chrome.storage.local.get("searchSymbol", function (data) {
  if (chrome.runtime.lastError) {
    console.error("Error getting storage:", chrome.runtime.lastError);
  } else {
    if (data.searchSymbol) {
      searchSymbol = data.searchSymbol;
    }
  }
});

function runSearchList(inputs, contentEditableBoxes) {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Enter") {
      closeSearchMenu();
    }
  });

  // html input boxes
  inputs.forEach((currentInput) => {
    if (!currentInput.hasAttribute("searchMenuApplied")) {
      currentInput.addEventListener("keydown", function (e) {
        handleInputKeydownEvents(e, currentInput);
      });
      currentInput.addEventListener("focus", function (e) {
        if (currentInput != focusedInputBox) {
          closeSearchMenu();
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
    currentInput.setAttribute("searchMenuApplied", "true");
  });

  // react text boxes
  contentEditableBoxes.forEach((currentInput) => {
    if (!currentInput.hasAttribute("searchMenuApplied")) {
      currentInput.addEventListener("keydown", function (e) {
        handleInputKeydownEvents(e, currentInput);
      });
      currentInput.addEventListener("focus", function (e) {
        if (currentInput != focusedInputBox) {
          closeSearchMenu();
        }
      });
      currentInput.addEventListener("input", (e) => {
        handleInputText(
          e.target.textContent,
          e.data,
          getCursorPosition(),
          currentInput,
        );
      });
    }
    currentInput.setAttribute("searchMenuApplied", "true");
    currentInput.setAttribute("isContentEditableTextField", "true");
  });
}

function setSearchIndex(newIndex) {
  let searchResults = document.getElementsByClassName("searchResultRow");
  let searchSize = searchResults.length;

  highlightedSearchResultIndex = Math.min(searchSize - 1, newIndex);
  highlightedSearchResultIndex = Math.max(0, highlightedSearchResultIndex);

  for (index = 0; index < searchSize; ++index) {
    let listItem = searchResults[index];
    if (index === highlightedSearchResultIndex) {
      listItem.style.backgroundColor = "lavender";
    } else {
      listItem.style.backgroundColor = "#f2f2f2";
    }
  }
}

function handleInputKeydownEvents(e, currentInput) {
  if (!searchMenuIsUp) return;
  if (e.key === "ArrowDown") {
    setSearchIndex(1);
    currentInput.blur();
    let searchBox = createSearchMenu();
    searchBox.focus();
    focusedInputBox = currentInput;
  } else if (e.key === "ArrowUp") {
    currentInput.blur();
    let newSearchMenu = createSearchMenu();
    newSearchMenu.focus();
  } else if (e.key === "Enter" && searchMenuIsUp) {
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
    createSearchMenu(currentInput, "");
    return;
  }
  // close menu if you start typing somewhere else;
  if (textContent[searchSymbolIndex] != searchSymbol) {
    closeSearchMenu();
    return;
  }

  // if they type two search symbols, if there is only 1 result then insert it, otherwise close
  if (lastTyped == searchSymbol) {
    let exactSearchResult = searchExactResult(searchText);
    if (exactSearchResult != null) {
      handleSearchResultInsertion(exactSearchResult, true);
    } else {
      closeSearchMenu();
    }
    return;
  }

  // If the user types colon followed by a space, just close the menu
  if (lastTyped == " " && selectionStart - 2 == searchSymbolIndex) {
    closeSearchMenu();
    return;
  }

  // Else they are currently searching
  searchText = textContent.substring(searchSymbolIndex + 1, selectionStart);
  setSearchIndex(0);
  let newSearchMenu = createSearchMenu();
  existingMenu = newSearchMenu;
}

function createSearchMenu() {
  searchMenuIsUp = true;
  let newSearchMenu = createSearchMenuHtml(
    searchText,
    highlightedSearchResultIndex,
  );

  if (focusedInputBox.hasAttribute("isContentEditableTextField")) {
    newSearchMenu.appendChild(createArrowKeysDisabledToolTipElement());
  }

  newSearchMenu.addEventListener("keydown", function (e) {
    if (!searchMenuIsUp) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchIndex(highlightedSearchResultIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchIndex(highlightedSearchResultIndex - 1);
    } else if (e.key === "Enter") {
      handleEmojjiInsertionWithEnter(e);
    } else {
      newSearchMenu.blur();
      focusedInputBox.focus();
    }
  });

  [...document.getElementsByClassName("searchMenu")].map(
    (n) => n && n.remove(),
  );

  const rect = focusedInputBox.getBoundingClientRect();
  newSearchMenu.style.left = rect.left + "px";

  document.body.appendChild(newSearchMenu);
  let searchMenuHeight = newSearchMenu.getBoundingClientRect().height;

  if (isDivInTopHalf(focusedInputBox)) {
    newSearchMenu.style.top = rect.top + rect.height + "px";
  } else {
    newSearchMenu.style.top = rect.top - searchMenuHeight + "px";
  }

  addMouseControls();

  return newSearchMenu;
}

function closeSearchMenu() {
  searchMenuIsUp = false;
  [...document.getElementsByClassName("searchMenu")].map(
    (n) => n && n.remove(),
  );
  setSearchIndex(0);
  searchSymbolIndex = -1;
  searchText = "";
}

function handleEmojjiInsertionWithClick() {
  let searchResults = document.getElementsByClassName("searchResultRow");
  if (searchResults == null || searchResults.length === 0) {
    closeSearchMenu();
    return;
  }
  const searchedResult = getSearchResult(
    searchText,
    highlightedSearchResultIndex,
  );

  handleSearchResultInsertion(searchedResult, false);
}

function handleEmojjiInsertionWithEnter(e) {
  
    e.preventDefault();
    e.stopImmediatePropagation()
    
    let searchResults = document.getElementsByClassName("searchResultRow");
    if (searchResults == null || searchResults.length === 0) {
      closeSearchMenu();
      return;
    }
    
    const searchedResult = getSearchResult(
      searchText,
      highlightedSearchResultIndex,
    );

    handleSearchResultInsertion(searchedResult, false);  
}

function handleSearchResultInsertion(searchedResult, insertedWithColon) {
  try {
    let currentText = focusedInputBox.value;
    let isContentEditableDiv = false;
    if (!currentText) {
      isContentEditableDiv = true;
      currentText = focusedInputBox.textContent;
    }

    if (isContentEditableDiv) {
      focusedInputBox.focus();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0); // Get the current range

      let newStart = range.startOffset;
      newStart = searchSymbolIndex;
      range.setStart(range.startContainer, newStart);
      range.setEnd(range.startContainer, newStart + searchText.length + 1);
      range.deleteContents();

      document.execCommand("insertText", false, searchedResult);
    } else {
      let left = currentText.substr(0, searchSymbolIndex);
      if (searchSymbolIndex === 0) {
        left = "";
      }
      let rigth_start_index = searchSymbolIndex + 1;
      if (insertedWithColon) {
        rigth_start_index += 1;
      }
      let right = currentText.substr(rigth_start_index + searchText.length);
      const newText = left + searchedResult + right;
      focusedInputBox.value = newText;
      focusedInputBox.setSelectionRange(
        searchSymbolIndex + searchedResult.length,
        searchSymbolIndex + searchedResult.length,
      );
    }
    focusedInputBox.focus();
    closeSearchMenu();
    return;
  } catch (exception) {
    focusedInputBox.focus();
    closeSearchMenu();
    return;
  }
}

function addMouseControls() {
  Array.from(document.getElementsByClassName("searchResultRow")).forEach(
    (item, index) => {
      item.addEventListener("mouseover", () => {
        setSearchIndex(index);
      });
      item.addEventListener("click", () => {
        handleEmojjiInsertionWithClick();
      });
    },
  );

  document.getElementById("searchToolTip").addEventListener("click", () => {
    closeSearchMenu();
    focusedInputBox.focus();
  });
}

function getCursorPosition() {
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    return range.endOffset;
  } else {
    return 0;
  }
}
