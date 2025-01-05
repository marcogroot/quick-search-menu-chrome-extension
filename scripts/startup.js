function startExtensionWithDelay(delay) {
  setTimeout(() => {
    // Code to be executed after 5 seconds
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

startExtensionWithDelay(10);
startExtensionWithDelay(3000);

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
    startExtensionWithDelay(3000);
  }
});

observer.observe(document, { childList: true, subtree: true });
