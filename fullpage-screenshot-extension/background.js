chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "capture") {
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      { format: "png" },
      image => {
        sendResponse(image);
      }
    );
    return true;
  }

  if (message.action === "download") {
    const title = message.title
      .replace(/[^\w\d]+/g, "_")
      .substring(0, 50);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .slice(0, 19);

    const filename = `${title}_${timestamp}.png`;

    chrome.downloads.download({
      url: message.url,
      filename,
      saveAs: true
    });
  }
});
