# Relatório de testes de integração

Escopo: API03, API04, API05, RF08 e RF09, conforme `docs/especificacao.md`. A tabela de casos do prompt veio como marcador (`[COLE AQUI SUA TABELA DE CASOS]`); os casos abaixo foram derivados dos contratos documentados no repositório.

| ID | Caso | Estado inicial | Requisição | Resposta esperada | Efeito no banco | Resultado |
|---|---|---|---|---|---|---|
| API03-01 | Excluir categoria vazia | Categoria existente sem tarefas | `DELETE /api/categories/:id` | 200, `success: true` | Categoria removida | Não executado: autenticação PostgreSQL P1000 |
| API03-02 | Excluir categoria com tarefa | Categoria e tarefa associada existentes | `DELETE /api/categories/:id` | 400, `success: false` | Categoria e tarefa mantidas | Não executado: autenticação PostgreSQL P1000 |
| API03-03 | Excluir categoria inexistente | Nenhuma categoria com o ID | `DELETE /api/categories/id-inexistente` | 404, `success: false` | Banco permanece sem categorias | Não executado: autenticação PostgreSQL P1000 |
| API04-01 | Criar categoria com nome inédito | Banco sem categorias | `POST /api/categories` com `Faculdade` | 201, `success: true` e categoria na resposta | Categoria gravada | Não executado: autenticação PostgreSQL P1000 |
| API04-02 | Rejeitar duplicata após normalização | Categoria ` trabalho ` existente | `POST /api/categories` com `Trabalho` | 409, `success: false` | Nenhuma categoria adicional | Não executado: autenticação PostgreSQL P1000; teste preparado como `it.fails` até confirmação |
| API05-01 | Transição permitida | Tarefa em `PENDING` | `PUT /api/tasks/:id` com `IN_PROGRESS` | 200 e status `IN_PROGRESS` na resposta | Status atualizado | Não executado: autenticação PostgreSQL P1000 |
| API05-02 | Transição proibida | Tarefa em `COMPLETED` | `PUT /api/tasks/:id` com `PENDING` | 400, `success: false` | Status permanece `COMPLETED` | Não executado: autenticação PostgreSQL P1000; teste preparado como `it.fails` até confirmação |
| API05-03 | Atualizar tarefa inexistente | Nenhuma tarefa com o ID | `PUT /api/tasks/id-inexistente` com `IN_PROGRESS` | 404, `success: false` | Nenhum registro criado/alterado | Não executado: autenticação PostgreSQL P1000 |
| RF08-01 | Criar usuário e atualizar lista | Lista vazia; POST retorna sucesso | Preencher Nome/Email e clicar `Criar` | Envio via POST; formulário fecha e lista exibe usuário | MSW registra `{ name, email }`; sem banco real no frontend | Aprovado |
| RF09-01 | Tratar email duplicado | Lista vazia; POST retorna 409 | Preencher formulário e clicar `Criar` | Mensagem `Email já cadastrado`; formulário e valores preservados | MSW responde 409; sem banco real no frontend | Falha esperada (`it.fails`): componente mostra `Erro ao salvar usuário` |

## Defeitos encontrados (teste, comportamento esperado vs. obtido)

- **RF09-01:** esperado `Email já cadastrado` e formulário preservado após HTTP 409; comportamento obtido: mensagem genérica `Erro ao salvar usuário`. O teste de integração usa `it.fails` para manter o contrato como oráculo.
- **API04-02:** a implementação observada não normaliza o nome antes de criar; a especificação exige conflito entre ` trabalho ` e `Trabalho`. O caso está preparado com `it.fails`, mas a execução da suíte backend foi impedida antes dos testes pelo erro P1000. Portanto, divergência provável pela inspeção, ainda não confirmada por execução integrada.
- **API05-02:** a implementação observada atualiza diretamente o status sem validar a RN01; a especificação exige 400 e preservação de `COMPLETED`. O caso está preparado com `it.fails`, mas a execução da suíte backend foi impedida antes dos testes pelo erro P1000. Portanto, divergência provável pela inspeção, ainda não confirmada por execução integrada.

## Problemas e ajustes feitos durante a geração

- A tabela de casos mencionada no prompt não foi preenchida. Os casos foram derivados somente das regras API03–API05 e RF08–RF09 de `docs/especificacao.md`.
- `docker compose up -d postgres` iniciou o container, mas `npm run test:integration` no backend falhou durante o `prisma db push --force-reset --skip-generate`: `P1000: Authentication failed` para o usuário `postgres` em `teste_software_test_db`. Nenhum teste backend foi executado; não foi feita alteração no container, credenciais, volume ou código-base.
- `npm run test:integration` no frontend passou: 2 arquivos, 2 testes aprovados e 1 falha esperada (RF09).
- Nenhum arquivo de `src/`, configuração, dependência ou schema foi alterado. Nenhuma sabotagem foi aplicada.

## Sugestões de sabotagem manual

- `backend/src/controllers/categoryController.ts`, linha 89: normalizar incorretamente ou remover a verificação de exclusividade para que API04-02 deixe criar o nome duplicado após normalização.
- `backend/src/controllers/taskController.ts`, linha 178: remover a validação de transição de status; API05-02 deve detectar a aceitação de `COMPLETED` para `PENDING` quando o backend puder ser executado.
- `frontend/src/components/Users.tsx`, linha 77: alterar a mensagem de erro para uma mensagem incorreta; RF09 deve detectar a ausência de `Email já cadastrado`.
