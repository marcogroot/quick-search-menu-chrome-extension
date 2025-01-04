let emojis = null;

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log("The settings were updated!");
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`,
    );
  }
});

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

async function loadEmojis() {
  chrome.storage.local.get("emojis", async function (data) {
    if (chrome.runtime.lastError) {
      console.error("Error getting storage:", chrome.runtime.lastError);
    } else {
      emojis = data.emojis ?? (await loadJsonEmojisFallBack());
      console.log("Retrieved emojis:", emojis);
    }
  });
}

loadEmojis();

function getEmojis() {
  return emojis;
}
