var inputs, index;
var colonIndex = -1;
var emojiMenuUp = false;
var searchIndex = 0;
var currentInputBox;
let emojiText = "";
let emojiMenuFocused = false;

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
    currentInput.addEventListener("input", function (e) {
      handleInputText(e.target.value, currentInput);
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
      currentInputBox = currentInput;
    } else if (e.key === "ArrowUp") {
      currentInput.blur();
      let emojiSearchBox = createEmojiMenu();
      emojiSearchBox.focus();
    } else if (e.key === "Enter" && emojiMenuUp) {
      handleEmojjiInsertion(e, searchResults);
    }
  }

  function handleInputText(textContent, currentInputBoxElement) {
    currentInputBox = currentInputBoxElement;
    const lastIndex = textContent.length - 1;
    const c = textContent.charAt(lastIndex);

    if (colonIndex == -1) {
      if (c != ":") return;
      colonIndex = lastIndex;
      createEmojiMenu(currentInputBox, "");
    } else if (textContent[colonIndex] != ":") {
      closeEmojiMenu();
    } else {
      let emojiTextIndex = colonIndex + 1;
      emojiText = "";
      while (
        emojiTextIndex < textContent.length &&
        (textContent[emojiTextIndex] != " " ||
          textContent[emojiTextIndex] != "\n")
      ) {
        emojiText += textContent[emojiTextIndex];
        emojiTextIndex++;
      }
      let newEmojiMenu = createEmojiMenu();
      existingMenu = newEmojiMenu;
    }
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
        handleEmojjiInsertion(e, searchResults);
      } else {
        emojiSearchMenu.blur();
        currentInputBox.focus();
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

    const rect = currentInputBox.getBoundingClientRect();
    emojiSearchMenu.style.left = rect.left + "px";

    document.body.appendChild(emojiSearchMenu);
    let emojiSearchMenuHeight = emojiSearchMenu.getBoundingClientRect().height;

    if (isDivInTopHalf(currentInputBox)) {
      emojiSearchMenu.style.top = rect.top + rect.height + "px";
    } else {
      emojiSearchMenu.style.top = rect.top - emojiSearchMenuHeight + "px";
    }
    return emojiSearchMenu;
  }

  function closeEmojiMenu() {
    console.log("Close emoji menu");
    emojiMenuUp = false;
    [...document.getElementsByClassName("emoji-search-box")].map(
      (n) => n && n.remove(),
    );
    searchIndex = 0;
    colonIndex = -1;
    emojiText = "";
  }

  function getEmojiSearchBox() {
    return document.getElementsByClassName("emoji-search-box")[0];
  }

  function setTextboxValue(textBox, newValue) {
    const range = document.createRange();
    range.selectNodeContents(textBox);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("insertText", false, newValue);
  }

  function handleEmojjiInsertion(e, searchResults) {
    e.preventDefault();
    if (searchResults == null || searchResults.length === 0) {
      closeEmojiMenu();
      return;
    }
    const chosenEmojiString = searchResults[searchIndex].textContent;
    const chosenEmojiArray = Array.from(chosenEmojiString);
    const chosenEmojiSize = chosenEmojiArray.length;
    const chosenEmoji = chosenEmojiArray[chosenEmojiSize - 1];

    console.log(currentInputBox);
    console.log(`marco test ${currentInputBox.value}`);
    let currentText = currentInputBox.value;

    let left = currentText.substr(0, colonIndex);
    if (colonIndex === 0) {
      left = "";
    }
    let right = currentText.substr(colonIndex + 1 + emojiText.length);
    const newText = left + chosenEmoji + right;
    console.log(`The new text is ${newText}`);
    currentInputBox.value = newText;
    closeEmojiMenu();
    currentInputBox.focus();
    return;
  }
}

function isDivInTopHalf(divElement) {
  if (!divElement) {
    return false;
  }

  const rect = divElement.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const divCenterY = rect.top + rect.height / 2;

  return divCenterY < viewportHeight / 2;
}
