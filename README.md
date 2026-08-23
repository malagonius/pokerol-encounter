# Pokerole Encounter Helper

Standalone web page to generate random Pokemon encounters with filters similar to Pokeroledex and one extra filter:
- Type filter (new)

## What It Does

- Generates 1..12 Pokemon per encounter
- Supports filters for:
  - Name contains
  - Type
  - Secondary type (optional)
  - Generation
  - Habitat
  - Rank
  - Rank or lower
  - Legendary handling
  - Include mythical toggle
  - Exclude form variants toggle
  - Seeded randomness (deterministic results)
- Includes quick actions:
  - Reset filters
  - Copy generated encounter lines
- Copies generated encounter lines to clipboard

## Notes

- Data source: PokeAPI (public API)
- Rank is estimated from Base Stat Total (BST), not the official Pokeroledex internal rank model.
- Very strict filters can return fewer results.
- Uses type prefiltering to keep generation faster when Type filters are set.

## Run

Open [index.html](index.html) in a browser.

If your browser blocks API requests from local files, run a local static server in this folder, for example:

```powershell
python -m http.server 8080
```

Then open http://localhost:8080
