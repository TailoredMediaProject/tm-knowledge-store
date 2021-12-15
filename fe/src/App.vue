<template>
  <div class="flex flex-col h-screen">
    <Header />
    <div class="h-full min-h-screen bg-backgroundDefault px-4 py-8">
      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "@/components/Header.vue";

export default defineComponent({
  name: "App",
  components: {
    Header,
  },
});
</script>

<style lang="scss"></style>
