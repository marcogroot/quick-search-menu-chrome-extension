function startExtensionWithDelay(delay) {
  setTimeout(() => {
    contentEditableInputs = document.querySelectorAll(
      '[contenteditable="true"]',
    );
    inputs = Array.from(document.getElementsByTagName("input"));
    searchBoxes = Array.from(document.getElementsByTagName("search"));
    textAreas = Array.from(document.getElementsByTagName("textarea"));

    console.log("Started");
    runEmojiMenu(inputs.concat(searchBoxes, textAreas), contentEditableInputs);
  }, delay);
}

// Some pages take a bit to load in all the input boxes, retry on adding event listeners
startExtensionWithDelay(10);
startExtensionWithDelay(1000);
startExtensionWithDelay(3000);
startExtensionWithDelay(5000);
startExtensionWithDelay(10000);

let currentUrl = window.location.href;
const observer = new MutationObserver((mutations) => {
  if (window.location.href !== currentUrl) {
    console.log(
      "URL changed (MutationObserver) from",
      currentUrl,
      "to",
      window.location.href,
    );
    currentUrl = window.location.href;
    startExtensionWithDelay(10);
    startExtensionWithDelay(1000);
    startExtensionWithDelay(3000);
  }
});

observer.observe(document, { childList: true, subtree: true });
