const STARTER_POKEMON = new Set([
  // Generation 1
  "bulbasaur", "ivysaur", "venusaur",
  "charmander", "charmeleon", "charizard",
  "squirtle", "wartortle", "blastoise",

  // Generation 2
  "chikorita", "bayleef", "meganium",
  "cyndaquil", "quilava", "typhlosion",
  "totodile", "croconaw", "feraligatr",

  // Generation 3
  "treecko", "grovyle", "sceptile",
  "torchic", "combusken", "blaziken",
  "mudkip", "marshtomp", "swampert",

  // Generation 4
  "turtwig", "grotle", "torterra",
  "chimchar", "monferno", "infernape",
  "piplup", "prinplup", "empoleon",

  // Generation 5
  "snivy", "servine", "serperior",
  "tepig", "pignite", "emboar",
  "oshawott", "dewott", "samurott",

  // Generation 6
  "chespin", "quilladin", "chesnaught",
  "fennekin", "braixen", "delphox",
  "froakie", "frogadier", "greninja",

  // Generation 7
  "rowlet", "dartrix", "decidueye",
  "litten", "torracat", "incineroar",
  "popplio", "brionne", "primarina",

  // Generation 8
  "grookey", "thwackey", "rillaboom",
  "scorbunny", "raboot", "cinderace",
  "sobble", "drizzile", "inteleon",

  // Generation 9
  "sprigatito", "floragato", "meowscarada",
  "fuecoco", "crocalor", "skeledirge",
  "quaxly", "quaxwell", "quaquaval"
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

  // Capture the click before app.js's generator handler so starter Pokemon and
  // every stage of their evolution lines are removed from the candidate pool.
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
