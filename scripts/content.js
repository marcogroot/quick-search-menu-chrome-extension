var inputs, index;
var colonIndex = -1;
var emojiMenuUp = false;
var searchIndex = 0;
var currentInputBox;
let emojiText = "";

inputs = document.getElementsByTagName("input");

document.addEventListener("keydown", function (e) {
  //console.log(searchIndex);
  if (e.key === "Escape") {
    closeEmojiMenu();
  }
});

for (index = 0; index < inputs.length; ++index) {
  let currentInput = inputs[index];
  currentInput.addEventListener("keydown", function (e) {
    if (!emojiMenuUp) return;
    else if (e.key === "ArrowDown") {
      searchIndex = 1;
      currentInput.blur();
      console.log("down pressed");
      let emojiSearchBox = getEmojiSearchBox();
      emojiSearchBox.focus();
      currentInputBox = currentInput;
    } else if (e.key === "ArrowUp") {
      currentInput.blur();
      console.log("up pressed");
      let emojiSearchBox = getEmojiSearchBox();
      emojiSearchBox.focus();
    } else if (e.key === "Enter" && emojiMenuUp) {
      e.preventDefault();
      // select emoji at index 0, and then close the focus
    }
  });
  currentInput.addEventListener("input", function (e) {
    handleInput(e, currentInput);
  });
  // doc.addEventListener("blur", () => {
  //   closeEmojiMenu();
  // });
}

function handleInput(event, doc) {
  currentInputBox = doc;
  const textContent = event.target.value;
  const lastIndex = textContent.length - 1;
  const c = textContent.charAt(lastIndex);

  if (colonIndex == -1) {
    if (c != ":") return;
    colonIndex = lastIndex;
    createEmojiMenu(doc, "", 0);
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
    let newEmojiMenu = createEmojiMenu(doc, emojiText, 0);
    existingMenu = newEmojiMenu;
  }
}

function createEmojiMenu(doc, emojiText, index) {
  console.log("Open emoji menu");
  emojiMenuUp = true;
  let div = emojiSearchMenu(doc, emojiText, index);

  [...document.getElementsByClassName("emoji-search-box")].map(
    (n) => n && n.remove(),
  );
  doc.insertAdjacentElement("beforebegin", div);
}

function closeEmojiMenu() {
  console.log("Close emoji menu");
  searchIndex = 0;
  emojiMenuUp = false;
  [...document.getElementsByClassName("emoji-search-box")].map(
    (n) => n && n.remove(),
  );
  colonIndex = -1;
  emojiText = "";
}

function getEmojiSearchBox() {
  let emojiSearchBox = document.getElementsByClassName("emoji-search-box")[0];

  emojiSearchBox.addEventListener("focus", function (e) {
    let searchResults = document.getElementsByClassName(
      "emoji-search-box-result",
    );
    let searchSize = searchResults.length;
    searchIndex = Math.min(searchIndex, searchSize - 1);
    for (index = 0; index < searchSize; ++index) {
      let listItem = searchResults[index];
      if (searchIndex === index) {
        listItem.style.backgroundColor = "lavender";
      } else {
        listItem.style.backgroundColor = "#f2f2f2";
      }
    }
    emojiSearchBox.addEventListener("keydown", function (e) {
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
        e.preventDefault();
        const chosenEmojiString = searchResults[searchIndex].textContent;
        const chosenEmojiArray = Array.from(chosenEmojiString);
        const chosenEmojiSize = chosenEmojiArray.length;
        const chosenEmoji = chosenEmojiArray[chosenEmojiSize - 1];
        console.log(chosenEmoji);
      } else {
        emojiSearchBox.blur();
        currentInputBox.focus();
      }

      for (index = 0; index < searchSize; ++index) {
        let listItem = searchResults[index];
        if (searchIndex === index) {
          listItem.style.backgroundColor = "lavender";
        } else {
          listItem.style.backgroundColor = "#f2f2f2";
        }
      }
      console.log(searchIndex);
    });
  });
  emojiSearchBox.focus();
  return emojiSearchBox;
}
