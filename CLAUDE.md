# Memento Mori (https://mementomoriweeks.com)

## Regra: testes não contam nas métricas

Nenhum teste pode registrar visita ou download no GoatCounter, a não ser que o dono do projeto peça.

- Antes de abrir o site publicado num teste, bloqueie `*goatcounter.com/count*`
  (Playwright: `context.route(/goatcounter\.com\/count/, r => r.abort())`).
- Num navegador de uso manual, defina no site `localStorage.setItem("skipgc", "t")`
  (ou abra `https://mementomoriweeks.com/#toggle-goatcounter` uma vez).
- Prefira testar os arquivos locais.
- Se pedirem um teste das métricas, avise quais acessos de teste vão entrar.

## Ao mudar o site

- Edite o `index.html` e rode `node gerar-idiomas.js` antes do commit. Não edite as pastas de idioma à mão.
- Domínio: `https://mementomoriweeks.com`. Não mexa nos registros de DNS.
