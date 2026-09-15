<script setup lang="ts">
import { ref } from "vue";

type Endpoint = "hello" | "goodnight" | "goodbye";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const loading = ref<Endpoint | null>(null);
const result = ref<string>("まだリクエストしていません");
const error = ref<string>("");

async function callApi(endpoint: Endpoint): Promise<void> {
  if (!apiBaseUrl) {
    error.value =
      "VITE_API_URL が未設定です。BackendStack の ApiUrl を入れて front をビルドしてください。";
    result.value = "";
    return;
  }

  loading.value = endpoint;
  error.value = "";
  result.value = "リクエスト中...";

  try {
    const response = await fetch(`${apiBaseUrl}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const body = (await response.json()) as { message?: string };
    result.value = body.message ?? JSON.stringify(body);
  } catch (err) {
    result.value = "";
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = null;
  }
}
</script>

<template>
  <main class="page">
    <h1>cdkd-test</h1>
    <p class="lead">ボタンを押すと API Gateway 経由で各 Lambda を呼び出します。</p>

    <div class="actions">
      <button type="button" :disabled="loading !== null" @click="callApi('hello')">
        Say Hello
      </button>
      <button
        type="button"
        :disabled="loading !== null"
        @click="callApi('goodnight')"
      >
        Say GoodNight
      </button>
      <button type="button" :disabled="loading !== null" @click="callApi('goodbye')">
        Say Goodbye
      </button>
    </div>

    <section class="result" aria-live="polite">
      <h2>レスポンス</h2>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-else>{{ result }}</p>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 40rem;
  margin: 4rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
}

h1 {
  margin: 0 0 0.5rem;
}

.lead {
  margin: 0 0 1.5rem;
  color: #5c6570;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

button {
  padding: 0.7rem 1.1rem;
  border: 0;
  border-radius: 8px;
  background: #1f6feb;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 1.75rem;
  padding: 1rem;
  background: #f6f8fa;
  border-radius: 8px;
}

.result h2 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
}

.error {
  color: #b42318;
}
</style>
