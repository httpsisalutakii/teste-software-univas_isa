# Relatório — Testes unitários com IA generativa

**Aluno(s):**
**Ferramenta de IA utilizada:** (Claude Code / Codex / GitHub Copilot)
**Unidade testada:** (ex.: `backend/src/utils/taskRules.ts` — RN01)

## 1. Tabela de casos (elaborada antes de usar a IA)

| # | Entrada | Resultado esperado | Técnica (partição, valor-limite, inválido) | Regra |
|---|---------|--------------------|--------------------------------------------|-------|
| 1 |         |                    |                                            |       |

## 2. Prompt utilizado

```
(cole aqui o prompt enviado ao agente)
```

## 3. Revisão do teste gerado

| Problema encontrado no teste gerado | Ajuste solicitado ou realizado |
|-------------------------------------|--------------------------------|
|                                     |                                |

## 4. Resultados

- Testes criados: ___ | aprovados: ___ | reprovados: ___
- Cobertura de linhas da unidade: ___ %
- Score de mutação (backend) ou resultado da sabotagem manual (frontend): ___

## 5. Defeitos encontrados (divergências entre especificação e código)

| Regra | Comportamento especificado | Comportamento observado | Teste que evidencia |
|-------|----------------------------|-------------------------|---------------------|
|       |                            |                         |                     |

### RN01 — Transição de status (canTransition)

| ID | Status atual (from) | Status desejado (to) | Resultado esperado |
|---|---|---|---|
| RN01-01 | PENDING | PENDING | |
| RN01-02 | PENDING | IN_PROGRESS | |
| RN01-03 | PENDING | COMPLETED | |
| RN01-04 | PENDING | CANCELLED | |
| RN01-05 | IN_PROGRESS | PENDING | |
| RN01-06 | IN_PROGRESS | IN_PROGRESS | |
| RN01-07 | IN_PROGRESS | COMPLETED | |
| RN01-08 | IN_PROGRESS | CANCELLED | |
| RN01-09 | COMPLETED | PENDING | |
| RN01-10 | COMPLETED | IN_PROGRESS | |
| RN01-11 | COMPLETED | COMPLETED | |
| RN01-12 | COMPLETED | CANCELLED | |
| RN01-13 | CANCELLED | PENDING | |
| RN01-14 | CANCELLED | IN_PROGRESS | |
| RN01-15 | CANCELLED | COMPLETED | |
| RN01-16 | CANCELLED | CANCELLED | |


### RN03 — Normalização de nomes (normalizeName)

| ID | Entrada | Resultado esperado |
|---|---|---|
| RN03-01 | "  Maria  " | |
| RN03-02 | "João   da   Silva" | |
| RN03-03 | "Ana\tMaria" | |
| RN03-04 | "Ana\nMaria" | |
| RN03-05 | "MARIA SILVA" | |
| RN03-06 | "  TRABALHO   da\tFACULDADE  " | |

### Avaliação dos testes de mutação — Stryker

Foi executado o comando `npm run test:mutation` para avaliar a qualidade dos testes unitários.

**Resultado geral:**
- Total de mutantes: 47
- Mutantes mortos: 41
- Mutantes sobreviventes: 6
- Mutantes com timeout: 0
- Mutation score: 87,23%

**Resultados por regra:**
- RN03 (`normalizeName`): 100% de mutation score.
- RN01 (`canTransition`): 83,78% de mutation score.

Os seis mutantes sobreviventes foram identificados na condição responsável por bloquear transições a partir dos status `COMPLETED` e `CANCELLED`, na função `canTransition`.

Esses mutantes serão analisados para verificar se representam comportamentos não cobertos pelos testes ou alterações equivalentes, que não modificam o resultado observável da função.

**Análise dos mutantes sobreviventes da RN01**

Os seis mutantes sobreviventes foram encontrados na primeira condição da função `canTransition`, responsável por bloquear transições quando o status atual é `COMPLETED` ou `CANCELLED`.

A análise da implementação também identificou um defeito: a transição de `PENDING` para `CANCELLED` é permitida pela especificação, mas a função retorna `false`.

Esse comportamento foi registrado no teste RN01-04 utilizando `it.fails`, preservando o resultado esperado definido pela regra de negócio.

Os mutantes sobreviventes devem ser considerados individualmente, pois podem representar alterações não detectadas pelos testes ou mutantes equivalentes. Não foram realizadas alterações na implementação original.

- Testes criados: **25 | aprovados: 24 | reprovados: 1 falha esperada**
- Cobertura geral de linhas do backend: **2,41%**
- Score de mutação do backend: **87,23%** (41 mutantes mortos de 47).

### Avaliação – Sabotagem Controlada (RF04)

Foi realizada uma alteração proposital no componente Users.tsx, substituindo o texto do botão "Criar" por "Salvar".

**Resultado:** o teste unitário falhou, pois não encontrou o botão com o nome esperado "Criar", identificando corretamente a alteração realizada.

**Conclusão:** a sabotagem foi detectada com sucesso, demonstrando que o teste RF04 verifica corretamente o texto e a presença dos elementos esperados no formulário.

### Revisão do teste – RF04

O teste foi revisado seguindo o padrão AAA (Arrange, Act e Assert). Foi verificado se a preparação do cenário, a interação do usuário e as validações estavam corretas.

**Pontos verificados:**
- Simulação da resposta da API.
- Abertura do formulário de cadastro.
- Verificação dos campos Nome e Email.
- Verificação do botão Criar.
- Utilização de seletores acessíveis.

**Resultado da revisão:** Não foram identificados problemas que exigissem ajustes no teste. Após a restauração da sabotagem, o teste foi executado novamente e apresentou aprovação.