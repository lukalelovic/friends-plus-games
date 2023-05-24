export function joinGame(socket) {
  const url = new URL(window.location.href);

  let lobbyId = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
  let oldSocketId = url.searchParams.get("player");

  socket.emit("joinGame", lobbyId, oldSocketId);
  return lobbyId;
}