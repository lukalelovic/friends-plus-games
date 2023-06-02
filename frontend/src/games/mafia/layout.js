import Konva from "konva";

export function roleGroup(x, y, bg, role, roleColor) {
  let rGroup = new Konva.Group();

  const rolePrompt = new Konva.Text({
    x: x,
    y: y,
    fontFamily: 'Algerian',
    fontSize: 24,
    text: 'Your Role is',
    fill: 'white',
    align: 'center'
  });
  rGroup.add(rolePrompt);

  rGroup.add(new Konva.Text({
    x: rolePrompt.x(),
    y: rolePrompt.y() + 36,
    fontFamily: 'Algerian',
    fontSize: 36,
    text: role,
    fill: roleColor,
    align: 'center'
  }));

  const bgShape = new Konva.Rect({
    x: rolePrompt.x(),
    y: rolePrompt.y(),
    width: rolePrompt.getWidth() + 10,
    height: rolePrompt.getHeight() + 52,
    fill: bg,
    cornerRadius: 5
  });

  rGroup.add(bgShape);
  bgShape.moveToBottom();

  return rGroup;
}