# Relatório de Mentoria e Pagamentos — Bolsa360

**Quem escreveu:** Adia (backend e base de dados)
**Última atualização:** outubro de 2026
**Âmbito:** modelo de dados + módulo de mentoria e pagamentos (P2)

Este é o relatório único da equipa para estas áreas. Escrevi-o na primeira pessoa porque
sou eu que estou a mexer na base de dados e no seed, e porque quero explicar não só *o que*
mudou mas *porquê*, para ninguém ficar a adivinhar. Se algo aqui não bater com o que encontras
no código, fala comigo antes de mexer.

---

## 1. O que já está feito

Tenho a base de dados montada e a correr. Contei 24 tabelas no schema `public`: 23 de domínio
mais a `_prisma_migrations`, que é a tabela de controlo do próprio Prisma e que nunca se toca.

As 23 tabelas de domínio são as dos utilizadores e perfis, dos catálogos (tipos de
oportunidade, níveis de ensino, categorias de estudo), das oportunidades e de tudo o que
gravita à volta delas (categorias, regras de elegibilidade, elegibilidade por país, documentos
exigidos, verificações), dos favoritos, das candidaturas e do respetivo histórico, dos registos
de auditoria, e depois todo o bloco novo: mentores, serviços de mentoria, agendamentos,
pagamentos, eventos de pagamento, acessos a serviços, conversas de IA e mensagens de IA.

As migrações estão aplicadas e são cinco, por ordem: `init_mvp`, `mentoria`,
`mentoria_pagamentos`, `mentoria_agendamento_acessos` e `regras_integridade`. Tens de saber uma
coisa sobre estas migrações: a `mentoria_pagamentos` está vazia. Ela nasceu antes de o schema
estar atualizado e ficou sem SQL. É inofensiva, já está no GitHub e por isso não se apaga nem
se edita. Quem estranhar, o motivo é este.

Deixei também o seeder completo em `backend/prisma/seed.ts`, com dados de demonstração
marcados como fictícios. Corri-o duas vezes seguidas e as contagens por tabela não mudaram,
ou seja, é idempotente e podes executá-lo à vontade.

Validei tudo: o `prisma validate` passa, o `tsc --noEmit` não dá erros, o `prisma migrate status`
diz que a base está atualizada, e o seed cria os quatro estados de prazo que queria testar
(futuro, aberto, expirado e sem prazo confirmado).

## 2. Como pôr a tua máquina a par

Isto é o que cada um tem de fazer depois de fazer `git pull`, dentro da pasta `backend/`:

Primeiro instalas as dependências com `npm install`. Agora há uma nova, o `argon2`, que é um
módulo nativo, por isso se der erro de compilação avisa-me.

Depois crias o teu ficheiro de ambiente a partir do modelo: copia `backend/.env.example` para
`backend/.env` e preenche os valores. O `.env` nunca vai para o Git, é só teu.

Depois garantes que existe uma base de dados local chamada `bolsa360_dev` no teu PostgreSQL e
que o `DATABASE_URL` aponta para ela. Se a base ainda não existir, cria-a vazia; não precisas de
criar tabelas à mão.

A seguir corres `npx prisma migrate dev`. Isto aplica as cinco migrações, incluindo o SQL manual
da restrição anti-sobreposição de horários, e ainda o índice parcial das candidaturas.

Por fim corres `npm run db:seed` para teres os dados de demonstração. A partir daí tens
`npm run db:studio` se quiseres ver os dados numa interface, `npm run db:migrate` para novas
migrações e `npm run db:reset` para apagar tudo e voltar a começar do zero.

As palavras-passe das contas de demonstração não estão no código nem neste relatório. Definem-se
no teu `.env`, nas variáveis `SEED_ADMIN_PASSWORD` e `SEED_DEMO_PASSWORD` (o `.env.example` mostra
onde). Cada pessoa usa as suas. Estas contas servem **só para a base de dados local**: nunca se
corre o seed contra uma base partilhada ou online.

## 3. Dados de demonstração: o que mudei e porquê

O seed antigo tinha um problema sério: usava organizações reais, com valores, requisitos e links
que eu tinha inventado, e marcava tudo como confirmado e publicado. Isso viola a RN-03 e a RN-17
e, pior do que isso, engana quem vê a demonstração. A confiança é a proposta toda da plataforma,
por isso não podia ficar assim.

Reescrevi tudo do zero. Todas as oportunidades começam com `[DEMO]` no título e pertencem a
entidades fictícias do tipo "Fundação Exemplo A" e "Instituto Exemplo B". Os links apontam para
`example.org`, que é um domínio reservado precisamente para exemplos, e todos os textos de origem
das regras começam por "Demonstração: ". Tirei também a regra que listava nacionalidades
africanas lusófonas como se fosse um critério real.

Outra decisão importante: as datas passaram a ser relativas ao dia em que corres o seed. Uso um
auxiliar que soma dias à data de hoje. Se tivesse deixado datas fixas, dentro de dois meses a
demonstração mostrava tudo expirado.

Ficaram seis oportunidades e escolhi-as para cobrirem os casos que interessam. Há uma bolsa
universitária integral aberta, com média mínima como regra confirmada. Há um curso de língua com
prazo a cinco dias, para se ver o aviso de prazo próximo. Há um intercâmbio que ainda não abriu,
que serve para testar o estado de prazo futuro. Há uma formação técnica sem datas divulgadas, que
dá o estado sem prazo confirmado. Há uma bolsa de mérito já encerrada, para testar o expirado. E
há um estágio que está em revisão editorial e por isso não aparece no catálogo público, para
testar a RN-01 e o painel de administração.

Também arrumei a coerência editorial, que estava inconsistente: a oportunidade que estava marcada
como verificada mas tinha a verificação em pendente deixou de existir. Agora, tudo o que está
publicado tem uma verificação marcada como verificada, com nota de que é fictícia, e a data da
última verificação preenchida. O que está pendente tem a verificação pendente e a data a nulo.

Ajustei os favoritos e as candidaturas às oportunidades novas, para as contas de demonstração
terem dados com que trabalhar, e nenhum deles aponta para a oportunidade que está em revisão.

## 4. Mentoria e pagamentos: as decisões que tomei

Antes de tudo, a regra de ouro, que é a RN-11: só o servidor confirma um pagamento, e só depois
de o fornecedor avisar. O frontend nunca diz "pago". Não existe, nem vai existir, um endpoint que
aceite isso do cliente.

A mentoria tem dois tipos e a base de dados trata-os de forma diferente. A **personalizada** é
com um mentor real: o serviço exige um mentor, o fluxo passa por um agendamento com horário, e o
link de videoconferência só é criado depois de o pagamento estar confirmado no servidor. A
**geral** é acesso a conteúdo interativo e ao assistente de IA: não tem mentor, não tem horário e
não tem videoconferência. O pagamento confirmado cria um registo de acesso, e é esse acesso que
dá direito à IA.

O fluxo da personalizada, passo a passo: o candidato escolhe serviço e horário; o servidor
recalcula o preço a partir da base de dados e nunca aceita o valor que venha do frontend; cria o
agendamento em `PENDENTE_PAGAMENTO` com uma expiração que reserva o horário; cria o pagamento em
`PENDENTE` com o valor e a moeda gravados naquele momento; pede a cobrança ao fornecedor e devolve
a referência; o candidato paga; o fornecedor chama o nosso webhook; o servidor verifica a
assinatura, grava o evento, confere que o valor e a moeda batem certo e só então, numa transação,
passa o pagamento e o agendamento a confirmados; e só depois da transação é que vai criar o evento
no Google Calendar com o link de videoconferência e guardar esse link. O frontend, quando o
candidato volta do pagamento, não decide nada: pergunta ao servidor pelo estado do agendamento e
mostra o que o servidor disser, com umas quantas tentativas curtas, porque o webhook pode demorar
alguns segundos.

Os casos que costumam partir estão tratados por desenho. Se o pagamento entrou mas a criação do
link falhou, o agendamento fica confirmado e com o link vazio, e a criação é repetida mais tarde.
Nunca se perde um pagamento por causa de uma falha do Google. Se a reserva expirou e o pagamento
chega tarde, vai para reembolso ou revisão manual. E se dois candidatos tentarem o mesmo horário
do mesmo mentor, isso não se resolve com código: está resolvido na base de dados.

Quero sublinhar essa parte porque foi uma decisão consciente. Criei um índice parcial único nas
candidaturas, para impedir duas candidaturas ativas à mesma oportunidade, e uma restrição de
exclusão na tabela dos agendamentos, que junta o mentor com o intervalo de tempo e rejeita
sobreposições. O horário em espera de pagamento também conta como ocupado, para ninguém ficar com
um horário reservado nas mãos de outra pessoa. Está escrito em SQL na migração `regras_integridade`,
precisamente no mesmo espírito do índice das candidaturas.

Sobre a idempotência: o fornecedor pode repetir avisos, e nós não podemos processar o mesmo
pagamento duas vezes. Por isso há uma tabela de eventos com uma restrição de unicidade por
fornecedor e identificador do evento. Se o aviso chegar repetido, é ignorado.

Sobre o cancelamento, no MVP é simples: até 24 horas antes, direito a reembolso, e o reembolso é
feito manualmente. Não vale a pena automatizar isto agora.

## 5. O que muda para o Dillan

O webhook é público, por isso fica fora do CSRF e da sessão e autentica-se só pela assinatura.
Precisa do corpo em bruto — `express.raw` — senão não consegues verificar a assinatura. E nunca
guardamos dados de cartão, só a referência do fornecedor.

O link da reunião só pode aparecer ao candidato e ao mentor daquele agendamento. Nunca em
endpoints públicos.

Na IA: a chave da API fica no `.env` do backend e nunca no frontend. Cada mensagem passa por
`POST /conversas/:id/mensagens` e o servidor verifica sempre três coisas, por esta ordem: sessão,
dono da conversa, e acesso ao serviço ativo com expiração no futuro. Esconder o chat no frontend
não conta como segurança; a RNF-04 está a falar exatamente disto. Mete também um limite por
utilizador, com rate limit e um teto diário de mensagens, senão alguém abusivo gasta o crédito da
IA.

E a IA responde com base em dados verificados do catálogo, dizendo sempre a fonte, e quando não
consegue confirmar algo tem de dizer isso mesmo. A RN-17 é para levar a sério: uma IA que inventa
elegibilidade destrói a confiança na plataforma.

Há uma validação que a base de dados não impõe sozinha e por isso tem de ficar no código: só
serviços do tipo geral dão acesso à IA. Ou seja, ao criar um acesso ou uma conversa, confirma que
o tipo do serviço é geral. Está no teu lado.

Por fim, combinámos que o login usa argon2id, e o seed já grava os hashes nesse formato. Se
mudares o formato no login, as contas do seed deixam de entrar. E as palavras-passe dessas contas
não estão no repositório: passo-te por mensagem privada.

## 6. O que muda para a Michele

No catálogo, o frontend só mostra oportunidades publicadas. A oportunidade que está em revisão
editorial existe na base de dados mas não pode aparecer, e é assim que fica testável a RN-01.

Os dados são fictícios e isso tem de ser visível. Não é uma observação de rodapé: qualquer pessoa
que veja a demonstração tem de perceber à primeira que aquilo não é uma oportunidade real. Por
isso os títulos começam com `[DEMO]` e as descrições dizem-no explicitamente. Pede-me o texto que
quiseres se precisares de um aviso na interface.

Os estados de prazo que aparecem no catálogo saem de duas datas: a de abertura e a de prazo. Daí
resultam quatro situações possíveis — ainda não abriu, aberto, expirado e sem prazo confirmado.
Como as datas do seed são relativas, tens sempre os quatro casos para testar sem mexer em nada.

Na parte do pagamento, o frontend nunca envia o preço nem decide que algo está pago. Pede o
agendamento ao servidor e mostra o estado que vier. Depois do pagamento, faz umas tentativas
curtas porque o aviso do fornecedor pode demorar uns segundos a chegar.

## 7. O que muda para o José

Ao nível do contrato, o que interessa reter é isto: os estados de pagamento e de agendamento são
decididos exclusivamente pelo servidor, e o cliente apenas lê. Há estados intermédios — pagamento
pendente, agendamento pendente de pagamento — e o cliente tem de os saber representar, incluindo
o caso em que o agendamento está confirmado mas o link da reunião ainda não está preenchido
porque a criação falhou e vai ser repetida.

O preço vem sempre calculado pelo servidor. Se o cliente enviar um valor, é ignorado.

## 8. Regras para não partir a base de dados

Uma migração que já foi aplicada nunca se edita. Se estiver errada, faz-se uma nova migração a
corrigir. Isto vale para a migração vazia também, pelo motivo que expliquei acima.

Alterações ao schema passam por mim. Se precisares de um campo novo, diz-me o que precisas e eu
faço a migração, porque uma alteração ao modelo tem de vir com SQL versionado, senão cada pessoa
fica com uma base diferente.

O `.env` nunca vai para o Git. Cada pessoa tem o seu, a partir do `.env.example`.

E o seed é só para base local. Correr isto contra uma base partilhada estraga o trabalho dos
outros.

## 9. Pontos em aberto

A mentoria e os pagamentos são P2 no documento e o prazo é 25 de outubro, por isso é preciso
termos noção do que dá para fazer a tempo.

O fornecedor de pagamento real em Angola é o maior risco. Uma conta de comerciante pode demorar
semanas a aprovar, por isso não vai estar pronto. A minha proposta é fazermos o fluxo completo
com um fornecedor simulado, claramente identificado como tal, sendo que o webhook, a verificação
da assinatura e a transação são exatamente os mesmos. Quando o fornecedor real entrar, é trocar
uma classe. Para a videoconferência, no pior caso o mentor cola o link à mão.

Continua a faltar modelar a disponibilidade dos mentores e o conteúdo da mentoria geral. E o hash
argon2 tem de ficar combinado com o Dillan, senão ninguém entra nas contas de demonstração.

E não me esqueço do principal: o P0 — autenticação, catálogo, favoritos, candidaturas e
administração — tem de ficar sólido primeiro.

## 10. Onde está cada ficheiro

O modelo está em `backend/prisma/schema.prisma`. As migrações estão em
`backend/prisma/migrations/`, incluindo o SQL manual em `regras_integridade`. O seeder está em
`backend/prisma/seed.ts`. O modelo do ficheiro de ambiente está em `backend/.env.example`. Este
relatório e o documento de engenharia de software estão em `docs/`.

Os scripts de conveniência estão no `package.json` dentro de `backend/`: `db:migrate`, `db:seed`,
`db:reset` e `db:studio`.
