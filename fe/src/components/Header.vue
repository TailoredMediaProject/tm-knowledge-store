<template>
  <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex grid grid-cols-3 gap-5 h-16">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <router-link to="/">
            <img
              src="@/assets/Tailored_Media_Logo_Final.png"
              alt="Tailored Media Logo"
              class="d-inline-block align-text-top max-h-10"
            />
          </router-link>
        </div>
      </div>
      <div
        v-for="navigationButton in navigationButtons"
        :key="navigationButton.name"
        class="
          flex
          col-start-3
          items-center
          sm:-my-px sm:ml-6 sm:flex sm:space-x-8
        "
      >
        <router-link
          :to="navigationButton.href"
          :class="[
            navigationButton.current
              ? 'border-secondaryBg text-gray-900'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
          ]"
          >{{ navigationButton.name }}</router-link
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

const navigationButtons = [
  { name: "Vocabularies", href: "/vocab", current: false },
];

export default defineComponent({
  name: "Header",
  setup() {
    return {
      navigationButtons,
    };
  },
  computed: {
    currentRouteName(): string {
      return this.$route.name as string;
    },
  },
});
</script>
