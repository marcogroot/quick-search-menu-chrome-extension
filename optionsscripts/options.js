async function loadSearchListFallback() {
  console.log("Fallback to default search list");
  const url = chrome.runtime.getURL("default-search-list.json");
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let defaultSearchList = await response.json();
    return Object.entries(defaultSearchList);
  } catch (error) {
    console.error("Error fetching search list:", error);
  }
}

async function populateCurrentSearchList() {
  await chrome.storage.local.get("searchList", async function (data) {
    if (chrome.runtime.lastError) {
      console.error("Error getting storage:", chrome.runtime.lastError);
    } else {
      let searchList = null;
      searchList = data.searchList ?? (await loadSearchListFallback());

      const jsonEditor = document.getElementById("searchListTextArea");
      jsonEditor.style.cssText = `
      width: 500px;
      height: 300px;
      border: 1px solid #ccc;
      font-family: monospace;
      padding: 5px;
      white-space: pre-wrap;
      overflow: auto;
    `;
      jsonEditor.value = formatSearchListToJson(searchList);
    }
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  // quickSearchListSettings
  const saveSearchListButton = document.getElementById("saveSearchListButton");
  saveSearchListButton.addEventListener("click", () => {
    setSaveListData();
    populateCurrentSearchList();
  });

  const resetToDefaultSearchListButton =
    document.getElementById("resetToDefault");
  resetToDefaultSearchListButton.addEventListener("click", () => {
    const confirmation = confirm(
      "Are you sure you want to reset search list to default?",
    );
    if (confirmation) {
      resetConfigToDefault("searchList");
      populateCurrentSearchList();
    }
  });

  // general settings
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

  populateCurrentSearchList();

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

function setSaveListData() {
  const jsonEditor = document.getElementById("searchListTextArea");
  const editedJsonString = jsonEditor.value;
  const editedJson = validateJson(editedJsonString);
  if (editedJson) {
    console.log("Saving JSON:", editedJson);
    chrome.storage.local.set({ searchList: editedJson }, function () {
      if (chrome.runtime.lastError) {
        console.error("Error setting storage:", chrome.runtime.lastError);
        alert("There was an error updating the new list, please try again");
      } else {
      }
    });
    alert("Successfully updated search list!");
  } else {
    alert(
      "invalid format, please update the format and try again. \n If you need help try use an online json formatter",
    );
    return;
  }
}

function formatSearchListToJson(data) {
  try {
    const searchResultsArray = {};

    data.forEach((row, index) => {
      searchResultsArray[row[0]] = row[1];
    });

    return JSON.stringify(searchResultsArray, null, 2);
  } catch (error) {
    console.error("Error formatting JSON:", error);
    return "{}";
  }
}

function validateJson(jsonString) {
  try {
    let jsonData = JSON.parse(jsonString);
    return Object.entries(jsonData);
  } catch (error) {
    console.log("error parsing json", error);
    return null;
  }
}

function setWebsiteConfig() {
  const textArea = document.getElementById("websiteConfigTextArea");
  const editedJsonString = textArea.value;
  const editedJson = validateJson(editedJsonString);
  if (editedJson) {
    console.log("Saving JSON:", editedJson);
    chrome.storage.local.set({ websiteConfig: editedJson }, function () {
      if (chrome.runtime.lastError) {
        console.error("Error setting storage:", chrome.runtime.lastError);
        alert("There was an error updating the new list, please try again");
      } else {
      }
    });
    alert("Successfully updated website config list!");
  } else {
    alert(
      "invalid format, please update the format and try again. \n If you need help try use an online json formatter",
    );
    return;
  }
}

async function populateCurrentWebsiteConfig() {
  await chrome.storage.local.get("websiteConfig", async function (data) {
    if (chrome.runtime.lastError) {
      console.error("Error getting storage:", chrome.runtime.lastError);
    } else {
      let websiteConfigJson = data.websiteConfig ?? "{[]}";

      const jsonEditor = document.getElementById("websiteConfigTextArea");
      jsonEditor.style.cssText = `
      width: 500px;
      height: 300px;
      border: 1px solid #ccc;
      font-family: monospace;
      padding: 5px;
      white-space: pre-wrap;
      overflow: auto;
    `;
      jsonEditor.value = JSON.stringify(websiteConfigJson, null, 2);
    }
  });
}
