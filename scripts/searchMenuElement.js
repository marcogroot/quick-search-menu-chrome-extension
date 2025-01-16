function getSearchResult(searchText, searchIndex) {
  let count = 0;
  for (const [index, entry] of Object.entries(getSearchList())) {
    let name = entry[0];
    let result = entry[1];
    if (name.includes(searchText)) {
      if (count == searchIndex) return result;
      count++;
    }
  }
}

function searchExactResult(searchText) {
  for (const [index, entry] of Object.entries(getSearchList())) {
    let searchResultName = entry[0];
    let searchResult = entry[1];
    if (searchResultName == searchText) {
      return searchResult;
    }
  }
  return null;
}

function createSearchMenuHtml(searchText, searchIndex) {
  let div = document.createElement("div");
  let toolTip = createToolTipElement();

  div.appendChild(toolTip);
  let list = document.createElement("ul");

  let count = 0;
  for (const [index, entry] of Object.entries(getSearchList())) {
    let searchResultName = entry[0];
    let searchResult = entry[1];
    if (searchResultName.includes(searchText)) {
      let listItem = createlistItemElement(searchResultName, searchResult);
      if (count === searchIndex) {
        listItem.style.backgroundColor = "lavender";
      }
      list.appendChild(listItem);
      if (list.childElementCount >= 5) {
        break;
      }
      count++;
    }
  }

  div.appendChild(list);
  div.style.all = "unset";
  div.classList.add("searchMenu");
  div.style.zIndex = "100000";
  div.style.backgroundColor = "black";
  div.tabIndex = 0;
  div.style.width = "200px";
  div.style.position = "fixed";
  div.style.cursor = "pointer";

  return div;
}

function createToolTipElement() {
  let toolTip = document.createElement("div");
  toolTip.style.backgroundColor = "#f2f2f2";
  toolTip.style.border = "1px solid #ddd";
  toolTip.innerText = "Press escape to close";
  toolTip.id = "searchToolTip";
  return toolTip;
}

function createArrowKeysDisabledToolTipElement() {
  let arrowKeyControlToolTip = document.createElement("div");
  arrowKeyControlToolTip.style.backgroundColor = "#C0C0C0";
  arrowKeyControlToolTip.style.border = "1px solid #ddd";
  arrowKeyControlToolTip.innerText =
    "Search may have issues on this website. Recommend using mouse to select";
  arrowKeyControlToolTip.id = "arrowKeyControlTooltip";
  return arrowKeyControlToolTip;
}

function createlistItemElement(searchResultName, searchResult) {
  let truncatedSearchResultName = searchResultName;
  if (searchResultName.length >= 25) {
    truncatedSearchResultName = searchResultName.substring(0, 25) + "...";
  }

  let truncatedSearchResult = searchResult;
  if (searchResult.length >= 25) {
    truncatedSearchResult = searchResult.substring(0, 25) + "...";
  }

  let listItem = document.createElement("div");
  listItem.style.backgroundColor = "#f2f2f2";
  listItem.style.border = "1px solid #ddd";
  listItem.style.padding = "10px";
  listItem.style.marginBottom = "1px";
  listItem.innerText = `${truncatedSearchResultName} - ${truncatedSearchResult}`;
  listItem.classList.add("searchResultRow");

  return listItem;
}
