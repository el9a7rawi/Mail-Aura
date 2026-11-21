<p align="center">
  <img src="assets/banner/mail-aura-banner-pt-BR.webp" width="100%" alt="Mail Aura — Verificador de E-mails e Limpador de Listas" />
</p>

<h1 align="center">Mail Aura — Verificador de E-mails e Limpador de Listas</h1>

<p align="center">Verifique endereços de e-mail usando oito fontes públicas gratuitas, limpe listas longas com um clique e exporte os resultados em CSV — sem chave de API, sem conta e sem adivinhação. A interface vem em oito idiomas, incluindo suporte completo a RTL em árabe.</p>

<p align="center">
  <a href="https://github.com/el9a7rawi/Mail-Aura/releases"><img src="https://img.shields.io/github/v/release/el9a7rawi/Mail-Aura?color=4f46e5" alt="Última versão" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-E8710A" alt="Apache 2.0" /></a>
  <a href="https://github.com/el9a7rawi/Mail-Aura/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-22C55E" alt="PRs bem-vindos" /></a>
  <a href="https://developer.chrome.com/docs/extensions"><img src="https://img.shields.io/badge/Manifest-V3-4285F4" alt="Manifest V3" /></a>
  <img src="https://img.shields.io/badge/8_Languages-7c3aed" alt="8 idiomas" />
  <img src="https://img.shields.io/badge/Works-Offline-059669" alt="Funciona offline" />
</p>

<h4 align="center">
  <a href="README.md">English</a> · <a href="README.es.md">Español</a> · <a href="README.fr.md">Français</a> · <a href="README.de.md">Deutsch</a> · <a href="README.pt-BR.md"><b>Português (Brasil)</b></a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <a href="README.zh-CN.md">中文（简体）</a>
</h4>
<h3 align="center">Download for your browser — click the icon</h3>

<div align="center">

| [<img src="assets/browsers/chrome.svg" width="52" alt="Chrome" /><br><b>Chrome</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/edge.svg" width="52" alt="Edge" /><br><b>Edge</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/firefox.svg" width="52" alt="Firefox" /><br><b>Firefox</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/brave.svg" width="52" alt="Brave" /><br><b>Brave</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) | [<img src="assets/browsers/opera.svg" width="52" alt="Opera" /><br><b>Opera</b>](https://github.com/el9a7rawi/Mail-Aura/releases/latest) |
|---|---|---|---|---|

</div>

---

## 1. Por que usar o Mail Aura?

<div align="center">

| Sem o Mail Aura | Com o Mail Aura |
|---|---|
| Adivinhar apenas pelo formato | Oito fontes independentes mais sinais locais |
| Listas coladas cheias de duplicatas | Duplicatas removidas antes da verificação |
| Limpeza manual de CSV | Importação e exportação de CSV com um clique |
| Um selo de 100% que não significa nada | Uma pontuação honesta, limitada a 88% para endereços válidos |

</div>

Nenhum serviço público consegue provar que uma caixa de correio específica existe sem enviar um e-mail real. Por isso, o Mail Aura informa uma **pontuação de confiança**, e não uma garantia.

---

## 2. Como funciona — três etapas

1. **Escolha uma fonte** — examine a página atual, cole uma lista ou carregue um CSV.
2. **Verifique** — os endereços são checados em paralelo em oito serviços gratuitos e armazenados em cache por domínio.
3. **Aja** — copie os endereços válidos, corrija erros de digitação com um clique ou exporte tudo em CSV.

---

## 3. Visão geral da interface

### 3.1 Uma ação principal, três modos de entrada
- **Examinar esta página** — coleta os endereços visíveis e os destaca sem ler a página previamente.
- **Colar endereços** — um por linha ou separados por vírgula; duplicatas são removidas e sintaxe inválida é exibida como resultado.
- **Arquivo CSV** — lê a primeira coluna e exporta um novo CSV com status, confiança, concordância, sugestão e detalhes da fonte.

### 3.2 Resultados em que você pode confiar
- Cada linha mostra o endereço, um selo de status e uma linha curta de detalhe: `Confiança N% · motivo`.
- Filtre por status, pesquise nos resultados e copie as linhas válidas ou visíveis.
- Corrija erros conhecidos de digitação em domínios, como `gmial.com → gmail.com`, com um único clique.
- Domínios descartáveis, endereços de função e provedores gratuitos são sinalizados, e não ocultados.

### 3.3 Modo privacidade
- Interrompe imediatamente todas as chamadas externas; a verificação passa a ser apenas local.
- O indicador de conexão no rodapé sempre mostra o estado atual.

### 3.4 Oito idiomas, RTL real
- O inglês é o padrão; o idioma do navegador é usado na primeira execução quando for um dos oito.
- A troca é instantânea e não exige recarregamento.
- O árabe usa layout RTL completo com regras plurais corretas.

### 3.5 Tema escuro preto verdadeiro
- Um fundo preto real com contraste ajustado, ativado no cabeçalho e lembrado.

### 3.6 Support continued development

- Mail Aura é gratuito e de código aberto. Um botão opcional do InstaPay e o PayPal como alternativa ajudam a melhorá-lo. Ambos os links abrem em uma nova aba; a extensão não envia dados.

---

## 4. Oito fontes gratuitas

1. Rapid Email Validator
2. Disify
3. DeBounce
4. MailCheck.ai
5. Disban
6. EmailProbe
7. Google DNS-over-HTTPS
8. Cloudflare DNS-over-HTTPS

Todas as chamadas usam HTTPS e não exigem chave. O modo privacidade desativa todas elas.

---

## 5. Instalação (sem empacotamento)

1. Abra `chrome://extensions`.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione esta pasta.
4. Clique no ícone do Mail Aura na barra de ferramentas.

Não é necessária nenhuma etapa de compilação nem dependências externas.

---

## 6. Desenvolvimento

```powershell
node --test tests/             # 49 testes unitários
node --check ui.js             # verificação de sintaxe de todos os arquivos JS
node scripts/check-ui.mjs      # IDs do DOM, arquivos do manifesto, CSP, HTTPS
node scripts/build-preview.mjs # regenera dev/preview.html e preview-side.html
```

O Chrome é necessário para o auxiliar de capturas de tela:

```powershell
node scripts/screenshot.mjs --url "file:///C:/.../dev/preview.html?theme=light&tall=1" --out dev/preview-light.png
```

---

## 7. Privacidade

Consulte `privacy.html`. Os endereços são enviados somente quando você solicita uma verificação, nada é rastreado e todas as conexões usam HTTPS. A única exceção declarada é uma única folha de estilo do Google Fonts carregada quando a interface é aberta; nenhum dado de e-mail ou verificação é enviado junto com ela.

---

## 8. Licença

O projeto é de código aberto e gratuito para todos sob a licença **Apache-2.0** — use-o, modifique-o e compartilhe-o livremente; o texto completo está em [LICENSE](LICENSE).

---

<p align="center">Feito com carinho por <b>Ahmed Yousry</b> · <a href="https://github.com/el9a7rawi/Mail-Aura">Mail Aura</a> · <a href="LICENSE">Apache-2.0</a></p>
