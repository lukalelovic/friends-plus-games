export function requireAuth(loggedIn, path) {
  if (loggedIn) return;

  const url = window.location.pathname;

  switch (url) {
    case '/login':
    case '/':
    case '/signup':
      return;
  }

  window.location.href = path;
}