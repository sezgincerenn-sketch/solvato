#!/usr/bin/env bash
# Claude Code "Stop" kancası (.claude/settings.json): Claude işi bitirmeden önce çalışır.
# src/ altında kaydedilmemiş değişiklik varsa `npm run check` (tür + biçim) koşar; hata varsa çıkış 2 ile Claude'u
# düzeltmeye geri gönderir. Değişiklik yoksa (soru-cevap) hiçbir şey yapmaz.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -d node_modules ] || exit 0
if git diff --quiet HEAD -- src && [ -z "$(git ls-files --others --exclude-standard src)" ]; then
  exit 0
fi
if ! out=$(npm run -s check 2>&1); then
  echo "npm run check geçmedi, bitirmeden önce düzelt:" >&2
  echo "$out" | tail -40 >&2
  exit 2
fi
exit 0
