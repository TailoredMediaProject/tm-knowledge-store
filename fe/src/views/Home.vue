<template>
  <div class="h-full min-h-screen bg-backgroundDefault px-4 py-8">
    <main>
      <ListView></ListView>
    </main>
  </div>
</template>

<script>
import ListView from "@/components/ListView";
export default {
  name: "Home",
  components: { ListView },
};
</script>

<style scoped></style>
