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