<template>
  <div class="flex flex-col h-screen">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 h-screen">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div
          class="
            shadow
            items-center
            border-gray-200
            sm:rounded-lg
            overflow-y-visible
          "
        >
          <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
            <div
              class="
                -ml-4
                -mt-2
                flex
                items-center
                justify-between
                flex-wrap
                sm:flex-nowrap
              "
            >
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Create {{ isEntity ? "Entity" : "Vocabulary" }}
              </h3>
            </div>
          </div>
          <component
            :is="isEntity ? 'CreateEntity' : 'CreateVocab'"
            v-bind="{ vocabID: this.vID }"
          ></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreateVocab from "@/components/CreateVocab";
import CreateEntity from "@/components/CreateEntity";
export default {
  name: "Create",
  components: { CreateVocab, CreateEntity },
  props: {
    vocabID: String,
  },
  data() {
    return {
      isEntity: false,
      vID: String,
    };
  },
  mounted() {
    this.vID = this.vocabID;
    this.isEntity = this.vID !== "";
  },
  beforeRouteUpdate(to, from, next) {
    this.vID = to.params.vocabID;
    this.isEntity = this.vID !== "";
    next();
  },
};
</script>

<style scoped></style>
