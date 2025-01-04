function isDivInTopHalf(divElement) {
  if (!divElement) {
    return false;
  }

  const rect = divElement.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const divCenterY = rect.top + rect.height / 2;

  return divCenterY < viewportHeight / 2;
}

function setData(key, obj) {
  var values = JSON.stringify(obj);
  chrome.storage.local.set({ key: values }).then(() => {
    console.log("Value is set");
  });
}
