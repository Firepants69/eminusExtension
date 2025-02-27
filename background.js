let timeoutId = null;

function manejarCambioDeUrl(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url.includes("https://eminus.uv.mx/eminus4/page/course/list")) {
        console.log("URL detectada (cambio de URL):", changeInfo.url);
        scheduleAction(tabId);
    }
    else if (changeInfo.status === "complete" && tab.url && tab.url.includes("https://eminus.uv.mx/eminus4/page/course/list")) {
        console.log("URL detectada (recarga de página):", tab.url);
        scheduleAction(tabId);
    }
}

function scheduleAction(tabId) {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        realizarAccion(tabId);
        timeoutId = null;
    }, 200);
}

function realizarAccion(tabId) {
    chrome.tabs.sendMessage(tabId, { action: "urlChange" });
}

chrome.tabs.onUpdated.addListener(manejarCambioDeUrl);