const socket = io();

const scrapeErrors = document.querySelector(".scrape-errors");
const appErrors = document.querySelector(".app-errors");
const inStockAlerts = document.querySelector(".in-stock-alerts");
const logs = document.querySelector(".logs");
const resetAppStateBtn = document.querySelector(".reset-app-state");
const sendTestActionControllerBtn = document.querySelector(
  ".send-test-controller"
);

if (window.nodeEnv !== "production") {
  sendTestActionControllerBtn.addEventListener("click", () => {
    socket.emit("send test text");
  });
}

resetAppStateBtn.addEventListener("click", () => {
  socket.emit("reset app state");
});

document.querySelector("input.cb-value").addEventListener("click", function() {
  const functioningSites = document.querySelector(".functioning-sites");
  const numFunctioningSites = functioningSites.childElementCount;
  if (numFunctioningSites === 0) {
    alert(
      "The app can't find any valid candidates in your provided json list, please update the list or forcefully reset the app state using the reset state button"
    );
    return;
  }
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

// TODO: pass down SocketEventTypes enum

socket.on("log", message => {
  console.log(message);
  const p = document.createElement("p");
  const _message = (p.innerHTML = JSON.stringify(message).slice(1, -1));
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

socket.on("results", results => {
  results.forEach(result => {
    console.log(`result for ${result.site}`);
    const div = document.createElement("div");
    div.innerHTML = `<p>${result.date} ${result.site}: ${result.text}</p>
                     <a href=${result.url}>${result.url}</a>
                     <p>----------</p>`;
    inStockAlerts.insertBefore(div, inStockAlerts.firstChild);
  });
});

socket.on("site statuses", ({ errorSites, functioningSites }) => {
  const container = document.querySelector(".site-statuses");
  const functioningSitesDiv = document.querySelector(".functioning-sites");
  const errorSitesDiv = document.querySelector(".error-sites");

  functioningSitesDiv.innerHTML = "";
  errorSitesDiv.innerHTML = "";

  functioningSites.forEach(site => {
    const div = document.createElement("div");
    const goodStatusSpan = document.createElement("span");
    goodStatusSpan.innerHTML = "Good";
    const siteSpan = document.createElement("span");
    siteSpan.innerHTML = site + ":";
    div.appendChild(siteSpan);
    div.appendChild(goodStatusSpan);
    functioningSitesDiv.appendChild(div);
  });

  errorSites.forEach(site => {
    const div = document.createElement("div");
    const errorStatusSpan = document.createElement("span");
    errorStatusSpan.innerHTML = "Error";
    const siteSpan = document.createElement("span");
    siteSpan.innerHTML = site + ":";
    div.appendChild(siteSpan);
    div.appendChild(errorStatusSpan);
    errorSitesDiv.appendChild(div);
  });
});

socket.on("toggle scrape", toggleOn => {
  const toggleBtn = document.querySelector(".toggle-btn");
  const isChecked = document.querySelector("input.cb-value").checked;
  if (toggleOn && !isChecked) {
    toggleBtn.classList.add("active");
  } else if (!toggleOn && isChecked) {
    toggleBtn.classList.remove("active");
  }
});
