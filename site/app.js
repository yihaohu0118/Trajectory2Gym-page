const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const poster = document.querySelector(".poster");
const motionButton = document.querySelector("#motion");
let playRequested = !reduceMotion.matches;
let visible = true;
function updateMotion() {
  const playing = playRequested && visible && !document.hidden;
  poster.classList.toggle("playing", playing);
  motionButton.setAttribute("aria-pressed", String(playRequested));
  motionButton.textContent = playRequested ? "Pause illustration" : "Play illustration";
}
motionButton.hidden = false;
motionButton.addEventListener("click", () => { playRequested = !playRequested; updateMotion(); });
reduceMotion.addEventListener("change", () => { playRequested = !reduceMotion.matches; updateMotion(); });
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateMotion(); }).observe(poster);
document.addEventListener("visibilitychange", updateMotion);
updateMotion();

document.querySelectorAll("[data-rule]").forEach(button => {
  button.addEventListener("click", () => {
    const grounded = button.dataset.rule === "grounded";
    document.querySelectorAll("[data-rule]").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
    const both = document.querySelector('[data-candidate="both"]');
    both.textContent = grounded ? "Reject" : "Keep";
    both.className = grounded ? "decision reject" : "decision wrong";
    document.querySelector(".rule-explanation").textContent = grounded
      ? "Grounding checks visible evidence; workflow certification checks the confirmed scope and required order."
      : "Execution-only filtering keeps both candidates: both calls succeed, but exchanging the bottle violates the user's final request.";
  });
});

const scales = ["1.7B", "4B", "8B", "14B", "30B-A3B"];
const benchmarks = {
  tau2: {title: "Stateful interaction · Tau2", note: "Pass@1 (%), equal-weight domain average. Higher is better.", caption: "Tau2 scores from Table 1 of the manuscript.", initial: [23.33,19.17,25,25,28.33], trained: [37.5,69.17,74.17,80.83,84.17]},
  tau1: {title: "Tool–agent–user interaction · Tau1", note: "Pass@1 (%), equal-weight domain average. Tau1 Airline is seen-task / transductive.", caption: "Tau1 scores from Table 1 of the manuscript.", initial: [8.52,24.22,27.87,32.04,44.39], trained: [34.43,44.22,51.13,58.04,66.78]},
  bfcl: {title: "Function calling · BFCL", note: "Overall (%): equal average of Non-live, Live and Multi-turn Base. Higher is better.", caption: "BFCL Overall scores from Table 2 of the manuscript.", initial: [55.88,62.92,67.30,72.01,77.58], trained: [66.48,74.85,78.62,79.68,80.93]}
};
function showBenchmark(key) {
  const data = benchmarks[key];
  document.querySelector("#chart-title").textContent = data.title;
  document.querySelector("#chart-note").textContent = data.note;
  document.querySelector("#table-caption").textContent = data.caption;
  document.querySelectorAll("[data-benchmark]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.benchmark === key)));
  document.querySelector("#chart").innerHTML = scales.map((scale, i) =>
    `<div class="chart-column"><div class="bar-pair"><div class="bar" style="height:${data.initial[i]}%"><b>${data.initial[i].toFixed(1)}</b></div><div class="bar trained" style="height:${data.trained[i]}%"><b>${data.trained[i].toFixed(1)}</b></div></div><span>${scale}</span></div>`
  ).join("");
  document.querySelector("#result-rows").innerHTML = scales.map((scale, i) =>
    `<tr><th scope="row">${scale}</th><td>${data.initial[i].toFixed(2)}</td><td>${data.trained[i].toFixed(2)}</td><td>+${(data.trained[i]-data.initial[i]).toFixed(2)}</td></tr>`
  ).join("");
}
document.querySelectorAll("[data-benchmark]").forEach(button => button.addEventListener("click", () => showBenchmark(button.dataset.benchmark)));
showBenchmark("tau2");

const viewer = document.querySelector("#figure-viewer");
const fullImage = viewer.querySelector("img");
document.querySelectorAll("[data-zoom]").forEach(link => link.addEventListener("click", event => {
  if (typeof viewer.showModal !== "function") return;
  event.preventDefault();
  fullImage.src = link.href;
  fullImage.alt = link.querySelector("img").alt;
  viewer.querySelector(".original-figure").href = link.href;
  viewer.showModal();
}));
viewer.querySelector(".close").addEventListener("click", () => viewer.close());
viewer.addEventListener("click", event => { if (event.target === viewer) viewer.close(); });
document.querySelector("#copy-citation").addEventListener("click", async () => {
  const status = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText(document.querySelector("#bibtex").textContent);
    status.textContent = "BibTeX copied.";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector("#bibtex"));
    selection.removeAllRanges(); selection.addRange(range);
    status.textContent = "Citation selected. Press Ctrl+C or ⌘C to copy.";
  }
});
function updateProgress() {
  const available = document.documentElement.scrollHeight - innerHeight;
  document.querySelector(".progress").style.width = `${available > 0 ? (scrollY / available) * 100 : 0}%`;
}
addEventListener("scroll", updateProgress, {passive: true});
addEventListener("resize", updateProgress);
updateProgress();
