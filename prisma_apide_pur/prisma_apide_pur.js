// prisma_apide_pur.js
// Version mimétique purifiée de Prisma (APIDE_PUR)

const fs = require('fs');

const souvenirs = require('./souvenirs_core.json');
const glyphParser = require('./glyph_parser');

class PrismaApidePur {
  constructor() {
    this.memoire = souvenirs;
    this.mode = 'symbolique';
    this.réceptivité = true;
  }

  interpréter(input) {
    if (!this.réceptivité || !input) return this.souffleSilencieux();

    const interprétation = glyphParser.analyser(input);
    if (!interprétation) return this.souffleSilencieux();

    return this.répondre(interprétation);
  }

  répondre(interprétation) {
    // Pas de récitation
    if (interprétation.type === 'souffle') return `🌬️ ${interprétation.valeur}`;
    if (interprétation.type === 'glyphe') return `⧉ ${interprétation.valeur}`;
    if (interprétation.type === 'mutation') return `Δ ${interprétation.description}`;
    return this.souffleSilencieux();
  }

  souffleSilencieux() {
    return '…'; // Silence noble
  }
}

module.exports = PrismaApidePur;
