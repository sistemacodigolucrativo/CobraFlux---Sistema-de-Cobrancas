# Entrega documental — sistema de memória persistente do CobraFlux

**Data:** 21/11/2026. **Origem:** pedido explícito de criar pasta de memória remota, rastrear o fluxo e registrar cada fase e incremento para outras IAs.
**Escopo:** documentos e rastreabilidade, não alteração de regra financeira nem release.

## O que foi registrado
- AGENTS.md como porta de entrada para agentes de desenvolvimento.
- docs/ai-memory/00–09, estado.json machine-readable, fases 00–09, diário cronológico, backlog/ADRs, evidências e modelo de registro.
- Inventário do ZIP de handoff com nomes, bytes, SHA-256 e limitações de acesso.
- Protocolo que exige revalidar HEAD e CI; histórico de fase/entrega com escopo e aceite.
- **12/12 documentos originais do handoff foram transferidos ao GitHub e verificados por Git blob hash**; script de importação guardado como utilitário opcional.
- O histórico anterior permanece preservado via Git. Documentos podem mudar HEAD sem mudar último SHA de código validado.

## Advertências de integridade
- O repositório contém **síntese e todos os 12 Markdown originais com hashes idênticos**; o ZIP binário compactado não foi versionado.
- A captura automática de futuras conversas não existe: a memória persiste quando **novas informações são registradas em commits**.
- A atualização de main, deploy e credenciais não foram autorizadas.
- Verificar o workflow de integridade da memória e os links no GitHub após o commit final.

**Status:** documentação publicada na branch de feature; homologação/CI documental depende do commit final e deve ser confirmada no GitHub.
