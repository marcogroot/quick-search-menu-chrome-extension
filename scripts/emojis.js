let emojis = null;

async function loadJsonEmojisFallBack() {
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

async function loadEmojis() {
  chrome.storage.local.get("emojis", async function (data) {
    if (chrome.runtime.lastError) {
      console.error("Error getting storage:", chrome.runtime.lastError);
    } else {
      emojis = data.emojis ?? (await loadJsonEmojisFallBack());
    }
  });
}

loadEmojis();

function getEmojis() {
  return emojis;
}
