setTimeout(() => {
  // Code to be executed after 5 seconds
  console.log("Waited for 3 seconds.");
  ariaTextBoxes = document.querySelectorAll('[role="textbox"]');

  inputs = document.getElementsByTagName("input");

  runEmojiMenu(inputs, ariaTextBoxes);
}, 3000);
