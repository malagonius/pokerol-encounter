const FOSSIL_FILTER_OPTIONS = [
  ["include_fossils", "Include fossils"],
  ["no_fossils", "No fossils"],
  ["only_fossils", "Only fossils"]
];

// Pokemon species that are revived from fossils, including their evolutionary families.
const FOSSIL_POKEMON = new Set([
  "omanyte", "omastar", "kabuto", "kabutops", "aerodactyl",
  "lileep", "cradily", "anorith", "armaldo",
  "cranidos", "rampardos", "shieldon", "bastiodon",
  "tirtouga", "carracosta", "archen", "archeops",
  "tyrunt", "tyrantrum", "amaura", "aurorus",
  "dracozolt", "arctozolt", "dracovish", "arctovish"
]);

function setupFossilFilter() {
  const legendaryFilter = document.getElementById("legendaryFilter");
  const generateButton = document.getElementById("generateBtn");
  const resetButton = document.getElementById("resetBtn");

  if (!legendaryFilter || !generateButton || !resetButton) {
    console.warn("Fossil filter could not initialize: required controls are missing.");
    return;
  }

  const label = document.createElement("label");
  label.innerHTML = `
    Fossil
    <select id="fossilFilter">
      ${FOSSIL_FILTER_OPTIONS.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}
    </select>
  `;
  legendaryFilter.closest("label")?.after(label);

  const fossilFilter = label.querySelector("#fossilFilter");

  // generateEncounter() builds its candidate list synchronously before its first await.
  // Temporarily narrowing state.allPokemon here lets the existing generator and all
  // of its other filters continue to work unchanged.
  generateButton.addEventListener("click", () => {
    const selectedFilter = fossilFilter.value;
    if (selectedFilter === "include_fossils") return;

    const originalPokemon = state.allPokemon;
    state.allPokemon = originalPokemon.filter((name) => {
      const isFossil = FOSSIL_POKEMON.has(name);
      return selectedFilter === "only_fossils" ? isFossil : !isFossil;
    });

    // generateEncounter() has already copied the candidate list by the next macrotask.
    setTimeout(() => {
      state.allPokemon = originalPokemon;
    }, 0);
  }, true);

  resetButton.addEventListener("click", () => {
    fossilFilter.value = "include_fossils";
  }, true);
}

setupFossilFilter();
