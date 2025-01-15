chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("https://eminus.uv.mx/eminus4/page/course/list")) {
        console.log("estoy aqui")
    }
})