var inputs, index;
var colonIndex = -1;
var emojiMenuUp = false;
var searchIndex = 0;
var searchSize = 0;
var currentInputBox;

inputs = document.getElementsByTagName("input");
for (index = 0; index < inputs.length; ++index) {
  let doc = inputs[index];
  doc.addEventListener("keydown", function (e) {
    //console.log(searchIndex);
    if (e.key === "Escape") {
      closeEmojiMenu();
    }
    if (!emojiMenuUp) return;
    else if (e.key === "ArrowDown") {
      doc.blur();
      getEmojiSearchBox().focus();
      console.log("down pressed");
      //getEmojiSearchBox.searchIndex++;
      //searchIndex = Math.min(searchSize - 1, searchIndex);
    } else if (e.key === "ArrowUp") {
      doc.blur();
      console.log("up pressed");
      getEmojiSearchBox().focus();
      //searchIndex--;
      //searchIndex = Math.max(0, searchIndex);
    } else if (e.key === "Enter") {
      doc.blur();
      console.log("Enter pressed");
    }
  });
  doc.addEventListener("input", function (e) {
    handleInput(e, doc);
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
    createEmojiMenu(doc, "");
  } else if (textContent[colonIndex] != ":") {
    closeEmojiMenu();
  } else {
    let emojiTextIndex = colonIndex + 1;
    let emojiText = "";
    while (
      emojiTextIndex < textContent.length &&
      (textContent[emojiTextIndex] != " " ||
        textContent[emojiTextIndex] != "\n")
    ) {
      emojiText += textContent[emojiTextIndex];
      emojiTextIndex++;
    }

    searchText = emojiText;

    let newEmojiMenu = createEmojiMenu(doc, emojiText);
    existingMenu = newEmojiMenu;
  }
}

function createEmojiMenu(doc, emojiText) {
  console.log("Open emoji menu");
  emojiMenuUp = true;
  let div = emojiSearchMenu(doc, emojiText);
  searchSize = document.getElementsByClassName(
    "emoji-search-box-result",
  ).length;
  [...document.getElementsByClassName("emoji-search-box")].map(
    (n) => n && n.remove(),
  );
  div.focus();
  div.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeEmojiMenu();
    }

    // if (!emojiMenuUp) return;
    // else if (e.key === "ArrowDown") {
    //   getEmojiSearchBox.
    //   searchIndex++;
    //   searchIndex = Math.min(searchSize - 1, searchIndex);
    // } else if (e.key === "ArrowUp") {
    //   searchIndex--;
    //   searchIndex = Math.max(0, searchIndex);
    // }
  });
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
}

function getEmojiSearchBox() {
  return document.getElementsByClassName("emoji-search-box")[0];
}
