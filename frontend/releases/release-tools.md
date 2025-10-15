# ✈️ KLM-FLIGHT-APP — Release Tools

Deze map bevat alle hulpscripts die het beheer van versies,
releases en changelogs automatiseren voor de KLM-FLIGHT-APP.

---

## 📦 1. release-wizard.sh
**Gebruik:**
```bash
./release-wizard.sh v1.5
```

**Doet automatisch:**
1. Vraagt een korte beschrijving van de nieuwe versie  
2. Maakt een changelog aan in `releases/changelog/`  
3. Werkt `releases/release-notes.txt` bij  
4. Maakt een Git-commit en Git-tag aan (`v1.5`)  
5. Werkt automatisch de datum bij in `release-tools.md`  
6. Controleert op bestaande versies (veiligheidscheck)  

---

### 🧩 Veiligheidsmechanismen

Het script voorkomt per ongeluk overschrijven van bestaande releases.

**Wat wordt gecontroleerd:**
- Of er al een changelog-bestand bestaat, zoals  
  `releases/changelog/v1.5.md`
- Of er al een git-tag met die naam bestaat

Als één van deze al bestaat:
```
❌ Fout: changelog 'releases/changelog/v1.5.md' bestaat al!
→ Annuleren om te voorkomen dat deze versie overschreven wordt.
```

Je moet dan een nieuw versienummer kiezen (bijvoorbeeld `v1.6`).

---

### 📘 Na afloop pushen:
Na een succesvolle release:
```bash
git push && git push --tags
```

---

### 💡 Tip:
Je kunt `release-wizard.sh` altijd eerst droog-runnen met:
```bash
bash -x ./release-wizard.sh vX.X
```
Dat toont alle stappen zonder wijzigingen door te voeren.
---

## 🧾 2. create-changelog.sh
**Gebruik:**
```bash
./create-changelog.sh v1.4
```

**Functie:**  
Alleen een changelog aanmaken (zonder commit of tag).  
Handig als je de wijzigingen eerst wilt reviewen voordat je publiceert.

**Output:**  
`releases/changelog/v1.4.md`

---

## 🏷️ 3. create-release-tag.sh
**Gebruik:**
```bash
./create-release-tag.sh v1.4
```

**Functie:**  
Voegt een Git-commit en tag toe voor een bestaande changelog.  
Gebruik dit als je changelog al bestaat, maar de release nog niet officieel is aangemaakt.

---

## 🧹 4. undo-release.sh
**Gebruik:**
```bash
./undo-release.sh
```
of
```bash
./undo-release.sh v1.4
```

**Functie:**  
Draait de laatste release terug (of een specifieke versie)  
door de tag te verwijderen en de commit ongedaan te maken.

**Veiligheid:**
- ✅ Vraagt altijd om bevestiging (`ja/nee`)  
- ✅ Soft reset: je bestanden blijven behouden  
- ✅ Geeft instructies om ook de remote tag te wissen:
  ```bash
  git push origin :refs/tags/v1.4
  ```

---

## 📘 Tips voor gebruik
- Alle scripts uitvoeren vanuit de `frontend/` map  
- Zorg dat je git-repo geconfigureerd is met:
  ```bash
  git remote add origin <url-naar-je-repo>
  git push --set-upstream origin main
  ```
- Alle scripts uitvoerbaar maken met:
  ```bash
  chmod +x *.sh
  ```

---

## 💡 Best practices
- Gebruik **release-wizard.sh** voor reguliere updates  
- Gebruik **create-changelog.sh** als voorbereiding  
- Gebruik **undo-release.sh** alleen bij fouten  
- Houd **release-notes.txt** up-to-date als chronologisch overzicht  

---

## 📂 Bestandenstructuur
```
releases/
│
├── changelog/
│   ├── v1.0.md
│   ├── v1.3.md
│   └── v1.4.md
│
├── release-notes.txt
├── release-tools.md     ← (deze handleiding)
│
├── create-changelog.sh
├── create-release-tag.sh
├── release-wizard.sh
└── undo-release.sh
```

---

✈️ **KLM-FLIGHT-APP — interne documentatie**  
Laatste update: _2025-10-14_
