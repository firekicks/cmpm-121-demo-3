// src/main.ts

// Function to create and add a button element to the webpage
function createButton() {
  // Create a button element
  const button = document.createElement("button");
  button.textContent = "Click Me";

  // Add an event listener to display an alert on button click
  button.addEventListener("click", () => {
    alert("You clicked the button!");
  });

  // Append the button to the body of the document
  document.body.appendChild(button);
}

// Call the function to add the button when the script is loaded
createButton();
