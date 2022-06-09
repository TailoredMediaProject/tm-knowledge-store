<template>
  <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 border-b border-tmOrange">
    <div class="flex grid grid-cols-3 gap-5 h-16">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <router-link to="/">
            <img src="@/assets/Tailored_Media_Logo_Final.png" alt="Tailored Media Logo" class="d-inline-block align-text-top max-h-10" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'Header'
});
</script>
