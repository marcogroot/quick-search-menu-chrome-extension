async function loadJsonEmojisFallBack() {
  console.log("Fallback to default emojis");
  const url = chrome.runtime.getURL("emojis.json");
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let defaultEmojis = await response.json();
    return Object.entries(defaultEmojis);
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
      jsonEditor.value = formatEmojiStringToJson(emojis);
    }
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const saveEmojiListButton = document.getElementById("saveEmojisButton");
  saveEmojiListButton.addEventListener("click", () => {
    setEmojiData();
    populateCurrentEmojiList();
  });

  const saveSearchSymbolButton = document.getElementById(
    "saveSearchSymbolButon",
  );
  saveSearchSymbolButton.addEventListener("click", () => {
    setSearchSymbol();
  });
  const resetToDefaultSearchSymbolButton = document.getElementById(
    "resetToDefaultSearchSymbol",
  );
  const searchSymbolInputBox = document.getElementById("searchSymbolInput");
  searchSymbolInputBox.addEventListener("input", function (event) {
    if (searchSymbolInputBox.value.length > 1) {
      searchSymbolInputBox.value = searchSymbolInputBox.value.slice(0, 1);
    }
  });

  resetToDefaultSearchSymbolButton.addEventListener("click", () => {
    resetConfigToDefault("searchSymbol");
    searchSymbolInputBox.value = ":";
  });

  const resetToDefaultEmojisButton = document.getElementById("resetToDefault");
  resetToDefaultEmojisButton.addEventListener("click", () => {
    const confirmation = confirm(
      "Are you sure you want to reset emoji list to default?",
    );
    if (confirmation) {
      resetConfigToDefault("emojis");
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

function resetConfigToDefault(configName) {
  chrome.storage.local.remove(configName, function () {
    if (chrome.runtime.lastError) {
      console.error(
        "Error removing default",
        chrome.runtime.lastError,
        configName,
      );
    } else {
      alert(`${configName} reset to default!`);
    }
  });
}

function setSearchSymbol() {
  const searchSymbolInputBox = document.getElementById("searchSymbolInput");
  const newSearchSymbol = searchSymbolInputBox.value;
  if (newSearchSymbol.length != 1) {
    alert("Search symbol should only be a single character");
    return;
  }
  console.log("Saving new search symbol:", newSearchSymbol);
  chrome.storage.local.set({ searchSymbol: newSearchSymbol }, function () {
    if (chrome.runtime.lastError) {
      console.error("Error setting storage:", chrome.runtime.lastError);
      alert("Failed to update, try again");
    } else {
      alert("Successfully updated search symbol");
    }
  });
}

function setEmojiData() {
  const jsonEditor = document.getElementById("json-editor");
  const editedJsonString = jsonEditor.value;
  const editedJson = parseJson(editedJsonString);
  if (editedJson) {
    console.log("Saving JSON:", editedJson);
    chrome.storage.local.set({ emojis: editedJson }, function () {
      if (chrome.runtime.lastError) {
        console.error("Error setting storage:", chrome.runtime.lastError);
        alert("There was an error updating the new list, please try again");
      } else {
      }
    });
    alert("Successfully updated emoji list!");
  } else {
    alert(
      "invalid format, please update the format and try again. \n If you need help try use an online json formatter",
    );
    return;
  }
}

function formatEmojiStringToJson(data) {
  try {
    const emojiObject = {};

    data.forEach((row, index) => {
      emojiObject[row[0]] = row[1];
    });

    return JSON.stringify(emojiObject, null, 2);
  } catch (error) {
    console.error("Error formatting JSON:", error);
    return "{}";
  }
}

function parseJson(jsonString) {
  try {
    let jsonData = JSON.parse(jsonString);
    return Object.entries(jsonData);
  } catch (error) {
    console.log("error parsing json", error);
    return null;
  }
}
