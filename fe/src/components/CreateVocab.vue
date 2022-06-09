<template>
  <div class="mt-5 md:mt-0">
    <div class="shadow sm:rounded-md sm:overflow-hidden">
      <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2 sm:col-span-2">
            <label class="block text-sm font-bold text-gray-700"> Vocabulary Label </label>
            <div class="mt-2 flex rounded-md shadow-sm">
              <input
                type="text"
                v-model="label"
                name="label"
                id="label"
                class="px-2 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-tmOrange rounded-md"
                autofocus="autofocus"
                placeholder="Label"
              />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2 sm:col-span-2">
            <label class="block text-sm font-bold text-gray-700"> Vocabulary Description </label>
            <div class="mt-2 flex rounded-md shadow-sm">
              <input
                type="text"
                v-model="description"
                name="description"
                id="description"
                class="px-2 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-tmOrange rounded-md"
                placeholder="Description"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flow-root px-2 py-3 bg-gray-50 text-center">
        <button
          type="button"
          @click="cancel"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-tmOrange hover:bg-tmHoverOrange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tmFocusOrange mr-2"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="saveVocab"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-tmOrange hover:bg-tmHoverOrange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tmFocusOrange"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
  name: 'CreateVocab',
  computed: {
    ...mapGetters('vocabStore', ['vocabulary']),
    label: {
      get: function () {
        return this.vocabulary?.label;
      },
      set: function (label) {
        this.vocabulary.label = label;
      }
    },
    description: {
      get: function () {
        return this.vocabulary?.description;
      },
      set: function (description) {
        this.vocabulary.description = description;
      }
    }
  },
  methods: {
    saveVocab() {
      this.$store.dispatch(`vocabStore/${this.vocabulary.id ? 'updateVocab' : 'createVocab'}`, {
        label: this.label,
        description: this.description
      });
      this.cancel();
    },
    cancel() {
      this.$store.dispatch('vocabStore/editVocab', {
        vocabulary: undefined
      });
      this.$router.push('/vocab');
    }
  }
};
</script>

<style scoped></style>
