var inputs, index;
var colonIndex = -1;
var emojiMenuUp = false;
var searchIndex = 0;
var focusedInputBox;
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

  function handleInputKeydownEvents(e, currentInput) {
    if (!emojiMenuUp) return;
    let searchResults = document.getElementsByClassName(
      "emoji-search-box-result",
    );
    let searchSize = searchResults.length;
    if (e.key === "ArrowDown") {
      searchIndex = 1;
      searchIndex = Math.min(searchSize - 1, searchIndex);
      currentInput.blur();
      let emojiSearchBox = createEmojiMenu();
      emojiSearchBox.focus();
      focusedInputBox = currentInput;
    } else if (e.key === "ArrowUp") {
      currentInput.blur();
      let emojiSearchBox = createEmojiMenu();
      emojiSearchBox.focus();
    } else if (e.key === "Enter" && emojiMenuUp) {
      handleEmojjiInsertionWithEnter(e, searchResults);
    }
  }

  function handleInputText(
    textContent,
    lastTyped,
    selectionStart,
    currentInput,
  ) {
    focusedInputBox = currentInput;

    // if there is no menu
    // They typed a colon -> open search menu
    // else -> exit out
    if (colonIndex == -1) {
      if (lastTyped != ":") return;
      colonIndex = selectionStart - 1;
      createEmojiMenu(currentInput, "");
      return;
    }
    // close menu if you start typing somewhere else;
    if (textContent[colonIndex] != ":") {
      closeEmojiMenu();
      return;
    }

    // TODO types two colons, if there is only 1 result then insert it, otherwise close
    if (lastTyped == ":") {
      let exactEmoji = searchExactEmoji(emojiText);
      if (exactEmoji != null) {
        handleEmojiInsertion(exactEmoji, true);
      } else {
        closeEmojiMenu();
      }
      return;
    }

    // If the user types colon followed by a space, just close the menu
    if (lastTyped == " " && selectionStart - 2 == colonIndex) {
      closeEmojiMenu();
      return;
    }

    // Else they are currently typing out an emoji
    emojiText = textContent.substring(colonIndex + 1, selectionStart);
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
      let searchSize = searchResults.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        searchIndex++;
        searchIndex = Math.min(searchSize - 1, searchIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        searchIndex--;
        searchIndex = Math.max(0, searchIndex);
      } else if (e.key === "Enter") {
        handleEmojjiInsertionWithEnter(e, searchResults);
      } else {
        emojiSearchMenu.blur();
        focusedInputBox.focus();
      }

      let searchResultListSize = searchResults.length;
      for (index = 0; index < searchResultListSize; ++index) {
        let listItem = searchResults[index];
        if (searchIndex === index) {
          listItem.style.backgroundColor = "lavender";
        } else {
          listItem.style.backgroundColor = "#f2f2f2";
        }
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
    return emojiSearchMenu;
  }

  function closeEmojiMenu() {
    emojiMenuUp = false;
    [...document.getElementsByClassName("emoji-search-box")].map(
      (n) => n && n.remove(),
    );
    searchIndex = 0;
    colonIndex = -1;
    emojiText = "";
  }

  function handleEmojjiInsertionWithEnter(e, searchResults) {
    e.preventDefault();
    if (searchResults == null || searchResults.length === 0) {
      closeEmojiMenu();
      return;
    }
    const searchedEmoji = getSearchedEmoji(emojiText, searchIndex);

    handleEmojiInsertion(searchedEmoji, false);
  }

  function handleEmojiInsertion(searchedEmoji, insertedWithColon) {
    let currentText = focusedInputBox.value;

    let left = currentText.substr(0, colonIndex);
    if (colonIndex === 0) {
      left = "";
    }
    let rigth_start_index = colonIndex + 1;
    if (insertedWithColon) {
      rigth_start_index += 1;
    }
    let right = currentText.substr(rigth_start_index + emojiText.length);
    const newText = left + searchedEmoji + right;
    focusedInputBox.value = newText;
    focusedInputBox.setSelectionRange(colonIndex + 1, colonIndex + 1);
    focusedInputBox.focus();
    closeEmojiMenu();
    return;
  }
}
