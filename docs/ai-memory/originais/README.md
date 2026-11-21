# Fontes originais do handoff — importação controlada

Os arquivos originais **não foram copiados automaticamente para este diretório**: o arquivo ZIP foi recebido como anexo de conversa, e a conexão atual do GitHub não o transferiu diretamente. A documentação resumida está em docs/ai-memory; consulte [07-FONTES-E-INTEGRIDADE](../07-FONTES-E-INTEGRIDADE.md) para os 12 documentos, hashes e escopo da auditoria.

Para preservar os **bytes originais**, execute **scripts/import-handoff-knowledge.sh /caminho/CobraFlux-Knowledge-Handoff-2026-11-21.zip** em clone autorizado e na branch **feat/production-foundation**, examine o diff/possíveis dados privados, valide os SHA-256 e realize commit/push **somente após revisão**. Isso não mexe na main e não faz deploy.

Depois de importar, atualizar 07-FONTES-E-INTEGRIDADE.md e estado.json (sourceArchiveUploadedToRepository=true **somente depois** de verificar o SHA correspondente no GitHub).
