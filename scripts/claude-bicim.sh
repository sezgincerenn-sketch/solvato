#!/usr/bin/env bash
# Claude Code "PostToolUse" kancası: Claude src/ altında bir dosyayı düzenleyince Prettier ile biçimlendirir.
f=$(jq -r '.tool_input.file_path // empty')
case "$f" in
  */src/*.ts | */src/*.tsx | */src/*.css)
    [ -x "${CLAUDE_PROJECT_DIR:-.}/node_modules/.bin/prettier" ] && "${CLAUDE_PROJECT_DIR:-.}/node_modules/.bin/prettier" --write --log-level silent "$f"
    ;;
esac
exit 0
