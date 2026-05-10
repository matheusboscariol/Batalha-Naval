# Quickstart: Batalha Naval

**Branch**: `001-batalha-naval-game` | **Date**: 2026-05-09

## Pré-requisitos

- Browser moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Um servidor HTTP local (necessário para ES6 modules via `file://` no Chrome/Firefox)

## Executar localmente

### Opção 1 — Python (mais simples, sem instalação extra se Python já estiver instalado)

```bash
# Na raiz do projeto
python3 -m http.server 8080
```

Acessar: `http://localhost:8080`

### Opção 2 — VS Code Live Server

1. Instalar a extensão **Live Server** (Ritwick Dey) no VS Code
2. Clicar com botão direito em `index.html` → "Open with Live Server"
3. Browser abre automaticamente em `http://127.0.0.1:5500`

### Opção 3 — Node.js (se disponível)

```bash
npx serve .
```

Acessar: `http://localhost:3000`

## Estrutura de arquivos

```text
index.html          ← abrir este arquivo no browser (via servidor)
css/
  style.css
  board.css
  animations.css
js/
  config.js
  board.js
  ai.js
  scoring.js
  ui.js
  game.js           ← entry point (importado por index.html)
```

## Fluxo de jogo

1. **Tela de Boas-Vindas** → clicar em "Iniciar Jogo"
2. **Posicionamento** → clicar em um navio da lista, depois clicar na célula destino do tabuleiro. Usar "Rotacionar" (ou tecla R) para mudar orientação. Quando todos posicionados, clicar em "Iniciar Batalha"
3. **Batalha** → clicar nas células do tabuleiro inimigo (direita) para atacar. Aguardar a resposta da IA. Continuar até um lado afundar todos os navios do outro
4. **Resultado** → vencer avança para o próximo nível; perder permite tentar novamente

## Validar funcionamento básico

- [ ] Tela de boas-vindas carrega sem erros no console
- [ ] Posicionar 2 navios no Nível 1 e clicar "Iniciar Batalha" → fase de batalha inicia
- [ ] Clicar em célula do tabuleiro inimigo → animação de projétil exibida
- [ ] Timer visível e incrementando durante a batalha
- [ ] Afundar todos os navios da IA → tela de resultado com pontuação
- [ ] Clicar "Avançar para o Nível 2" → posicionamento do Nível 2 (grade 7×7, 3 navios)
- [ ] Recarregar durante batalha → browser exibe diálogo de confirmação antes de sair

## Observações

- O jogo **não funciona** corretamente via `file://` diretamente no Chrome/Firefox devido à política CORS para ES6 modules. Sempre use um servidor HTTP local.
- O Safari permite `file://` com módulos ES6 em algumas versões — usar servidor é a abordagem mais segura.
- Nenhuma dependência externa, nenhum `npm install`, nenhum processo de build.
