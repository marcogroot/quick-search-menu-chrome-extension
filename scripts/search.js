function getSearchedEmoji(emojiText, searchIndex) {
  let count = 0;
  for (const [emoji_name, emoji] of Object.entries(getEmojis())) {
    if (emoji_name.includes(emojiText)) {
      if (count == searchIndex) return emoji;
      count++;
    }
  }
}

function searchExactEmoji(emojiText) {
  let emojis = getEmojis();
  if (emojis.hasOwnProperty(emojiText)) {
    return emojis[emojiText];
  } else return null;
}

function createEmojiSearchMenuHtml(emojiText, searchIndex) {
  let div = document.createElement("div");
  let toolTip = createToolTipElement();

  div.appendChild(toolTip);
  let list = document.createElement("ul");

  let count = 0;
  for (const [emoji_name, emoji] of Object.entries(getEmojis())) {
    if (emoji_name.includes(emojiText)) {
      let listItem = createlistItemElement(emoji_name, emoji);
      if (count === searchIndex) {
        listItem.style.backgroundColor = "lavender";
      }
      list.appendChild(listItem);
      if (list.childElementCount >= 5) {
        break;
      }
      count++;
    }
  }

  div.appendChild(list);
  div.style.all = "unset";
  div.classList.add("emoji-search-box");
  div.style.zIndex = "100000";
  div.style.backgroundColor = "black";
  div.tabIndex = 0;
  div.style.width = "200px";
  div.style.position = "fixed";

  return div;
}

function createToolTipElement() {
  let toolTip = document.createElement("div");
  toolTip.style.backgroundColor = "#f2f2f2";
  toolTip.style.border = "1px solid #ddd";
  toolTip.innerText = "Press escape to close";
  return toolTip;
}

function createlistItemElement(name, emoji) {
  let listItem = document.createElement("div");
  listItem.style.backgroundColor = "#f2f2f2";
  listItem.style.border = "1px solid #ddd";
  listItem.style.padding = "10px";
  listItem.style.marginBottom = "1px";
  listItem.innerText = `${name} - ${emoji}`;
  listItem.classList.add("emoji-search-box-result");
  return listItem;
}
