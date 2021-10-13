<template>
  <footer class="footer fixed-bottom bg-light p-1">
    <div class="container">
      <span class="text-muted"
        >Made with ❤️ by
        <a href="https://redlink.at" class="text-danger">Redlink</a></span
      >
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Footer",
});
</script>
<style lang="scss" scoped>
.footer {
  text-align: center;
}
</style>
