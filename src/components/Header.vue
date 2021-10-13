<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <img
          src="./../assets/logo.png"
          alt="Redlink Logo"
          height="30"
          class="d-inline-block align-text-top"
        />
      </router-link>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav"></div>
      </div>
    </div>
  </nav>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Header",
  computed: {
    currentRouteName(): string {
      return this.$route.name as string;
    },
  },
});
</script>
