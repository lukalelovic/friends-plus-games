import Konva from "konva";

export function createButton(text, x, y, color) {
  // Create a group to hold the button shape and text
  var buttonGroup = new Konva.Group({
    x: x,
    y: y
  });

  // Create a rectangle shape as the button background
  var button = new Konva.Rect({
    width: 100,
    height: 40,
    fill: color,
    cornerRadius: 5
  });
  buttonGroup.add(button);

  // Create a text element for the button label
  var buttonText = new Konva.Text({
    text: text,
    fontSize: 16,
    fill: 'white'
  });

  // Center the text within the button shape
  buttonText.position({
    x: (button.width() - buttonText.width()) / 2,
    y: (button.height() - buttonText.height()) / 2
  });
  buttonGroup.add(buttonText);

  return buttonGroup;
}