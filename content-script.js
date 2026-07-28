(function () {
  function extractArticleText() {
    const article = document.querySelector("article") || document.body;
    const title = document.title || "";
    const bodyText = article ? article.innerText.slice(0, 5000) : "";
    return `${title}\n${bodyText}`;
  }

  function send() {
    chrome.runtime.sendMessage({
      type: "PAGE_CONTENT",
      payload: {
        hostname: location.hostname,
        url: location.href,
        text: extractArticleText(),
      },
    });
  }

  if (document.readyState === "complete") {
    send();
  } else {
    window.addEventListener("load", send, { once: true });
  }
})();
