export function configureAudioPlayer(audioElement, statusElement, { src, readyText, errorText }) {
  audioElement.pause();
  audioElement.src = src;
  audioElement.load();
  statusElement.textContent = readyText;
  audioElement.onerror = () => { statusElement.textContent = errorText; statusElement.classList.add("error"); };
  audioElement.onloadedmetadata = () => { statusElement.textContent = readyText; statusElement.classList.remove("error"); };
}
