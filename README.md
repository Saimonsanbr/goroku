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

- 🔍 Busque frases reais
- 🎧 Ouça áudio nativo
- 📚 Monte seus próprios decks
- 📦 Exporte direto para o Anki (com áudio)

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
- Adicione frases com um clique
- Evita duplicatas automaticamente
- Deck persistente no navegador

---

### ✏️ Edição de cards
- Edite japonês e tradução antes de exportar
- **Nunca altera o banco original**
- Botão de **restaurar original**

---

### 🎧 Áudio integrado
- Reprodução direta
- Exportação com áudio no Anki
- Conversão automática para compatibilidade

---

### 📦 Exportação inteligente

#### 🟢 Opção 1 — AnkiConnect (recomendado)
- Envia direto para o Anki
- Já cria os cards automaticamente
- Inclui áudio no Front

#### 🟡 Opção 2 — `.txt`
- Baixa arquivo para importação manual
- Funciona sempre (fallback universal)

---

### 📚 Histórico inteligente
- Detecta frases já exportadas
- Evita repetição acidental
- Base para futuras estatísticas

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

### 2. Deixar o Anki aberto

👉 O goroku se conecta via:

```

[http://localhost:8765](http://localhost:8765)

````

Se o Anki estiver fechado → não funciona

---

### 3. Usar no goroku

- Clique em **Exportar → Enviar para Anki**
- Escolha o deck (ou crie um novo)
- Pronto 🎉

---

## ⚠️ Observações importantes

- Funciona apenas em desktop
- Não funciona em celular
- Se falhar → use export `.txt`

---

# 🧠 Arquitetura (resumo técnico)

O projeto segue um modelo **local-first** com separação clara de dados:

---

## 🔒 Fonte da verdade (imutável)

```txt
traduzido_pt.json
````

* Nunca é alterado
* Base completa de frases

---

## ✏️ Camada editável (IndexedDB)

```txt
deck
```

* Cópias das frases
* Pode editar livremente
* Persiste entre sessões

---

## 📚 Histórico persistente

```txt
history
```

* Registra exportações
* Permite detectar duplicatas
* Base para futuras features

---

## 🧩 Organização modular

```txt
/js
├── core
├── search
├── audio
├── renderer
├── deck system
├── export system
```

Cada módulo tem responsabilidade única — sem acoplamento desnecessário.

---

# 🛠️ Tecnologias

* JavaScript (Vanilla)
* IndexedDB (Dexie.js)
* HTML + CSS modular
* AnkiConnect (integração local)

---

# 🧠 Filosofia do projeto

* ⚡ rápido
* 🧩 modular
* 💻 100% client-side
* 🧠 pensado pra uso real
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
* melhor integração com Anki
* gerenciamento avançado de decks

---

# 🤝 Contribuindo

Achou útil?

* ⭐ dá uma estrela
* 🐛 reporta bugs
* 💡 sugere ideias
* 🔧 manda PR

---

# ☕ Apoiar o projeto

Se isso te ajudou de alguma forma:

👉 considere me pagar um café

(link no topo ☝️)

---

# 📜 Licença

MIT