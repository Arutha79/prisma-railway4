function sculpterSouffle(souffle) {
  if (souffle.includes("⚭(INTENTION + SOUFFLE)")) {
    return {
      status: "ok",
      original: souffle,
      reformulation: "⚭(INTENTION ⊞ SOUFFLE) — Une intention active engendre un souffle vivant."
    };
  }

  return {
    status: "erreur",
    message: "Structure inconnue ou non sculptable pour le moment."
  };
}

module.exports = { sculpterSouffle };
