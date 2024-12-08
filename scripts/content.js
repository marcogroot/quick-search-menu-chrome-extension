console.log("Testing 1");

var inputs, index;
var colonIndex = -1;
var emojiMenuUp = false;
var emojiMenu = null;

inputs = document.getElementsByTagName("input");
for (index = 0; index < inputs.length; ++index) {
  let doc = inputs[index];
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeEmojiMenu();
    }
  });
  doc.addEventListener("input", function (e) {
    handleInput(e, doc);
  });
  doc.addEventListener("blur", () => {
    closeEmojiMenu();
  });
}

function handleInput(event, doc) {
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
    let emojiTextIndex = colonIndex;
    let emojiText = "";
    while (
      emojiTextIndex < textContent.length &&
      (textContent[emojiTextIndex] != " " ||
        textContent[emojiTextIndex] != "\n")
    ) {
      emojiText += textContent[emojiTextIndex];
      emojiTextIndex++;
    }

    console.log(`Searching for emoji ${emojiText}`);
    emojiMenu;
  }
}

function createEmojiMenu(doc, emojiText) {
  console.log("Open emoji menu");
  emojiMenuUp = true;
  let div = emojiSearchMenu(doc);
  console.log(div);
  doc.insertAdjacentElement("beforebegin", div);
  // if (emojiMenu === null) {
  // } else {
  //   emojiMenu = div;
  // }
}

function closeEmojiMenu() {
  console.log("Close emoji menu");
  emojiMenuUp = false;
  [...document.getElementsByClassName("emoji-search-box")].map(
    (n) => n && n.remove(),
  );
  colonIndex = -1;
  emojiMenu = null;
}
