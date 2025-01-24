async function getDisabledWebsites() {
  try {
    const response = await chrome.storage.local.get("websiteConfig");
    return response.websiteConfig ?? [];
  } catch (error) {
    console.error("Error getting storage:", error);
    return [];
  }
}

function startExtensionWithDelay(delay) {
  setTimeout(() => {
    contentEditableInputs = document.querySelectorAll(
      '[contenteditable="true"]',
    );
    inputs = Array.from(document.getElementsByTagName("input"));
    searchBoxes = Array.from(document.getElementsByTagName("search"));
    textAreas = Array.from(document.getElementsByTagName("textarea"));

    // console.log("Started");
    runSearchList(inputs.concat(searchBoxes, textAreas), contentEditableInputs);
  }, delay);
}

async function shouldStartExtension(currentUrl) {
  let disabledWebsites = await getDisabledWebsites();
  Array.from(disabledWebsites).forEach((url) => {
    const disabledWebsite = String(url);
    if (currentUrl.includes(disabledWebsite)) {
      console.log("Search menu disabled on this website");
      return false;
    }
  });

  return true;
}

async function main() {
  let currentUrl = window.location.href;

  startExtension = await shouldStartExtension(currentUrl);
  if (!startExtension) {
    return;
  }

  // Some pages take a bit to load in all the input boxes, retry on adding event listeners
  // startExtensionWithDelay(10);
  startExtensionWithDelay(1000);
  // startExtensionWithDelay(3000);
  // startExtensionWithDelay(5000);
  // startExtensionWithDelay(10000);

  const observer = new MutationObserver((mutations) => {
    if (window.location.href !== currentUrl) {
      closeSearchMenu();
      currentUrl = window.location.href;
      startExtensionWithDelay(10);
      startExtensionWithDelay(1000);
      startExtensionWithDelay(3000);
    }
  });

  observer.observe(document, { childList: true, subtree: true });
}

main();
