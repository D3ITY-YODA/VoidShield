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