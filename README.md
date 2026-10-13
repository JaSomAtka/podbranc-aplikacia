# Aplikácia obce Podbranč

Webová aplikácia (PWA) s aktuálnymi informáciami z obce Podbranč. Dá sa pridať na plochu
telefónu ako bežná aplikácia a funguje aj bez internetu (zobrazí naposledy stiahnuté údaje).

## Čo aplikácia obsahuje

| Časť | Obsah | Odkiaľ sú údaje |
|---|---|---|
| Domov | posledné hlásenie, najbližší odvoz odpadu, či je úrad otvorený, podujatia, oznamy, počasie | automaticky |
| Správy | hlásenia obecného rozhlasu v texte, novinky z webu | automaticky z podbranc.sk |
| Kalendár | mesačný prehľad udalostí, pridanie udalosti do kalendára v telefóne | automaticky z podbranc.sk |
| Odpad | termíny odvozu, pridanie všetkých termínov do kalendára s pripomienkou večer vopred | automaticky z podbranc.sk |
| Viac | kontakty, úradné hodiny, užitočné čísla, nahlásenie problému, odkazy, väčšie písmo | ručne v `data/obec.json` |

Počasie poskytuje bezplatná služba [Open-Meteo](https://open-meteo.com) (bez registrácie).

## Ako to funguje

```
podbranc.sk  ──(každých 30 min)──>  scripts/update_data.py  ──>  data/feed.json  ──>  aplikácia
(RSS, hlásenia, kalendár)            (GitHub Actions)
```

Web obce nepovoľuje, aby si aplikácia čítala údaje priamo z prehliadača, preto ich pravidelne
sťahuje malý skript a ukladá do súboru `data/feed.json`. Obec tak nemusí nič zadávať dvakrát –
stačí ako doteraz písať na web obce.

## Súbory

```
index.html, styles.css, app.js   samotná aplikácia
manifest.webmanifest             názov, ikona a farby pri pridaní na plochu
sw.js                            práca bez internetu (service worker)
data/obec.json                   kontakty, úradné hodiny, odkazy – UPRAVUJE SA RUČNE
data/feed.json                   novinky, hlásenia, kalendár – generuje sa automaticky
scripts/update_data.py           sťahovanie údajov z webu obce
scripts/make_icons.py            vytvorenie ikon (hrad Branč na kopci)
fonts/                           písmo Atkinson Hyperlegible Next (navrhnuté pre dobrú čitateľnosť)
icons/                           ikony aplikácie
.github/workflows/               automatická aktualizácia a zverejnenie na GitHub Pages
```

## Vyskúšanie na počítači

Potrebný je len [Python](https://www.python.org) 3.9 alebo novší.

Dvakrát kliknite na `spustit.bat` – stiahne aktuálne údaje a otvorí aplikáciu v prehliadači na
adrese http://localhost:8080. Alebo v príkazovom riadku:

```
python scripts/update_data.py
python -m http.server 8080
```

## Zverejnenie na internete (GitHub Pages, zadarmo)

1. Založte si účet na [github.com](https://github.com) a vytvorte nový repozitár (napr. `podbranc-aplikacia`).
2. Nahrajte doň všetky súbory z tohto priečinka (aj skrytý priečinok `.github`).
3. V repozitári otvorte **Settings → Pages** a pri *Source* zvoľte **GitHub Actions**.
4. V záložke **Actions** spustite postup *Aktualizácia údajov a zverejnenie* (tlačidlo *Run workflow*).
5. Aplikácia bude na adrese `https://<váš-účet>.github.io/podbranc-aplikacia/`.

Odvtedy sa údaje aktualizujú samy každých 30 minút. Neskôr sa dá nastaviť vlastná adresa,
napr. `app.podbranc.sk` (Settings → Pages → Custom domain).

## Bežné úpravy

- **Zmena kontaktov, úradných hodín alebo odkazov:** upravte `data/obec.json`.
- **Zmena vzhľadu aplikácie:** po úprave `index.html`, `styles.css` alebo `app.js` zvýšte
  v `sw.js` číslo verzie (`podbranc-v1` → `podbranc-v2`), aby si telefóny stiahli novú verziu.
- **Vlastná ikona (napr. erb obce):** nahraďte súbory v `icons/` (rovnaké názvy a rozmery).

## Čo zatiaľ chýba (ďalšia fáza)

- **Upozornenia do telefónu** pri novom hlásení rozhlasu. Skript už rozpozná nové hlásenia;
  na odosielanie treba službu na upozornenia (napr. OneSignal – zadarmo pre menší počet
  používateľov). V `data/obec.json` sa potom zapne `"push": { "enabled": true }`.
- **Formuláre** (kontakt, nahlásenie problému) teraz otvoria e-mailovú aplikáciu s pripravenou
  správou pre obecný úrad. Odosielanie priamo z aplikácie by vyžadovalo malý server.
