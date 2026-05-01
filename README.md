<div align="center">

<img src="assets/logo.png" width="120" alt="goroku logo" />

# goroku

**Monte decks personalizados de japonês com áudio e exporte para o Anki em segundos**

*100% no navegador. Sem login. Sem backend. Sem sofrimento.*

[![License](https://img.shields.io/badge/license-MIT-black?style=flat-square)](LICENSE)
[![Built with JavaScript](https://img.shields.io/badge/built_with-JavaScript-black?style=flat-square)]()
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-black?style=flat-square)]()

<br/>

<a href="SEU_LINK_DE_DOACAO_AQUI">
  <img src="https://img.shields.io/badge/☕%20Me%20pague%20um%20café-black?style=for-the-badge" />
</a>

</div>

---

# 🚀 O que é isso?

O **goroku** é uma ferramenta para aprender japonês de forma prática:

* 🔍 Busque frases reais
* 🎧 Ouça áudio nativo
* 📚 Monte seus próprios decks
* 📦 Exporte direto para o Anki (com áudio)

Tudo isso:

> **rodando 100% no navegador — sem login, sem conta, sem backend**

---

# ⚡ Como funciona (em 10 segundos)

1. Pesquise uma frase
2. Clique em **+ adicionar ao deck**
3. Abra o menu de cards
4. Exporte para o Anki

Pronto.

---

# 🧠 Fluxo real de uso

```
Buscar → Selecionar → Revisar → Exportar → Estudar no Anki
```

---

# 🧩 Funcionalidades principais

### 📚 Deck Builder local

* Adicione frases com um clique
* Evita duplicatas automaticamente
* Deck persistente no navegador

---

### ✏️ Edição de cards

* Edite japonês e tradução antes de exportar
* **Nunca altera o banco original**
* Botão de **restaurar original**

---

### 🎧 Áudio integrado

* Reprodução direta
* Exportação com áudio no Anki
* Conversão automática para compatibilidade

---

### 📦 Exportação inteligente

#### 🟢 Opção 1 — AnkiConnect (recomendado)

* Envia direto para o Anki
* Já cria os cards automaticamente
* Inclui áudio no Front

#### 🟡 Opção 2 — `.txt`

* Baixa arquivo para importação manual
* Funciona sempre (fallback universal)

---

### 📚 Histórico inteligente

* Detecta frases já exportadas
* Evita repetição acidental
* Base para futuras estatísticas

---

# ⚙️ Como usar com Anki (automático)

Para enviar direto ao Anki com áudio, você precisa do plugin:

👉 **AnkiConnect (código: 2055492159)**

---

## 🧠 Passo a passo

### 1. Instalar o plugin

No Anki:

```
Tools → Add-ons → Get Add-ons
```

Cole o código:

```
2055492159
```

Reinicie o Anki.

---

### ⚠️ Se não funcionar (90% dos casos)

> ⚠️ Se o botão “Enviar para Anki” não funcionar,
> na maioria das vezes é por causa dessa configuração abaixo.

---

### 2. Configurar o AnkiConnect (IMPORTANTE)

Por padrão, o Anki bloqueia conexões externas (CORS).
Você precisa liberar o goroku manualmente.

---

#### 📂 Abra o arquivo de configuração

No Anki:

```
Tools → Add-ons → AnkiConnect → Config
```

---

#### ✏️ Substitua por isso:

```json
{
  "apiKey": null,
  "apiLogPath": null,
  "webBindAddress": "127.0.0.1",
  "webBindPort": 8765,
  "webCorsOriginList": [
    "http://localhost",
    "http://127.0.0.1",
    "https://goroku.pages.dev"
  ],
  "ignoreOriginList": []
}
```

---

#### ⚠️ Importante

* ❌ NÃO coloque `/` no final da URL
* ❌ `"https://goroku.pages.dev/"` → quebra
* ✅ `"https://goroku.pages.dev"` → correto

---

### 3. Reiniciar o Anki

👉 Feche completamente o Anki e abra novamente

---

### 4. Deixar o Anki aberto

O goroku se conecta via:

```
http://127.0.0.1:8765
```

👉 Se o Anki estiver fechado → não funciona

---

### 5. Usar no goroku

* Clique em **Exportar → Enviar para Anki**
* Escolha o deck (ou crie um novo)
* Pronto 🎉

---

## ⚠️ Observações importantes

* 💻 Funciona apenas em desktop
* 📱 Não funciona em celular
* 🔒 Comunicação é local (nada vai pra internet)
* ❌ Se der erro → geralmente é configuração do AnkiConnect
* 🟡 Sempre existe fallback via `.txt`

---

## 🧪 Teste rápido (debug)

Abra o console do navegador e rode:

```js
fetch("http://127.0.0.1:8765", {
  method: "POST",
  body: JSON.stringify({ action: "version", version: 6 })
})
.then(r => r.json())
.then(console.log)
```

Se retornar:

```json
{ "result": 6, "error": null }
```

👉 Está funcionando

---

# 🧠 Arquitetura (resumo técnico)

## 🔒 Fonte da verdade (imutável)

```
traduzido_pt.json
```

* Nunca é alterado
* Base completa de frases

---

## ✏️ Camada editável (IndexedDB)

```
deck
```

* Cópias das frases
* Pode editar livremente
* Persiste entre sessões

---

## 📚 Histórico persistente

```
history
```

* Registra exportações
* Detecta duplicatas
* Base para futuras features

---

## 🧩 Organização modular

```
/js
├── core
├── search
├── audio
├── renderer
├── deck system
├── export system
```

---

# 🛠️ Tecnologias

* JavaScript (Vanilla)
* IndexedDB (Dexie.js)
* HTML + CSS modular
* AnkiConnect

---

# 🧠 Filosofia do projeto

* ⚡ rápido
* 🧩 modular
* 💻 100% client-side
* 🧠 feito pra uso real
* ❌ sem dependências pesadas

---

# 🚧 Em desenvolvimento

* Furigana automático
* Estatísticas de uso
* Favoritos
* Melhorias no export

---

# 🖥️ Futuro

👉 Versão desktop planejada

Objetivo:

* uso offline completo
* integração melhor com Anki
* gerenciamento avançado

---

# 🤝 Contribuindo

* ⭐ dá uma estrela
* 🐛 reporta bugs
* 💡 sugere ideias
* 🔧 manda PR

---

# ☕ Apoiar o projeto

Se isso te ajudou:

👉 considere me pagar um café

(link no topo ☝️)

---

# 📜 Licença

MIT