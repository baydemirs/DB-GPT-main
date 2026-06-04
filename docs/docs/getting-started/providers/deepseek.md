---
sidebar_position: 2
title: DeepSeek
---

# DeepSeek

Configure DB-GPT to use DeepSeek's language models for chat and reasoning.

## Prerequisites

- A [DeepSeek API key](https://platform.deepseek.com/)
- DB-GPT installed with `proxy_openai` extra

## Install dependencies

```bash
uv sync --all-packages \
  --extra "base" \
  --extra "proxy_openai" \
  --extra "rag" \
  --extra "storage_chromadb" \
  --extra "dbgpts"
```

:::info Embedding model
DeepSeek does not provide embedding models. The default config uses a HuggingFace embedding model (`BAAI/bge-large-zh-v1.5`). If using this, also add:

```bash
uv sync --all-packages \
  --extra "base" \
  --extra "proxy_openai" \
  --extra "rag" \
  --extra "storage_chromadb" \
  --extra "dbgpts" \
  --extra "hf" \
  --extra "cpu"
```
:::

## Configuration

Edit `configs/dbgpt-proxy-deepseek.toml`:

```toml
[models]
[[models.llms]]
name = "deepseek-reasoner"
provider = "proxy/deepseek"
api_key = "your-deepseek-api-key"

[[models.embeddings]]
name = "BAAI/bge-large-zh-v1.5"
provider = "hf"
# Uncomment to use a local model path:
# path = "models/bge-large-zh-v1.5"
```

## Available models

| Model | Config name | Notes |
|---|---|---|
| DeepSeek-R1 | `deepseek-reasoner` | Strong reasoning, chain-of-thought |
| DeepSeek-V3 | `deepseek-chat` | General purpose chat |

## Start the server

```bash
uv run dbgpt start webserver --config configs/dbgpt-proxy-deepseek.toml
```

## Troubleshooting

| Issue | Solution |
|---|---|
| `AuthenticationError` | Verify your DeepSeek API key at [platform.deepseek.com](https://platform.deepseek.com/) |
| Embedding download slow | Pre-download the model or use a mirror (`UV_INDEX_URL`) |
| Out of memory for embedding | Use `--extra "cpu"` to run embeddings on CPU |

## What's next

- [Getting Started](/docs/getting-started/quick-start) — Full setup walkthrough
- [Model Providers](/docs/getting-started/providers/) — Try other providers
