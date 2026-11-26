#!/usr/bin/env bash
set -euo pipefail
# Materializa exatamente os 12 arquivos do ZIP de handoff na feature branch, SEM git add/commit/push.
if [[ "$#" -ne 1 ]]; then echo "Uso: bash scripts/import-handoff-knowledge.sh /caminho/handoff.zip" >&2; exit 2; fi
archive="$1"
[[ -r "$archive" ]] || { echo "ZIP inacessível: $archive" >&2; exit 1; }
for tool in git unzip sha256sum; do command -v "$tool" >/dev/null || { echo "Ferramenta ausente: $tool" >&2; exit 1; }; done
root="$(git rev-parse --show-toplevel)"
[[ "$(git branch --show-current)" == "feat/production-foundation" ]] || { echo "Execução permitida apenas em feat/production-foundation" >&2; exit 1; }
expected="730fba546e3d834cadcf29849f81b3a7cba70c0af9967dddb4e8b79f9cc6fe86"
actual="$(sha256sum "$archive" | cut -d' ' -f1)"
[[ "$actual" == "$expected" ]] || { echo "SHA-256 do ZIP diverge do handoff recebido; abortando." >&2; exit 1; }
prefix="CobraFlux-Knowledge-Handoff-2026-11-21"
target="$root/docs/ai-memory/originais"
mkdir -p "$target"
files=(00-LEIA-PRIMEIRO.md 01-HANDOFF-MESTRE.md 02-MATRIZ-DE-REQUISITOS.md
03-REGISTRO-DE-DECISOES.md 04-BACKLOG-CONSOLIDADO.md
05-ARQUITETURA-E-ESTADO-TECNICO.md 06-ROADMAP-E-MARCOS.md
07-EVIDENCIAS-E-LACUNAS.md 08-PROTOCOLO-DE-RETOMADA.md
09-PROMPT-AUTONOMO-DE-RETOMADA.md HANDOFF-COMPLETO.md MANIFESTO-DE-INTEGRIDADE.md)
for file in "${files[@]}"; do
  unzip -p "$archive" "$prefix/$file" > "$target/$file"
done
echo "Arquivos originais extraídos em $target; confira hashes e segredos antes de commitar."
cd "$target"
printf '%s\n' 'faf2c4cc8cc497745576e22a4303b2e850a417e792a3a3790aa19739179abe26  00-LEIA-PRIMEIRO.md' '991f4817ff8c2518316cd7467b7e8e1a0a6dc98ef0786eade01d024891b6b6c1  01-HANDOFF-MESTRE.md' '937bc586b9f42d6271a65c0b9fd5d1fefcc08ebc802c0d3fc77b7aa8f422e06e  02-MATRIZ-DE-REQUISITOS.md' 'acf3ef493d547edcc1d6e22ccced50744c30342cd9c4e802121862c60d5f129b  03-REGISTRO-DE-DECISOES.md' 'f0b041b031899c17cca401aaa5f00471f6cda1cc525708fe7d8a247aee577cbf  04-BACKLOG-CONSOLIDADO.md' 'e867d2b80e6d5425487b9ed8f22fb8eff3f9c230c8af928bdd798067e1f93c8c  05-ARQUITETURA-E-ESTADO-TECNICO.md' 'd69330ee56a937cf49ceac5623296442046776db7fe7ff9927ff7a93fb495555  06-ROADMAP-E-MARCOS.md' '9ce671cefd746794c50ddecc3e95f8b8018ccd0df180fe57cd1cba86cca209f7  07-EVIDENCIAS-E-LACUNAS.md' '709643b104ad37a3aea56a6a434ce02e90d0e75b643a26e99442939c9041a0a0  08-PROTOCOLO-DE-RETOMADA.md' 'dcca9f5d702e632350002f81b8f61464af49f2eead1ab655f4990ef318476d9a  09-PROMPT-AUTONOMO-DE-RETOMADA.md' '87fe58b2ff532d81e5c9c0efff18110e08c45b516f77efba95859f363e1ec7b7  HANDOFF-COMPLETO.md' '89d4b06156f2d7ecb8924905b2120b6ad198d6a45076501917154310f49f5ef7  MANIFESTO-DE-INTEGRIDADE.md' | sha256sum -c -
echo "Verifique com: git status --short && git diff --check"
echo "Nenhum commit, push, merge ou deploy realizado pelo script."
