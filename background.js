let domainSet = new Set();
let narratives = [];
let dataLoaded = loadData();

const scoresByTab = new Map();

async function loadData() {
  const [domainListRes, narrativesRes] = await Promise.all([
    fetch(chrome.runtime.getURL("data/domain-list.json")),
    fetch(chrome.runtime.getURL("data/narratives.json")),
  ]);
  const domainList = await domainListRes.json();
  narratives = await narrativesRes.json();

  domainSet = new Set(domainList.domains.map((d) => d.domain.toLowerCase()));
}

function matchesKnownDomain(hostname) {
  const host = hostname.toLowerCase();
  for (const known of domainSet) {
    if (host === known || host.endsWith("." + known)) return known;
  }
  return null;
}

function matchNarratives(text) {
  const lower = text.toLowerCase();
  const hits = [];
  for (const n of narratives) {
    for (const kw of n.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        hits.push(n.label);
        break;
      }
    }
  }
  return hits;
}

function scorePage({ hostname, text }) {
  const domainHit = matchesKnownDomain(hostname);
  const narrativeHits = matchNarratives(text || "");

  let score = 0;
  const reasons = [];
                    
  if (domainHit) {
    score += 70;
    reasons.push(`Domain matches known disinformation network entry: ${domainHit}`);
  }
  if (narrativeHits.length > 0) {
    score += Math.min(30, narrativeHits.length * 15);
    reasons.push(`Content matches known false-narrative pattern(s): ${narrativeHits.join(", ")}`);
  }

  return { score: Math.min(100, score), reasons, domainHit: !!domainHit };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PAGE_CONTENT") {
    dataLoaded.then(() => {
      const result = scorePage(msg.payload);
      const tabId = sender.tab?.id;
      if (tabId != null) {
        scoresByTab.set(tabId, result);
        updateBadge(tabId, result);
      }
      sendResponse(result);
    });
    return true; // keep channel open for async sendResponse
  }

  if (msg.type === "GET_ACTIVE_SCORE") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      sendResponse(scoresByTab.get(tabId) || null);
    });
    return true;
  }
});

function updateBadge(tabId, result) {
  const text = result.score >= 70 ? "!" : result.score >= 30 ? "?" : "";
  const color = result.score >= 70 ? "#c0392b" : result.score >= 30 ? "#e67e22" : "#27ae60";
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
}

chrome.tabs.onRemoved.addListener((tabId) => scoresByTab.delete(tabId));

