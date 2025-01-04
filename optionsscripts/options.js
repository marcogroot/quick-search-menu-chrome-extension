async function loadJsonEmojisFallBack() {
  console.log("Fallback to default emojis");
  const url = chrome.runtime.getURL("emojis.json");
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let defaultEmojis = await response.json();
    return defaultEmojis;
  } catch (error) {
    console.error("Error fetching emojis:", error);
  }
}

async function populateCurrentEmojiList() {
  await chrome.storage.local.get("emojis", async function (data) {
    if (chrome.runtime.lastError) {
      console.error("Error getting storage:", chrome.runtime.lastError);
    } else {
      let emojis = null;
      emojis = data.emojis ?? (await loadJsonEmojisFallBack());
      console.log("Emojis", emojis);

      const jsonEditor = document.getElementById("json-editor");
      jsonEditor.style.cssText = `
      width: 500px;
      height: 300px;
      border: 1px solid #ccc;
      font-family: monospace;
      padding: 5px;
      white-space: pre-wrap;
      overflow: auto;
    `;
      jsonEditor.value = formatJson(emojis);
    }
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const saveEmojiListButton = document.getElementById("saveButton");
  saveEmojiListButton.addEventListener("click", () => {
    setEmojiData();
    populateCurrentEmojiList();
  });

  const resetToDefaultEmojisButton = document.getElementById("resetToDefault");
  resetToDefaultEmojisButton.addEventListener("click", () => {
    const confirmation = confirm(
      "Are you sure you want to reset emoji list to default?",
    );
    if (confirmation) {
      resetEmojisToDefault();
      populateCurrentEmojiList();
    }
  });

  populateCurrentEmojiList();

  const expandableRows = document.querySelectorAll(".expandable-row");

  expandableRows.forEach((row) => {
    row.addEventListener("click", () => {
      const nextRow = row.nextElementSibling;
      if (nextRow && nextRow.classList.contains("expandable-content")) {
        nextRow.classList.toggle("expanded");
        row.classList.toggle("expanded");
      }
    });
  });
});

function resetEmojisToDefault() {
  chrome.storage.local.remove("emojis", function () {
    if (chrome.runtime.lastError) {
      console.error("Error removing default emojis:", chrome.runtime.lastError);
    } else {
      console.log("Default emojis removed successfully!");
      alert("Emojis reset to default!");
    }
  });
}

function setEmojiData() {
  const jsonEditor = document.getElementById("json-editor");
  const editedJsonString = jsonEditor.value;
  const editedJson = parseJson(editedJsonString);
  if (editedJson) {
    console.log("Saving JSON:", editedJson);
    alert("Successfully updated emoji list!");
  } else {
    alert(
      "invalid format, please update the format and try again. \n If you need help try use an online json formatter",
    );
    return;
  }

  chrome.storage.local.set({ emojis: editedJson }, function () {
    if (chrome.runtime.lastError) {
      console.error("Error setting storage:", chrome.runtime.lastError);
    } else {
      console.log("Data stored successfully!");
    }
  });
}

function formatJson(data) {
  try {
    return JSON.stringify(data, null, 2); // Indent with 2 spaces
  } catch (error) {
    console.error("error formatting json", error);
    return "";
  }
}

function parseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.log("error parsing json", error);
    return null;
  }
}
