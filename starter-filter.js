const STARTER_POKEMON = new Set([
  "bulbasaur", "charmander", "squirtle",
  "chikorita", "cyndaquil", "totodile",
  "treecko", "torchic", "mudkip",
  "turtwig", "chimchar", "piplup",
  "snivy", "tepig", "oshawott",
  "chespin", "fennekin", "froakie",
  "rowlet", "litten", "popplio",
  "grookey", "scorbunny", "sobble",
  "sprigatito", "fuecoco", "quaxly"
]);

function setupStarterFilter() {
  const legendaryFilter = document.getElementById("legendaryFilter");
  const generateButton = document.getElementById("generateBtn");
  const resetButton = document.getElementById("resetBtn");

  if (!legendaryFilter || !generateButton || !resetButton) {
    console.warn("Starter filter could not initialize: required controls are missing.");
    return;
  }

  const wrapper = document.createElement("label");
  wrapper.className = "check-row";
  wrapper.innerHTML = `
    <input id="excludeStarters" type="checkbox">
    Exclude starters
  `;

  const legendaryWrapper = legendaryFilter.closest("label");
  if (legendaryWrapper) {
    legendaryWrapper.insertAdjacentElement("afterend", wrapper);
  } else {
    legendaryFilter.insertAdjacentElement("afterend", wrapper);
  }

  const checkbox = wrapper.querySelector("#excludeStarters");

  // Capture the click before app.js's generator handler so starter Pokemon are
  // removed from the candidate pool before the existing filtering pipeline runs.
  generateButton.addEventListener("click", () => {
    if (!checkbox.checked) return;

    const originalPokemon = state.allPokemon;
    state.allPokemon = originalPokemon.filter((name) => !STARTER_POKEMON.has(name));

    // generateEncounter() builds its candidate list synchronously before its
    // first await, so restore the shared list immediately after that work begins.
    setTimeout(() => {
      state.allPokemon = originalPokemon;
    }, 0);
  }, true);

  resetButton.addEventListener("click", () => {
    checkbox.checked = false;
  }, true);
}

setupStarterFilter();
