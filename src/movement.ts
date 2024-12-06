export function setupMovementControls(
  movePlayer: (direction: string) => void,
  resetGameState: () => void,
) {
  // Create a movement panel
  const movementPanel = document.createElement("div");
  movementPanel.style.position = "absolute";
  movementPanel.style.top = "10px";
  movementPanel.style.left = "10px";
  movementPanel.style.zIndex = "1000";

  document.body.appendChild(movementPanel);

  // Create a direction map
  const directionMap = {
    north: "⬆️",
    south: "⬇️",
    east: "➡️",
    west: "⬅️",
  } as const;

  // Add movement buttons
  Object.keys(directionMap).forEach((direction) => {
    const dirKey = direction as keyof typeof directionMap;
    const button = document.createElement("button");
    button.textContent = directionMap[dirKey];
    button.style.margin = "2px";
    button.addEventListener("click", () => movePlayer(dirKey))
    movementPanel.appendChild(button);
  });

  // Add reset button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset 🌐";
  resetButton.style.margin = "5px";
  resetButton.addEventListener("click", resetGameState);
  movementPanel.appendChild(resetButton);
}