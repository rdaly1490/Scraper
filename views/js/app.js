const socket = io();

const scrapeErrors = document.querySelector(".scrape-errors");
const appErrors = document.querySelector(".app-errors");
const logs = document.querySelector(".logs");
const inStockAlerts = document.querySelector("in-stock-alerts");

document.querySelector("input.cb-value").addEventListener("click", function() {
  const toggleBtn = document.querySelector(".toggle-btn");
  const isChecked = document.querySelector("input.cb-value").checked;

  if (isChecked) {
    toggleBtn.classList.add("active");
    socket.emit("toggle scrape", true);
  } else {
    toggleBtn.classList.remove("active");
    socket.emit("toggle scrape", false);
  }
});

socket.on("log", message => {
  console.log(message);
  const p = document.createElement("p");
  p.innerHTML = message;
  logs.insertBefore(p, logs.firstChild);
});

socket.on("scrape error", message => {
  console.log(message);
  const p = document.createElement("p");
  p.innerHTML = message;
  scrapeErrors.insertBefore(p, scrapeErrors.firstChild);
});

socket.on("app error", message => {
  console.log(message);
  const p = document.createElement("p");
  p.innerHTML = message;
  appErrors.insertBefore(p, appErrors.firstChild);
});

const startScrape = () => {
  fetch("/start-scrape");
};
