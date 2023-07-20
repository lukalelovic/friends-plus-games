export function checkIsMobile() {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  return screenWidth < 768; // Adjust accordingly
}