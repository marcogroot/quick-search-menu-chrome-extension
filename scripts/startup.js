setTimeout(() => {
  // Code to be executed after 5 seconds
  contentEditableInputs = document.querySelectorAll('[contenteditable="true"]');
  inputs = document.getElementsByTagName("input");
  searchBoxes = document.getElementsByTagName("search");
  textAreas = document.getElementsByTagName("textarea");

  console.log("Started");
  runEmojiMenu(inputs, searchBoxes, textAreas, contentEditableInputs);
}, 3000);
