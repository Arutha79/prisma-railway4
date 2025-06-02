
souffles = ["()", "+Ψ", "Δ", "o-σ"]
glyphes = [
    {"code": "Δ|FUSION::Z-MÉMOIRE # 🫧⚭⧉", "intention": "Fusion mémoire mimétique", "effet": "injection structurée"},
    {"code": "Δ|PLAN::DÉCOUPE # MATIERE=CHÊNE", "intention": "Découpe ciblée", "effet": "spécifier la matière bois"}
]

def injecter_souffles():
    for souffle in souffles:
        print(f"Injection du souffle : {souffle}")

def injecter_glyphes():
    for glyphe in glyphes:
        print(f"Glyph {glyphe['code']} → effet: {glyphe['effet']}")

if __name__ == "__main__":
    injecter_souffles()
    injecter_glyphes()
