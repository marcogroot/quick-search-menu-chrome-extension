let searchList = null;

async function loadFallbackSearchList() {
  const url = chrome.runtime.getURL("default-search-list.json");
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let defaultSearchList = await response.json();
    return Object.entries(defaultSearchList);
  } catch (error) {
    console.error("Error fetching searchList:", error);
  }
}

async function loadSearchList() {
  chrome.storage.local.get("searchList", async function (data) {
    if (chrome.runtime.lastError) {
      console.error("Error getting storage:", chrome.runtime.lastError);
    } else {
      searchList = data.searchList ?? (await loadFallbackSearchList());
    }
  });
}

loadSearchList();

function getSearchList() {
  return searchList;
}
