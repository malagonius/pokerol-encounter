const API = "https://pokeapi.co/api/v2";
const POKEROLE_DATA_BASE = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/v3.0/Pokedex";
const MOVE_DATA_BASE = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/v3.0/Moves";

const STAT_NAMES = ["Strength", "Dexterity", "Vitality", "Special", "Insight"];
const SOCIAL_NAMES = ["Tough", "Cool", "Beauty", "Cute", "Clever"];
const SKILL_NAMES = [
  "Brawl", "Channel", "Clash", "Evasion", "Alert", "Athletic",
  "Nature", "Stealth", "Allure", "Etiquette", "Intimidate", "Perform"
];
const NATURES = [
  ["Adamant", 4], ["Bashful", 6], ["Bold", 9], ["Brave", 9], ["Calm", 8],
  ["Careful", 5], ["Docile", 7], ["Gentle", 10], ["Hardy", 9], ["Hasty", 7],
  ["Impish", 7], ["Jolly", 10], ["Lax", 8], ["Lonely", 5], ["Mild", 8],
  ["Modest", 10], ["Naive", 7], ["Naughty", 6], ["Quiet", 5], ["Quirky", 9],
  ["Rash", 6], ["Relaxed", 8], ["Sassy", 7], ["Serious", 4], ["Timid", 4]
];
const RANK_GENERATION_RULES = {
  UNRANKED: { attributes: 0, socials: 0, skills: 0, skillLimit: 1 },
  STARTER: { attributes: 0, socials: 0, skills: 5, skillLimit: 1 },
  ROOKIE: { attributes: 2, socials: 2, skills: 10, skillLimit: 2 },
  STANDARD: { attributes: 4, socials: 4, skills: 14, skillLimit: 3 },
  ADVANCED: { attributes: 6, socials: 6, skills: 17, skillLimit: 4 },
  EXPERT: { attributes: 8, socials: 8, skills: 19, skillLimit: 5 },
  ACE: { attributes: 10, socials: 10, skills: 20, skillLimit: 5 },
  MASTER: { attributes: 10, socials: 10, skills: 22, skillLimit: 5 },
  CHAMPION: { attributes: 10, socials: 10, skills: 22, skillLimit: 5 }
};

const RANK_METHODS = [
  "Any",
  "UNRANKED",
  "STARTER",
  "ROOKIE",
  "STANDARD",
  "ADVANCED",
  "EXPERT",
  "ACE",
  "MASTER",
  "CHAMPION"
];
const RANK_ICON_BY_METHOD = {
  UNRANKED: "WhiteBall.png",
  STARTER: "WhiteBall.png",
  ROOKIE: "PokeBall.png",
  STANDARD: "GreatBall.png",
  ADVANCED: "UltraBall.png",
  EXPERT: "ExpertBall.png",
  ACE: "CherishBall.png",
  MASTER: "MasterBall.png",
  CHAMPION: "ChampionBall.png"
};
const RANK_ICON_BASE_URL = "https://pokeroledex.nl/images/rank/";
const TYPE_ICON_BASE_URL = "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/";
const TYPE_OPTIONS = [
  "Any",
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying",
  "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
];
const HABITATS = [
  "Any",
  "cave", "forest", "grassland", "mountain", "rare", "rough-terrain", "sea", "urban", "waters-edge"
];
const GENERATIONS = [
  "Any",
  "generation-i",
  "generation-ii",
  "generation-iii",
  "generation-iv",
  "generation-v",
  "generation-vi",
  "generation-vii",
  "generation-viii",
  "generation-ix"
];

const state = {
  allPokemon: [],
  cache: new Map(),
  corrections: {},
  typeMembersCache: new Map(),
  pokeroleCache: new Map(),
  moveCache: new Map(),
  lastResult: [],
  lastPoolSize: 0
};

const els = {
  count: document.getElementById("count"),
  nameFilter: document.getElementById("nameFilter"),
  typeOptions: document.getElementById("typeOptions"),
  generationOptions: document.getElementById("generationOptions"),
  habitatOptions: document.getElementById("habitatOptions"),
  rankMethodOptions: document.getElementById("rankMethodOptions"),
  rankOrLower: document.getElementById("rankOrLower"),
  legendaryFilter: document.getElementById("legendaryFilter"),
  includeMythical: document.getElementById("includeMythical"),
  excludeForms: document.getElementById("excludeForms"),
  allowDuplicates: document.getElementById("allowDuplicates"),
  generateBtn: document.getElementById("generateBtn"),
  copyBtn: document.getElementById("copyBtn"),
  resetBtn: document.getElementById("resetBtn"),
  status: document.getElementById("status"),
  resultMeta: document.getElementById("resultMeta"),
  results: document.getElementById("results"),
  cardTemplate: document.getElementById("cardTemplate"),
  filterToggle: document.getElementById("filterToggle"),
  filterOverlay: document.getElementById("filterOverlay"),
  controlsPanel: document.getElementById("controlsPanel")
};

function setupSelects() {
  const typeIconResolver = (type) => `${TYPE_ICON_BASE_URL}${type}.svg`;
  const genLabel = (value) => value === "Any" ? "Any" : value.replace("generation-", "").toUpperCase();

  renderCheckboxGroup(els.typeOptions, "type", TYPE_OPTIONS, typeIconResolver, null, "type-row");
  renderCheckboxGroup(els.habitatOptions, "habitat", HABITATS);
  renderCheckboxGroup(els.generationOptions, "generation", GENERATIONS, null, genLabel);
  renderRankMethodGroup(els.rankMethodOptions, "rankMethod", RANK_METHODS);
}

function addOption(select, value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value === "Any" ? "Any" : toLabel(value);
  if (value === "Any") {
    option.selected = true;
  }
  select.append(option);
}

function renderCheckboxGroup(container, groupName, values, iconResolver, labelResolver, rowClassName) {
  values.forEach((value) => {
    const row = document.createElement("label");
    row.className = rowClassName ? `check-row ${rowClassName}` : "check-row";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = groupName;
    input.value = value;
    input.checked = value === "Any";

    input.addEventListener("change", () => onCheckboxGroupChange(groupName, input.value));

    const text = document.createElement("span");
    const labelFn = labelResolver || toLabel;
    text.textContent = value === "Any" ? "Any" : labelFn(value);

    row.append(input, text);

    if (iconResolver && value !== "Any") {
      const icon = document.createElement("span");
      icon.className = "type-icon-span";
      icon.setAttribute("data-type", value);
      icon.style.setProperty("--type-icon-url", `url("${iconResolver(value)}")`);
      row.prepend(icon);
    }

    container.append(row);
  });
}

function renderRankMethodGroup(container, groupName, values) {
  values.forEach((value) => {
    const row = document.createElement("label");
    row.className = "check-row rank-method-row";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = groupName;
    input.value = value;
    input.checked = value === "Any";
    input.addEventListener("change", () => onCheckboxGroupChange(groupName, input.value));

    if (value !== "Any") {
      const icon = document.createElement("img");
      icon.className = "rank-icon";
      icon.alt = `${toLabel(value)} icon`;
      icon.src = `${RANK_ICON_BASE_URL}${RANK_ICON_BY_METHOD[value]}`;
      row.append(icon);
    }

    const text = document.createElement("span");
    text.textContent = value === "Any" ? "Any" : toLabel(value);

    row.append(input, text);
    container.append(row);
  });
}

function onCheckboxGroupChange(groupName, changedValue) {
  const inputs = Array.from(document.querySelectorAll(`input[name="${groupName}"]`));
  const anyInput = inputs.find((i) => i.value === "Any");

  if (changedValue === "Any" && anyInput && anyInput.checked) {
    inputs.forEach((input) => {
      if (input.value !== "Any") {
        input.checked = false;
      }
    });
    return;
  }

  const selectedSpecific = inputs.filter((i) => i.value !== "Any" && i.checked);
  if (anyInput) {
    anyInput.checked = selectedSpecific.length === 0;
  }
}

function readCheckboxGroupValues(groupName) {
  return Array.from(document.querySelectorAll(`input[name="${groupName}"]:checked`)).map((i) => i.value);
}

function isMultiFilterMatch(values, currentValue) {
  return values.length === 0 || values.includes("Any") || values.includes(currentValue);
}

function isRankMethodMatch(rankValue, selectedRankMethods, includeLower) {
  if (selectedRankMethods.length === 0 || selectedRankMethods.includes("Any")) {
    return true;
  }

  const rankedSelected = selectedRankMethods.filter((v) => v !== "Any");
  const currentIndex = RANK_METHODS.indexOf(rankValue);
  if (currentIndex < 0) {
    return false;
  }

  if (!includeLower) {
    return rankedSelected.includes(rankValue);
  }

  return rankedSelected.some((target) => {
    const targetIndex = RANK_METHODS.indexOf(target);
    return targetIndex >= 0 && currentIndex <= targetIndex;
  });
}

function toLabel(value) {
  return value
    .toLowerCase()
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function rankFromBst(baseStatTotal) {
  if (baseStatTotal <= 220) return "UNRANKED";
  if (baseStatTotal <= 280) return "STARTER";
  if (baseStatTotal <= 330) return "ROOKIE";
  if (baseStatTotal <= 380) return "STANDARD";
  if (baseStatTotal <= 430) return "ADVANCED";
  if (baseStatTotal <= 490) return "EXPERT";
  if (baseStatTotal <= 560) return "ACE";
  if (baseStatTotal <= 640) return "MASTER";
  return "CHAMPION";
}

function rankFromPokerole(pokeroleData, baseStatTotal) {
  const recommendedRank = pokeroleData?.RecommendedRank?.toUpperCase();
  return RANK_METHODS.includes(recommendedRank) ? recommendedRank : rankFromBst(baseStatTotal);
}

function seededRandom(seed) {
  const seedText = String(seed || "");
  const hash = xmur3(seedText || String(Date.now()));
  return mulberry32(hash());
}

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function finalHash() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function random() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, rng) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function loadBaseList() {
  setStatus("Loading Pokemon list...");
  const response = await fetch(`${API}/pokemon?limit=1302`);
  if (!response.ok) throw new Error("Cannot load Pokemon list from PokeAPI.");
  const data = await response.json();
  state.allPokemon = data.results.map((p) => p.name);

  // Load local corrections to fix data integrity issues (e.g. wrong habitats)
  try {
    const corrResponse = await fetch("./corrections.json");
    if (corrResponse.ok) {
      state.corrections = await corrResponse.json();
    }
  } catch (e) {
    // Corrections file is optional — proceed without it
    console.warn("Corrections file not loaded:", e);
  }

  setStatus(`Loaded ${state.allPokemon.length} Pokemon. Ready.`);
}

async function getPokemonRecord(name) {
  if (state.cache.has(name)) {
    return state.cache.get(name);
  }

  const pokemonRes = await fetch(`${API}/pokemon/${name}`);
  if (!pokemonRes.ok) {
    throw new Error(`Cannot load details for ${name}.`);
  }

  const pokemon = await pokemonRes.json();
  const [speciesRes, pokeroleData] = await Promise.all([
    fetch(pokemon.species.url),
    fetchPokeroleData(name)
  ]);
  if (!speciesRes.ok) {
    throw new Error(`Cannot load species for ${name}.`);
  }
  const species = await speciesRes.json();

  const baseStatTotal = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  const record = {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map((t) => t.type.name),
    habitat: species.habitat ? species.habitat.name : "unknown",
    generation: species.generation ? species.generation.name : "unknown",
    legendary: species.is_legendary,
    mythical: species.is_mythical,
    baseStatTotal,
    rank: rankFromPokerole(pokeroleData, baseStatTotal),
    sprite: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default
  };

  // Apply corrections from overrides file.
  // If the API returned "unknown" for a field, check the corrections file.
  // If a correction exists, use it; otherwise keep the API value (which is "unknown").
  if (state.corrections[record.name]) {
    const correction = state.corrections[record.name];
    if (correction.habitat) {
      record.habitat = correction.habitat;
    }
    if (correction.types && Array.isArray(correction.types)) {
      record.types = correction.types;
    }
    if (correction.generation) {
      record.generation = correction.generation;
    }
  }

  state.cache.set(name, record);
  return record;
}

async function getTypeMembers(typeName) {
  if (typeName === "Any") {
    return null;
  }

  if (state.typeMembersCache.has(typeName)) {
    return state.typeMembersCache.get(typeName);
  }

  const response = await fetch(`${API}/type/${typeName}`);
  if (!response.ok) {
    throw new Error(`Cannot load type list for ${typeName}.`);
  }

  const data = await response.json();
  const names = new Set(data.pokemon.map((entry) => entry.pokemon.name));
  state.typeMembersCache.set(typeName, names);
  return names;
}

function matchesFilters(record, filters) {
  // Type filter: OR logic — if ANY selected type is in the record's types, it matches
  const selectedTypes = filters.types.filter((t) => t !== "Any");
  if (selectedTypes.length > 0 && !selectedTypes.some((t) => record.types.includes(t))) {
    return false;
  }

  if (filters.excludeForms && record.name.includes("-")) {
    return false;
  }

  if (!isMultiFilterMatch(filters.habitats, record.habitat)) {
    return false;
  }

  if (!isMultiFilterMatch(filters.generations, record.generation)) {
    return false;
  }

  if (!isRankMethodMatch(record.rank, filters.rankMethods, filters.rankOrLower)) {
    return false;
  }

  if (filters.legendary === "no_legendaries" && record.legendary) {
    return false;
  }

  if (filters.legendary === "only_legendaries" && !record.legendary) {
    return false;
  }

  if (!filters.includeMythical && record.mythical) {
    return false;
  }

  return true;
}

function createEncounterRecord(baseRecord) {
  return {
    ...baseRecord,
    locked: false,
    removed: false,
    shiny: false,
    pokeroleStats: null
  };
}

function setStatus(text) {
  els.status.textContent = text;
}

function statLabel(name) {
  const labels = {
    Strength: "Str",
    Dexterity: "Dex",
    Vitality: "Vit",
    Special: "Spc",
    Insight: "Ins"
  };
  return labels[name] || name;
}

async function fetchPokeroleData(pokemonName) {
  if (state.pokeroleCache.has(pokemonName)) {
    return state.pokeroleCache.get(pokemonName);
  }

  const titleName = toLabel(pokemonName);
  const url = `${POKEROLE_DATA_BASE}/${encodeURIComponent(titleName)}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.pokeroleCache.set(pokemonName, data);
    return data;
  } catch (e) {
    console.warn(`Failed to load Pokerole data for ${pokemonName}:`, e);
    return null;
  }
}

async function fetchMoveData(moveName) {
  if (state.moveCache.has(moveName)) {
    return state.moveCache.get(moveName);
  }

  const url = `${MOVE_DATA_BASE}/${encodeURIComponent(moveName)}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.moveCache.set(moveName, data);
    return data;
  } catch (e) {
    console.warn(`Failed to load move data for ${moveName}:`, e);
    return null;
  }
}

function distributePoints(stats, names, points, maximumFor) {
  for (let point = 0; point < points; point += 1) {
    const eligibleNames = names.filter((name) => stats[name] < maximumFor(name));
    if (eligibleNames.length === 0) break;
    const selectedName = eligibleNames[Math.floor(Math.random() * eligibleNames.length)];
    stats[selectedName] += 1;
  }
}

function generateStats(pokeroleData, rank) {
  const stats = {};
  const rules = RANK_GENERATION_RULES[rank] || RANK_GENERATION_RULES.STARTER;

  for (const name of STAT_NAMES) {
    stats[name] = pokeroleData[name] || 1;
  }
  distributePoints(stats, STAT_NAMES, rules.attributes, (name) => pokeroleData[`Max${name}`] || stats[name]);

  for (const name of SOCIAL_NAMES) {
    stats[name] = 1;
  }
  distributePoints(stats, SOCIAL_NAMES, rules.socials, () => 5);

  for (const name of SKILL_NAMES) {
    stats[name] = 0;
  }
  distributePoints(stats, SKILL_NAMES, rules.skills, () => rules.skillLimit);

  const [natureName, confidence] = NATURES[Math.floor(Math.random() * NATURES.length)];
  stats.natureInfo = { name: natureName, confidence };

  const baseHP = pokeroleData.BaseHP || 1;
  stats.maxHP = baseHP + stats.Vitality;
  stats.currentHP = stats.maxHP;

  return stats;
}

function renderStats(stats, container) {
  container.textContent = "";

  const nature = document.createElement("div");
  nature.className = "nature-summary";
  nature.textContent = `${stats.natureInfo.name} nature · Confidence ${stats.natureInfo.confidence}`;
  container.append(nature);

  const groups = [
    ["Attributes", STAT_NAMES],
    ["Socials", SOCIAL_NAMES],
    ["Skills", SKILL_NAMES]
  ];

  for (const [groupName, names] of groups) {
    const group = document.createElement("section");
    group.className = `stat-group stat-group-${groupName.toLowerCase()}`;

    const heading = document.createElement("h5");
    heading.className = "stat-group-heading";
    heading.textContent = groupName;

    const values = document.createElement("div");
    values.className = "stat-group-values";

    for (const name of names) {
      const row = document.createElement("div");
      row.className = "stat-row";

      const label = document.createElement("span");
      label.className = "stat-label";
      label.textContent = statLabel(name);
      label.title = name;

      const value = document.createElement("span");
      value.className = "stat-value";
      value.textContent = stats[name];

      row.append(label, value);
      values.append(row);
    }

    group.append(heading, values);
    container.append(group);
  }
}

function abbreviateMoveTerm(term) {
  const abbreviations = {
    Athletic: "ATH",
    Brawl: "BRL",
    Channel: "CHN",
    Charm: "CHM",
    Clever: "CLV",
    Cute: "CUT",
    Intimidate: "ITM",
    Perform: "PRF",
    Stealth: "STL",
    Tough: "TGH"
  };
  return abbreviations[term] || term.toUpperCase();
}

function translateMoveFormula(formula, stats) {
  if (!formula) return "";

  return formula
    .split("/")
    .map((term) => {
      const trimmedTerm = term.trim();
      return Object.hasOwn(stats, trimmedTerm)
        ? String(stats[trimmedTerm])
        : abbreviateMoveTerm(trimmedTerm);
    })
    .join("/");
}

function addFormulaChoices(parts) {
  let totals = [0];

  for (const part of parts.filter(Boolean)) {
    const choices = part.split("/").map(Number);
    if (!choices.every(Number.isFinite)) return parts.filter(Boolean).join(" + ");
    totals = totals.flatMap((total) => choices.map((choice) => total + choice));
  }

  return [...new Set(totals)].join("/");
}

function translateDamage(moveData, stats) {
  const damageParts = [moveData.Damage1, moveData.Damage2]
    .filter(Boolean)
    .map((formula) => translateMoveFormula(formula, stats));
  const power = Number(moveData.Power) || 0;

  if (damageParts.length === 0) return "—";
  return addFormulaChoices(power > 0 ? [...damageParts, String(power)] : damageParts);
}

function translateAccuracy(moveData, stats) {
  const accuracy = translateMoveFormula(moveData.Accuracy1, stats) || "—";
  const skill = translateMoveFormula(moveData.Accuracy2, stats);
  return addFormulaChoices(skill ? [accuracy, skill] : [accuracy]);
}

function createMoveMetric(label, value, title) {
  const metric = document.createElement("span");
  metric.className = "move-metric";
  metric.textContent = `${label}: ${value}`;
  metric.title = title;
  return metric;
}

function createMoveRow(moveName, moveData, learnedRank, stats) {
  const row = document.createElement("details");
  row.className = "move-row";
  row.dataset.type = (moveData?.Type || "normal").toLowerCase();

  const summary = document.createElement("summary");
  summary.className = "move-summary";

  const rankIcon = document.createElement("img");
  rankIcon.className = "move-rank-icon";
  rankIcon.src = `${RANK_ICON_BASE_URL}${RANK_ICON_BY_METHOD[learnedRank.toUpperCase()] || RANK_ICON_BY_METHOD.STARTER}`;
  rankIcon.alt = `${learnedRank} rank`;
  rankIcon.title = `Learned at ${learnedRank} rank`;

  const typeIcon = document.createElement("img");
  typeIcon.className = "move-type-icon";
  typeIcon.src = `${TYPE_ICON_BASE_URL}${row.dataset.type}.svg`;
  typeIcon.alt = "";
  typeIcon.title = moveData?.Type || "Unknown type";

  const title = document.createElement("span");
  title.className = "move-title";
  title.textContent = moveName;

  const metrics = document.createElement("span");
  metrics.className = "move-metrics";

  if (moveData) {
    metrics.append(
      createMoveMetric(
        "A",
        translateAccuracy(moveData, stats),
        `Accuracy: ${moveData.Accuracy1 || "—"}${moveData.Accuracy2 ? ` + ${moveData.Accuracy2}` : ""}`
      ),
      createMoveMetric(
        "D",
        translateDamage(moveData, stats),
        `Damage: ${moveData.Damage1 || moveData.Damage2 || "—"}${Number(moveData.Power) ? ` + Power ${moveData.Power}` : ""}`
      )
    );
  }

  const category = document.createElement("span");
  category.className = `move-category move-category-${(moveData?.Category || "support").toLowerCase()}`;
  category.textContent = moveData?.Category === "Physical" ? "✹" : moveData?.Category === "Special" ? "◎" : "◉";
  category.title = moveData?.Category || "Support";

  const disclosure = document.createElement("span");
  disclosure.className = "move-disclosure";
  disclosure.textContent = "⌄";
  disclosure.setAttribute("aria-hidden", "true");

  summary.append(rankIcon, typeIcon, title, metrics, category, disclosure);
  row.append(summary);

  const body = document.createElement("div");
  body.className = "move-body";

  if (moveData) {
    const context = document.createElement("p");
    context.className = "move-context";
    context.textContent = `${moveData.Type || "Unknown"} · ${moveData.Category || "Unknown"} · Target: ${moveData.Target || "—"}`;
    body.append(context);

    if (moveData.Effect) {
      const effect = document.createElement("p");
      effect.className = "move-effect";
      effect.textContent = moveData.Effect.trim();
      body.append(effect);
    }

    if (moveData.Description) {
      const description = document.createElement("p");
      description.className = "move-description";
      description.textContent = moveData.Description;
      body.append(description);
    }
  } else {
    body.textContent = "Move details unavailable.";
  }

  row.append(body);
  return row;
}

async function renderMoves(pokeroleData, container, rank, stats) {
  container.textContent = "";

  // Map our app's rank to Pokerole rank
  const rankMap = {
    UNRANKED: "Starter",
    STARTER: "Starter",
    ROOKIE: "Rookie",
    STANDARD: "Standard",
    ADVANCED: "Advanced",
    EXPERT: "Expert",
    ACE: "Ace",
    MASTER: "Master",
    CHAMPION: "Champion"
  };
  const targetRank = rankMap[rank] || "Starter";

  // Get moves learned at or below the target rank
  const rankOrder = ["Starter", "Rookie", "Standard", "Advanced", "Expert", "Ace", "Master", "Champion"];
  const targetIdx = rankOrder.indexOf(targetRank);

  const eligibleMoves = (pokeroleData.Moves || [])
    .filter((m) => {
      const learnedRank = m.Learned || "";
      const moveIdx = rankOrder.indexOf(learnedRank);
      return moveIdx !== -1 && moveIdx <= targetIdx;
    });

  if (eligibleMoves.length === 0) {
    container.textContent = "No moves found";
    return;
  }

  const moveDataList = await Promise.all(eligibleMoves.map((move) => fetchMoveData(move.Name)));
  eligibleMoves.forEach((move, index) => {
    container.append(createMoveRow(move.Name, moveDataList[index], move.Learned || "Starter", stats));
  });
}

function render(records) {
  els.results.textContent = "";
  els.resultMeta.textContent = records.length
    ? `${records.length} found from pool ${state.lastPoolSize}`
    : "No match";

  if (!records.length) {
    const p = document.createElement("p");
    p.textContent = "No encounter found with those filters. Try a broader filter set.";
    els.results.append(p);
    return;
  }

  records.forEach((record) => {
    const fragment = els.cardTemplate.content.cloneNode(true);
    const sprite = fragment.querySelector(".sprite");
    const name = fragment.querySelector(".name");
    const meta = fragment.querySelector(".meta");
    const extra = fragment.querySelector(".extra");
    const chips = fragment.querySelector(".chips");

    sprite.src = record.sprite || "";
    sprite.alt = record.name;
    name.textContent = `${toLabel(record.name)} #${record.id}`;
    meta.textContent = `Rank: ${toLabel(record.rank)} | Habitat: ${toLabel(record.habitat)}`;
    extra.textContent = `BST: ${record.baseStatTotal} | Gen: ${record.generation === "unknown" ? "Unknown" : record.generation.replace("generation-", "").toUpperCase()} | Legendary: ${record.legendary ? "Yes" : "No"} | Mythical: ${record.mythical ? "Yes" : "No"}`;

    record.types.forEach((type) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = toLabel(type);
      chips.append(chip);
    });

    // Shiny roll button
    const card = fragment.querySelector(".card");
    const shinyBtn = fragment.querySelector(".shiny-btn");
    if (shinyBtn) {
      shinyBtn.addEventListener("click", () => rollShiny(card, shinyBtn, record));
    }

    // Restore shiny state if already rolled
    if (record.shiny) {
      card.classList.add("shiny");
      if (!card.querySelector(".shiny-tag")) {
        const tag = document.createElement("span");
        tag.className = "shiny-tag";
        tag.textContent = "SHINY";
        card.querySelector(".chips").prepend(tag);
      }
      shinyBtn.textContent = "✨ Shiiiiiny!";
      shinyBtn.disabled = true;
      shinyBtn.classList.add("rolled");
    } else {
      // Auto-roll shiny on card creation
      rollShiny(card, shinyBtn, record);
    }

    // Lock button
    const lockBtn = fragment.querySelector(".lock-btn");
    if (lockBtn) {
      lockBtn.addEventListener("click", () => {
        record.locked = !record.locked;
        card.classList.toggle("locked", record.locked);
        lockBtn.classList.toggle("locked", record.locked);
        lockBtn.textContent = record.locked ? "✓" : "🔒";
      });
      // Restore lock state if already locked
      if (record.locked) {
        card.classList.add("locked");
        lockBtn.classList.add("locked");
        lockBtn.textContent = "✓";
      }
    }

    // Remove button
    const removeBtn = fragment.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        card.remove();
        record.removed = true;
      });
    }

    // Chevron / detail panel toggle
    const chevronBtn = fragment.querySelector(".chevron-btn");
    const detailPanel = fragment.querySelector(".detail-panel");
    const statsGrid = fragment.querySelector(".stats-grid");
    const hpRow = fragment.querySelector(".hp-row");
    const hpValue = fragment.querySelector(".hp-value");
    const hpDec = fragment.querySelector(".hp-dec");
    const hpInc = fragment.querySelector(".hp-inc");
    const movesDiv = fragment.querySelector(".moves");
    const movesSpinner = fragment.querySelector(".moves-spinner");
    const movesContent = fragment.querySelector(".moves-content");

    if (chevronBtn && detailPanel) {
      chevronBtn.addEventListener("click", async () => {
        const isExpanded = !detailPanel.style.display || detailPanel.style.display === "none";

        if (isExpanded) {
          // Expand: fetch Pokerole data and generate stats once
          chevronBtn.classList.add("expanded");
          card.classList.add("details-open");
          detailPanel.style.display = "block";

          try {
            const pokeroleData = await fetchPokeroleData(record.name);
            if (pokeroleData) {
              // Generate stats once — cached on record
              if (!record.pokeroleStats) {
                record.pokeroleStats = generateStats(pokeroleData, record.rank);
              }

              // Show stats
              renderStats(record.pokeroleStats, statsGrid);
              statsGrid.style.display = "grid";

              // Show HP row
              hpValue.textContent = record.pokeroleStats.currentHP;
              hpRow.style.display = "flex";

              // HP adjust handlers
              hpDec.onclick = () => {
                if (record.pokeroleStats.currentHP > 0) {
                  record.pokeroleStats.currentHP--;
                  hpValue.textContent = record.pokeroleStats.currentHP;
                }
              };
              hpInc.onclick = () => {
                if (record.pokeroleStats.currentHP < record.pokeroleStats.maxHP) {
                  record.pokeroleStats.currentHP++;
                  hpValue.textContent = record.pokeroleStats.currentHP;
                }
              };

              // Show moves (with spinner while loading)
              movesSpinner.style.display = "flex";
              movesContent.style.display = "none";
              movesContent.textContent = "";

              try {
                await renderMoves(pokeroleData, movesContent, record.rank, record.pokeroleStats);
                movesSpinner.style.display = "none";
                movesContent.style.display = "block";
              } catch (e) {
                movesSpinner.style.display = "none";
                movesContent.style.display = "none";
                console.error("Failed to load moves:", e);
              }

              movesDiv.style.display = "block";
            } else {
              statsGrid.style.display = "none";
              hpRow.style.display = "none";
              movesSpinner.style.display = "none";
              movesContent.style.display = "none";
            }
          } catch (e) {
            console.error("Failed to load Pokerole detail:", e);
            statsGrid.style.display = "none";
            hpRow.style.display = "none";
            movesSpinner.style.display = "none";
            movesContent.style.display = "none";
          }
        } else {
          // Collapse
          chevronBtn.classList.remove("expanded");
          card.classList.remove("details-open");
          detailPanel.style.display = "none";
        }
      });
    }

    els.results.append(fragment);
  });
}

function rollShiny(card, btn, record) {
  const d1 = Math.floor(Math.random() * 20) + 1;
  const d2 = Math.floor(Math.random() * 20) + 1;
  const total = d1 + d2;

  if (d1 === 20 && d2 === 20) {
    record.shiny = true;
    card.classList.add("shiny");

    // Add shiny tag if not already present
    if (!card.querySelector(".shiny-tag")) {
      const tag = document.createElement("span");
      tag.className = "shiny-tag";
      tag.textContent = "SHINY";
      card.querySelector(".chips").prepend(tag);
    }

    btn.textContent = "✨ Shiiiiiny!";
    btn.disabled = true;
    btn.classList.add("rolled");
  } else {
    btn.textContent = `Roll again (${d1} + ${d2} = ${total})`;
    btn.disabled = true;
    btn.classList.add("rolled");
    // Re-enable after a short delay so the user sees the result
    setTimeout(() => {
      btn.textContent = "Roll Shiny";
      btn.disabled = false;
      btn.classList.remove("rolled");
    }, 2000);
  }
}

async function generateEncounter() {
  const requestedCount = Number.parseInt(els.count.value, 10);
  const count = Number.isNaN(requestedCount) ? 1 : Math.min(Math.max(requestedCount, 1), 12);

  const seedText = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const filters = {
    nameList: els.nameFilter.value.trim()
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0),
    types: readCheckboxGroupValues("type"),
    generations: readCheckboxGroupValues("generation"),
    habitats: readCheckboxGroupValues("habitat"),
    rankMethods: readCheckboxGroupValues("rankMethod"),
    rankOrLower: els.rankOrLower.checked,
    legendary: els.legendaryFilter.value,
    includeMythical: els.includeMythical.checked,
    excludeForms: els.excludeForms.checked,
    allowDuplicates: els.allowDuplicates.checked
  };

  setStatus("Generating encounter... fetching matching records.");
  const rng = seededRandom(seedText);

  let baseCandidates;

  // Name filter: split by comma, match any of the names via substring (OR logic)
  if (filters.nameList.length > 0) {
    baseCandidates = state.allPokemon.filter((name) =>
      filters.nameList.some((partial) => name.includes(partial))
    );
  } else {
    // No name filter at all
    baseCandidates = [...state.allPokemon];
  }

  if (filters.excludeForms) {
    baseCandidates = baseCandidates.filter((name) => !name.includes("-"));
  }

  // Use Type endpoint first to shrink the search space before detail fetches.
  // OR logic: union all selected type member sets.
  const selectedTypes = filters.types.filter((t) => t !== "Any");
  if (selectedTypes.length > 0) {
    const typeMemberSets = await Promise.all(
      selectedTypes.map((t) => getTypeMembers(t))
    );
    // Union of all type member sets — a Pokemon matches if it's in ANY type set
    const unionSet = new Set();
    typeMemberSets.forEach((set) => {
      if (set) set.forEach((name) => unionSet.add(name));
    });
    baseCandidates = baseCandidates.filter((name) => unionSet.has(name));
  }

  state.lastPoolSize = baseCandidates.length;
  const orderedCandidates = shuffled(baseCandidates, rng);

  // Preserve locked Pokemon from the previous encounter
  const lockedRecords = state.lastResult.filter((r) => r.locked);
  const adjustedCount = Math.max(count - lockedRecords.length, 1);

  const found = [];
  const foundNames = new Set();
  const maxChecks = orderedCandidates.length;
  const batchSize = 50;

  let offset = 0;
  while (found.length < adjustedCount && offset < maxChecks) {
    const batch = orderedCandidates.slice(offset, Math.min(offset + batchSize, maxChecks));
    offset += batch.length;

    setStatus(`Searching... checked ${offset}/${maxChecks} Pokémon (${found.length} match so far).`);

    const results = await Promise.allSettled(
      batch.map((name) => getPokemonRecord(name))
    );

    for (const result of results) {
      if (found.length >= count) {
        break;
      }
      if (result.status === "fulfilled" && matchesFilters(result.value, filters)) {
        const pkmnName = result.value.name;
        // Skip duplicates unless allowDuplicates is checked
        if (!filters.allowDuplicates && foundNames.has(pkmnName)) {
          continue;
        }
        foundNames.add(pkmnName);
        found.push(createEncounterRecord(result.value));
      }
      // Skip rejected (failed fetch) records silently, same as before.
    }
  }

  state.lastResult = [...lockedRecords, ...found];
  render([...lockedRecords, ...found]);

  if (found.length < count) {
    const dupMsg = filters.allowDuplicates ? " (duplicates allowed)" : "";
    setStatus(
      `Found ${found.length}/${adjustedCount}${lockedRecords.length > 0 ? ` (+ ${lockedRecords.length} locked)` : ""}${dupMsg}. Filters may be too strict or require deeper scan.`
    );
  } else {
    setStatus(`Generated ${found.length}${lockedRecords.length > 0 ? ` (+ ${lockedRecords.length} locked)` : ""} Pokemon.`);
  }

  // On mobile, close the filter overlay after generating
  closeFilterOverlay();
}

function copyResults() {
  if (!state.lastResult.length) {
    setStatus("Nothing to copy yet. Generate first.");
    return;
  }

  const lines = state.lastResult.map((r) => {
    return `${toLabel(r.name)} (#${r.id}) | Rank ${r.rank} | Types: ${r.types.map(toLabel).join(", ")} | Habitat: ${toLabel(r.habitat)}`;
  });

  const payload = lines.join("\n");
  navigator.clipboard.writeText(payload)
    .then(() => setStatus("Encounter copied to clipboard."))
    .catch(() => setStatus("Clipboard copy failed. Copy manually from cards."));
}

function resetFilters() {
  els.count.value = 1;
  els.nameFilter.value = "";
  els.typeFilter.value = "Any";
  els.secondaryTypeFilter.value = "Any";
  Array.from(document.querySelectorAll('input[name="generation"]')).forEach((input) => {
    input.checked = input.value === "Any";
  });
  Array.from(document.querySelectorAll('input[name="habitat"]')).forEach((input) => {
    input.checked = input.value === "Any";
  });
  Array.from(document.querySelectorAll('input[name="rankMethod"]')).forEach((input) => {
    input.checked = input.value === "Any";
  });
  els.legendaryFilter.value = "no_legendaries";
  els.rankOrLower.checked = true;
  els.includeMythical.checked = false;
  els.excludeForms.checked = true;
  els.allowDuplicates.checked = true;
  state.lastResult = [];
  state.lastPoolSize = 0;
  els.resultMeta.textContent = "";
  els.results.textContent = "";
  setStatus("Filters reset.");
}

async function init() {
  setupSelects();

  els.generateBtn.addEventListener("click", generateEncounter);
  els.copyBtn.addEventListener("click", copyResults);
  els.resetBtn.addEventListener("click", resetFilters);

  // Filter overlay toggle (mobile modal + desktop static button)
  if (els.filterToggle && els.filterOverlay) {
    els.filterToggle.addEventListener("click", toggleFilterOverlay);
    els.filterToggle.classList.add("collapsed");

    // Close overlay when clicking the backdrop (outside modal-content)
    els.filterOverlay.addEventListener("click", (e) => {
      if (e.target === els.filterOverlay) {
        closeFilterOverlay();
      }
    });
  }

  // Auto-open filters when a user taps a filter input on mobile
  if (els.controlsPanel) {
    const filterInputs = els.controlsPanel.querySelectorAll("input, select");
    filterInputs.forEach((input) => {
      input.addEventListener("focus", () => {
        if (els.filterOverlay && !els.filterOverlay.classList.contains("active")) {
          openFilterOverlay();
        }
      });
    });
  }

  try {
    await loadBaseList();
  } catch {
    setStatus("Failed to load Pokemon list. Check internet access and retry.");
  }
}

function toggleFilterOverlay() {
  if (!els.filterOverlay) return;
  const isActive = els.filterOverlay.classList.toggle("active");
  els.filterToggle.classList.toggle("active", isActive);
  els.filterToggle.classList.toggle("collapsed", !isActive);
}

function openFilterOverlay() {
  if (!els.filterOverlay) return;
  els.filterOverlay.classList.add("active");
  els.filterToggle.classList.add("active");
  els.filterToggle.classList.remove("collapsed");
}

function closeFilterOverlay() {
  if (!els.filterOverlay) return;
  els.filterOverlay.classList.remove("active");
  els.filterToggle.classList.remove("active");
  els.filterToggle.classList.add("collapsed");
}

init();
