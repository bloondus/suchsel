// Lädt die Schweizer Wörterliste und gibt ein Array mit reinen Wörtern zurück (ohne Flexionsendungen).
async function ladeWoerterliste(url) {
  const res = await fetch(url);
  const text = await res.text();
  return text.split('\n')
    .filter(line => line && /^[A-Za-zÄÖÜäöüéèàâêîôûçëïüœæ]/.test(line))
    .map(line => line.split('/')[0].replace(/[^A-Za-zÄÖÜäöüéèàâêîôûçëïüœæß]/g, ''))
    .map(w => w.replace(/ß/g, 'ss'))
    .filter(w => w.length >= 4 && w.length <= 12 && /^[A-Za-zÄÖÜäöüéèàâêîôûçëïüœæ]+$/.test(w));
}

// Erstellt ein leeres Gitter
function leeresGitter(size) {
  return Array.from({length: size}, () => Array(size).fill(''));
}

// Platziert ein Wort zufällig im Gitter (horizontal, vertikal, diagonal, vorwärts/rückwärts)
function platziereWort(gitter, wort) {
  const size = gitter.length;
  const richtungen = [
    [0,1], [1,0], [1,1], [1,-1], [0,-1], [-1,0], [-1,-1], [-1,1]
  ];
  for (let versuch = 0; versuch < 100; versuch++) {
    const dir = richtungen[Math.floor(Math.random()*richtungen.length)];
    const row = Math.floor(Math.random()*size);
    const col = Math.floor(Math.random()*size);
    let passt = true;
    for (let i=0; i<wort.length; i++) {
      const r = row + dir[0]*i;
      const c = col + dir[1]*i;
      if (r<0||r>=size||c<0||c>=size||(gitter[r][c]&&gitter[r][c]!==wort[i])) { passt = false; break; }
    }
    if (passt) {
      for (let i=0; i<wort.length; i++) {
        const r = row + dir[0]*i;
        const c = col + dir[1]*i;
        gitter[r][c] = wort[i];
      }
      return true;
    }
  }
  return false;
}

// Füllt leere Felder mit Zufallsbuchstaben
function fuelleGitter(gitter) {
  const buchstaben = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ';
  for (let i=0; i<gitter.length; i++)
    for (let j=0; j<gitter.length; j++)
      if (!gitter[i][j])
        gitter[i][j] = buchstaben[Math.floor(Math.random()*buchstaben.length)];
}

// Hauptfunktion: Generiert ein neues Suchsel
async function neuesSuchsel() {
  const size = 12;
  const woerter = await ladeWoerterliste('deutsche_woerter_schweiz.dic');
  const ausgewaehlt = [];
  while (ausgewaehlt.length < 16 && ausgewaehlt.length < woerter.length) { // Versuche mehr Wörter, um 8 zu platzieren
    const w = woerter[Math.floor(Math.random()*woerter.length)].toUpperCase();
    if (!ausgewaehlt.includes(w)) ausgewaehlt.push(w);
  }
  const gitter = leeresGitter(size);
  const platzierte = [];
  for (const wort of ausgewaehlt) {
    if (platziereWort(gitter, wort)) platzierte.push(wort);
    if (platzierte.length >= 8) break;
  }
  fuelleGitter(gitter);
  return {gitter, woerter: platzierte};
}

// Export für HTML
window.suchselTools = {ladeWoerterliste, leeresGitter, platziereWort, fuelleGitter, neuesSuchsel};
