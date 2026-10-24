#!/usr/bin/env bash
# Verificação do contrato da API contra um backend REAL em execução (Passo 2/4 da integração).
# Uso (dentro de Backend/):  bash scripts/verificar-api.sh [URL_BASE] [--rate-limit]
#   URL_BASE por omissão: http://localhost:3000/api/v1 (use http://localhost:5173/api/v1 para testar o proxy do Vite)
# As palavras-passe vêm do .env (SEED_*); nunca são escritas aqui nem impressas.
# --rate-limit faz 11 logins falhados: bloqueia o seu IP durante 15 min; use no fim.
# NOTA: escrito sem poder ser executado no ambiente de desenvolvimento (sem PostgreSQL); corrigir se algum passo falhar.
set -u
BASE="${1:-http://localhost:3000/api/v1}"; [[ "$BASE" == --* ]] && BASE="http://localhost:3000/api/v1"
set -a; [ -f .env ] && source <(tr -d '\r' < .env); set +a
ANA="$(mktemp)"; ADM="$(mktemp)"; trap 'rm -f "$ANA" "$ADM"' EXIT
OK=0; KO=0
json() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const o=JSON.parse(s);console.log(eval("o."+process.argv[1]))}catch{console.log("")}})' "$1"; }
chk() { if [ "$2" = "$3" ]; then OK=$((OK+1)); echo "  ok   $1"; else KO=$((KO+1)); echo "  FALHA $1 (esperado '$3', obtido '$2')"; fi; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

echo "== Público"
chk "GET /saude" "$(code $BASE/saude)" 200
REF="$(curl -s $BASE/referencias)"
chk "GET /referencias tem tipos" "$(echo "$REF" | json 'data.tipos.length>0')" true
chk "GET /referencias tem níveis" "$(echo "$REF" | json 'data.niveis.length>0')" true
chk "GET /auth/me sem sessão = 401" "$(code $BASE/auth/me)" 401
LISTA="$(curl -s "$BASE/oportunidades?limite=50")"
chk "catálogo tem meta.totalPaginas" "$(echo "$LISTA" | json 'typeof meta.totalPaginas')" number
for E in FUTURO ABERTO EXPIRADO SEM_PRAZO_CONFIRMADO; do
  R="$(curl -s "$BASE/oportunidades?estadoPrazo=$E&limite=50")"
  chk "filtro estadoPrazo=$E coerente" "$(echo "$R" | json 'data.every(x=>x.estadoPrazo==="'$E'")')" true
done
chk "query desconhecida = 400" "$(code "$BASE/oportunidades?xyz=1")" 400

echo "== Candidato (ana.demo)"
H="$(curl -s -i -c "$ANA" -H 'Content-Type: application/json' -d "{\"email\":\"ana.demo@example.org\",\"palavraPasse\":\"${SEED_DEMO_PASSWORD:-}\"}" $BASE/auth/login)"
chk "login = 200" "$(echo "$H" | head -1 | cut -d' ' -f2)" 200
SC="$(echo "$H" | grep -i '^set-cookie:' | tr -d '\r')"
chk "cookie HttpOnly" "$(echo "$SC" | grep -ci httponly)" 1
chk "cookie SameSite=Lax" "$(echo "$SC" | grep -ci 'samesite=lax')" 1
chk "GET /auth/me = 200" "$(code -b "$ANA" $BASE/auth/me)" 200
OP="$(echo "$LISTA" | json 'data.find(x=>x.estadoPrazo==="ABERTO").id')"
chk "favoritar = 201" "$(code -b "$ANA" -X POST $BASE/favoritos/$OP)" 201
chk "favoritar de novo (idempotente) = 201" "$(code -b "$ANA" -X POST $BASE/favoritos/$OP)" 201
chk "desfavoritar = 200" "$(code -b "$ANA" -X DELETE $BASE/favoritos/$OP)" 200
curl -s -b "$ANA" -X PATCH -H 'Content-Type: application/json' -d '{"estado":"CANCELADA"}' "$BASE/candidaturas/$(curl -s -b "$ANA" $BASE/candidaturas | json "data.find(c=>c.oportunidade.id==='$OP')?.id")" >/dev/null 2>&1
C1="$(curl -s -b "$ANA" -H 'Content-Type: application/json' -d "{\"oportunidadeId\":\"$OP\"}" -w '\n%{http_code}' $BASE/candidaturas)"
CID="$(echo "$C1" | head -1 | json 'data.id')"
chk "planear candidatura = 201" "$(echo "$C1" | tail -1)" 201
D="$(curl -s -b "$ANA" -H 'Content-Type: application/json' -d "{\"oportunidadeId\":\"$OP\"}" $BASE/candidaturas)"
chk "repetir = CANDIDATURA_DUPLICADA" "$(echo "$D" | json 'erro.codigo')" CANDIDATURA_DUPLICADA
chk "PATCH sem estado = 400" "$(code -b "$ANA" -X PATCH -H 'Content-Type: application/json' -d '{"notasPrivadas":"x"}' $BASE/candidaturas/$CID)" 400
chk "PATCH estado + notas = 200" "$(code -b "$ANA" -X PATCH -H 'Content-Type: application/json' -d '{"estado":"EM_PREPARACAO","notasPrivadas":"nota"}' $BASE/candidaturas/$CID)" 200
chk "histórico tem 2 entradas" "$(curl -s -b "$ANA" $BASE/candidaturas/$CID | json 'data.historico.length')" 2
curl -s -b "$ANA" -X PATCH -H 'Content-Type: application/json' -d '{"estado":"CANCELADA"}' $BASE/candidaturas/$CID >/dev/null
PC="$(code -b "$ANA" $BASE/perfis/me)"; [ "$PC" = 404 ] && PC=200   # 404 PERFIL_NAO_ENCONTRADO é estado normal
chk "perfil: 200 (ou 404 normal)" "$PC" 200
chk "perfil com data inválida = 400" "$(code -b "$ANA" -X PUT -H 'Content-Type: application/json' -d '{"nacionalidadeCodigo":"AO","dataNascimento":"nao-e-data"}' $BASE/perfis/me)" 400
chk "candidato em /admin = 403" "$(code -b "$ANA" $BASE/admin/metricas)" 403

echo "== Admin"
curl -s -c "$ADM" -H 'Content-Type: application/json' -d "{\"email\":\"admin@example.org\",\"palavraPasse\":\"${SEED_ADMIN_PASSWORD:-}\"}" $BASE/auth/login >/dev/null
chk "métricas = 200" "$(code -b "$ADM" $BASE/admin/metricas)" 200
TIPO="$(echo "$REF" | json 'data.tipos[0].id')"
NEW="$(curl -s -b "$ADM" -H 'Content-Type: application/json' -d "{\"titulo\":\"[VERIFICACAO] Bolsa $RANDOM\",\"entidadeFinanciadora\":\"Entidade Teste\",\"tipoOportunidadeId\":\"$TIPO\",\"descricao\":\"Descrição de teste da verificação.\",\"tipoFinanciamento\":\"INTEGRAL\",\"urlFonteOficial\":\"https://example.org/v\"}" $BASE/admin/oportunidades)"
NID="$(echo "$NEW" | json 'data.id')"
chk "criar rascunho" "$(echo "$NEW" | json 'data.estadoEditorial')" RASCUNHO
chk "rascunho fora do catálogo = 404" "$(code $BASE/oportunidades/$NID)" 404
chk "detalhe admin traz tipoOportunidadeId" "$(curl -s -b "$ADM" $BASE/admin/oportunidades/$NID | json 'data.tipoOportunidadeId')" "$TIPO"
chk "publicar = 200" "$(code -b "$ADM" -X POST $BASE/admin/oportunidades/$NID/publicar)" 200
chk "publicada visível = 200" "$(code $BASE/oportunidades/$NID)" 200
chk "arquivar = 200" "$(code -b "$ADM" -X POST $BASE/admin/oportunidades/$NID/arquivar)" 200
chk "arquivada some = 404" "$(code $BASE/oportunidades/$NID)" 404
echo "  (a oportunidade [VERIFICACAO] fica arquivada na BD; apague-a com o seu cliente SQL se quiser)"

echo "== Logout"
chk "logout = 200" "$(code -b "$ANA" -c "$ANA" -X POST $BASE/auth/logout)" 200

if [[ " $* " == *" --rate-limit "* ]]; then
  echo "== Limite de logins (11 falhados)"; ULT=0
  for i in $(seq 1 11); do ULT="$(code -H 'Content-Type: application/json' -d '{"email":"x@example.org","palavraPasse":"errada-errada"}' $BASE/auth/login)"; done
  chk "11.º login falhado = 429" "$ULT" 429
fi
echo; echo "Resultado: $OK ok, $KO falhas"; [ "$KO" -eq 0 ]
