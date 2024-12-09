let emojis = {
  "grinning face": "😀",
  "grinning face with big eyes": "😃",
  "grinning face with smiling eyes": "😄",
  "beaming face with smiling eyes": "😁",
  "grinning squinting face": "😆",
  "grinning face with sweat": "😅",
  "rolling on the floor laughing": "🤣",
  "face with tears of joy": "😂",
  "slightly smiling face": "🙂",
  "upside-down face": "🙃",
  "melting face": "🫠",
};

let emojis2 = [
  "grinning face - 😀",
  "grinning face with big eyes - 😃",
  "grinning face with smiling eyes - 😄",
  "beaming face with smiling eyes - 😁",
  "grinning squinting face - 😆",
  "grinning face with sweat - 😅",
  "rolling on the floor laughing - 🤣",
  "face with tears of joy - 😂",
  "slightly smiling face - 🙂",
  "upside-down face - 🙃",
  "melting face - 🫠",
];

function emojiSearchMenu(element, emojiText) {
  let div = document.createElement("div");
  let toolTip = createToolTipElement();
  div.appendChild(toolTip);
  let list = document.createElement("ul");
  for (const emoji of emojis2) {
    if (emoji.includes(emojiText)) {
      let listItem = createlistItemElement(emoji);
      list.appendChild(listItem);
      if (list.childElementCount >= 5) {
        break;
      }
    }
  }

  div.classList.add("emoji-search-box");
  div.style.backgroundColor = "black";
  div.style.position = "relative";

  div.appendChild(list);

  return div;
}

function createToolTipElement() {
  let toolTip = document.createElement("div");
  toolTip.style.backgroundColor = "#f2f2f2";
  toolTip.style.border = "1px solid #ddd";
  toolTip.innerText = "Press escape to close";
  return toolTip;
}

function createlistItemElement(text) {
  let listItem = document.createElement("div");
  listItem.style.backgroundColor = "#f2f2f2";
  listItem.style.border = "1px solid #ddd";
  listItem.style.padding = "10px";
  listItem.style.marginBottom = "1px";
  listItem.innerText = text;
  listItem.classList.add("emoji-search-box-result");
  return listItem;
}
