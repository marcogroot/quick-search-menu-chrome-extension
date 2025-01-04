function getSearchedEmoji(emojiText, searchIndex) {
  let count = 0;
  for (const [index, entry] of Object.entries(getEmojis())) {
    let emojiName = entry[0];
    let emoji = entry[1];
    if (emojiName.includes(emojiText)) {
      if (count == searchIndex) return emoji;
      count++;
    }
  }
}

function searchExactEmoji(emojiText) {
  for (const [index, entry] of Object.entries(getEmojis())) {
    let emojiName = entry[0];
    let emoji = entry[1];
    if (emojiName == emojiText) {
      return emoji;
    }
  }
  return null;
}

function createEmojiSearchMenuHtml(emojiText, searchIndex) {
  let div = document.createElement("div");
  let toolTip = createToolTipElement();

  div.appendChild(toolTip);
  let list = document.createElement("ul");

  let count = 0;
  for (const [index, entry] of Object.entries(getEmojis())) {
    let emojiName = entry[0];
    let emoji = entry[1];
    if (emojiName.includes(emojiText)) {
      let listItem = createlistItemElement(emojiName, emoji);
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
  div.style.cursor = "pointer";

  return div;
}

function createToolTipElement() {
  let toolTip = document.createElement("div");
  toolTip.style.backgroundColor = "#f2f2f2";
  toolTip.style.border = "1px solid #ddd";
  toolTip.innerText = "Press escape to close";
  toolTip.id = "search-box-tooltip";
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
