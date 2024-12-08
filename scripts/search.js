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
  "grinning face-😀",
  "grinning face with big eyes-😃",
  "grinning face with smiling eyes-😄",
  "beaming face with smiling eyes-😁",
  "grinning squinting face-😆",
  "grinning face with sweat-😅",
  "rolling on the floor laughing-🤣",
  "face with tears of joy-😂",
  "slightly smiling face-🙂",
  "upside-down face-🙃",
  "melting face-🫠",
];

function emojiSearchMenu(element, emojiText) {
  console.log(`Searching with ${emojiText}`);
  let div = document.createElement("div");
  let list = document.createElement("ul");
  for (const emoji of emojis2) {
    if (emoji.includes(emojiText)) {
      let listItem = document.createElement("li");
      listItem.innerText = emoji;
      list.appendChild(listItem);
    }
    if (list.length >= 10) break;
  }

  div.classList.add("emoji-search-box");
  div.style.backgroundColor = "green";
  div.style.position = "relative";

  div.appendChild(list);

  console.log(div);
  return div;
}
