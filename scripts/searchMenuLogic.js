// Global variables
let searchSymbol = ":";
let searchSymbolIndex = -1;
let searchMenuIsUp = false;
let highlightedSearchResultIndex = 0;
let focusedInputBox;
let searchText = "";
let listenForSearch = false;

// Retrieve custom search symbol from storage if available.
chrome.storage.local.get("searchSymbol", function (data) {
  if (chrome.runtime.lastError) {
    console.error("Error getting storage:", chrome.runtime.lastError);
  } else if (data.searchSymbol) {
    searchSymbol = data.searchSymbol;
  }
});

// Run search list on both HTML inputs and React contentEditable boxes.
function runSearchList(inputs, contentEditableBoxes) {
  // Global listener to close the menu on Escape or Enter
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Enter") {
      console.log("Esc or Enter pressed globally");
      closeSearchMenu();
    }
  });

  // React contentEditable text boxes
  contentEditableBoxes.forEach((currentInput) => {
    if (!currentInput.hasAttribute("searchMenuApplied")) {
      currentInput.addEventListener("keydown", function (e) {
        console.log("Keydown event");

        if (e.key === searchSymbol) {
          const cursorPos = getCursorPosition();
          const text = currentInput.textContent;

          if (cursorPos == 0 || text[cursorPos - 1] == " ") {
            // semicolon as first character
            console.log("Script is listening for emoji name");
            handleInputText(
              e.target.textContent,
              ":",
              getCursorPosition(),
              currentInput
            );
          }
          return;
        } else if (searchMenuIsUp) {
          handleInputKeydownEvents(e, currentInput);
        } 
      });

      currentInput.addEventListener("focus", function () {
        console.log("Focus event");
        if (currentInput !== focusedInputBox) {
          closeSearchMenu();
        }
      });

      currentInput.addEventListener("input", (e) => {
        console.log("Input event");
        handleInputText(
          e.target.textContent,
          e.data,
          getCursorPosition(),
          currentInput
        );
      });
    }
    currentInput.setAttribute("searchMenuApplied", "true");
    currentInput.setAttribute("isContentEditableTextField", "true");
  });
}

// Adjusted function to set the highlighted search result index.
function setSearchIndex(newIndex) {
  const searchResults = document.getElementsByClassName("searchResultRow");
  const searchSize = searchResults.length;
  highlightedSearchResultIndex = Math.min(searchSize - 1, newIndex);
  highlightedSearchResultIndex = Math.max(0, highlightedSearchResultIndex);

  for (let index = 0; index < searchSize; ++index) {
    let listItem = searchResults[index];
    listItem.style.backgroundColor =
      index === highlightedSearchResultIndex ? "lavender" : "#f2f2f2";
  }
}

// Handle key events when the emoji menu is up.
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

// Unified input handling for both HTML inputs and contentEditable divs.
function handleInputText(textContent, lastTyped, selectionStart, currentInput) {
  console.log("Handling Input Text")
  focusedInputBox = currentInput;
  // Update selectionStart in case it changed (for contentEditable fields)
  selectionStart = getCursorPosition();

  // If there is no active trigger, only process if the last typed character is the search symbol.
  if (searchSymbolIndex == -1) {
    if (lastTyped !== searchSymbol) return;
    // Set the trigger and wait for another character to be typed.
    searchSymbolIndex = selectionStart - 1;
    createSearchMenu();
    return;
  }

  // If the character at searchSymbolIndex is no longer our search symbol, cancel the trigger.
  if (textContent[searchSymbolIndex] !== searchSymbol) {
    console.log("Closed search menu");
    closeSearchMenu();
    return;
  }

  // If the user types a space (indicating the end of the search term), close the menu.
  if (lastTyped === " ") {
    console.log("Closed search menu");
    closeSearchMenu();
    return;
  }

  // Update the searchText from the position immediately after the colon to the current cursor.
  searchText = textContent.substring(searchSymbolIndex + 1, selectionStart);
  setSearchIndex(0);
  const newSearchMenu = createSearchMenu();
  existingMenu = newSearchMenu;

  // // Only display the menu if there's at least one character after the colon.
  // if (searchText.length > 0) {
  // }
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