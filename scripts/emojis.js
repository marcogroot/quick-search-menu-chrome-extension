emojis = null;
async function loadEmojis() {
  const url = chrome.runtime.getURL("emojis.json");
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    emojis = await response.json();
  } catch (error) {
    console.error("Error fetching emojis:", error);
  }
}
loadEmojis();

function getEmojis() {
  return emojis;
}
