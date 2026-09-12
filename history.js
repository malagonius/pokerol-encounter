const generatedHistory = new Map();

// Identity of the state.lastResult array already folded into generatedHistory.
// A new array reference means a new generation, which replaces the whole history.
let recordedResult = null;

function setupGeneratedHistory() {
  const copyButton = document.getElementById("copyBtn");
  const results = document.getElementById("results");

  if (!copyButton || !results) {
    console.warn("Generated history could not initialize: required controls are missing.");
    return;
  }

  // The old Copy Result button already has a click handler from app.js.
  // Replace the element so that handler is removed before turning it into View History.
  const historyButton = copyButton.cloneNode(true);
  historyButton.textContent = "View History";
  historyButton.title = "View generated Pokemon history";
  copyButton.replaceWith(historyButton);

  const modal = document.createElement("div");
  modal.id = "historyModal";
  modal.className = "history-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="history-backdrop" data-history-close></div>
    <section class="history-dialog" role="dialog" aria-modal="true" aria-labelledby="historyTitle">
      <header class="history-header">
        <div>
          <h2 id="historyTitle">Generated History</h2>
          <p id="historyCount" class="history-count">0 Pokemon</p>
        </div>
        <button type="button" class="history-close" title="Close history" aria-label="Close history" data-history-close>✕</button>
      </header>
      <div id="historyList" class="history-list"></div>
      <footer class="history-footer">
        <button type="button" id="clearHistoryBtn" class="ghost">Remove all from history</button>
      </footer>
    </section>
  `;
  document.body.append(modal);

  const historyList = modal.querySelector("#historyList");
  const historyCount = modal.querySelector("#historyCount");
  const clearHistoryButton = modal.querySelector("#clearHistoryBtn");

  function renderHistory() {
    historyList.textContent = "";
    historyCount.textContent = `${generatedHistory.size} Pokemon`;
    clearHistoryButton.disabled = generatedHistory.size === 0;

    if (generatedHistory.size === 0) {
      const empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = "No Pokemon have been generated yet.";
      historyList.append(empty);
      return;
    }

    for (const [name, pokemon] of generatedHistory) {
      const item = document.createElement("article");
      item.className = "history-item";

      const image = document.createElement("img");
      image.className = "history-sprite";
      image.src = pokemon.sprite || "";
      image.alt = toLabel(name);
      image.loading = "lazy";

      const title = document.createElement("span");
      title.className = "history-name";
      title.textContent = toLabel(name);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "history-remove";
      removeButton.textContent = "✕";
      removeButton.title = `Remove ${toLabel(name)} from history`;
      removeButton.setAttribute("aria-label", `Remove ${toLabel(name)} from history`);
      removeButton.addEventListener("click", () => {
        generatedHistory.delete(name);
        renderHistory();
      });

      item.append(image, title, removeButton);
      historyList.append(item);
    }
  }

  function openHistory() {
    renderHistory();
    modal.hidden = false;
    document.body.classList.add("history-open");
  }

  function closeHistory() {
    modal.hidden = true;
    document.body.classList.remove("history-open");
  }

  historyButton.addEventListener("click", openHistory);
  modal.querySelectorAll("[data-history-close]").forEach((element) => {
    element.addEventListener("click", closeHistory);
  });
  clearHistoryButton.addEventListener("click", () => {
    generatedHistory.clear();
    recordedResult = state.lastResult;
    renderHistory();
  });

  // generateEncounter() writes the generated cards to #results after its async work.
  // Observe that render and record the generated Pokemon in a unique-name history.
  const observer = new MutationObserver(() => {
    if (!Array.isArray(state.lastResult)) return;
    if (state.lastResult === recordedResult) return;

    recordedResult = state.lastResult;
    generatedHistory.clear();

    state.lastResult.forEach((pokemon) => {
      if (!pokemon?.name || generatedHistory.has(pokemon.name)) return;
      generatedHistory.set(pokemon.name, {
        name: pokemon.name,
        sprite: pokemon.sprite
      });
    });

    if (!modal.hidden) renderHistory();
  });
  observer.observe(results, { childList: true, subtree: true });

  // Exclude every Pokemon currently in history before the existing generator runs.
  // Capture phase guarantees this happens before app.js's normal click handler.
  historyButton.ownerDocument.getElementById("generateBtn")?.addEventListener("click", () => {
    if (generatedHistory.size === 0) return;

    const originalPokemon = state.allPokemon;
    const historyNames = new Set(generatedHistory.keys());
    state.allPokemon = originalPokemon.filter((name) => !historyNames.has(name));

    // generateEncounter() has copied its candidate list synchronously by this point.
    setTimeout(() => {
      state.allPokemon = originalPokemon;
    }, 0);
  }, true);

  renderHistory();
}

setupGeneratedHistory();
