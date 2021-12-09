<template>
  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div
          class="
            shadow
            items-center
            overflow-hidden
            border-gray-200
            sm:rounded-lg
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
              <div class="ml-4 mt-2">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Vocabularies
                </h3>
              </div>
              <div class="ml-4 mt-2 flex-shrink-0">
                <button
                  type="button"
                  @click="createNew"
                  class="
                    relative
                    inline-flex
                    items-center
                    px-4
                    py-2
                    border border-transparent
                    shadow-sm
                    text-sm
                    font-medium
                    rounded-md
                    text-white
                    bg-tmOrange
                    hover:bg-tmHoverOrange
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                    focus:ring-tmFocusOrange
                  "
                >
                  Create new Vocabulary
                </button>
              </div>
            </div>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="
                    px-6
                    py-3
                    text-left text-xs
                    font-medium
                    text-gray-500
                    uppercase
                    tracking-wider
                  "
                >
                  Label
                </th>
                <th
                  scope="col"
                  class="
                    px-6
                    py-3
                    text-left text-xs
                    font-medium
                    text-gray-500
                    uppercase
                    tracking-wider
                  "
                >
                  Description
                </th>
                <th
                  scope="col"
                  class="
                    px-6
                    py-3
                    text-left text-xs
                    font-medium
                    text-gray-500
                    uppercase
                    tracking-wider
                  "
                >
                  Created
                </th>
                <th
                  scope="col"
                  class="
                    px-6
                    py-3
                    text-left text-xs
                    font-medium
                    text-gray-500
                    uppercase
                    tracking-wider
                  "
                >
                  Modified
                </th>
                <th
                  scope="col"
                  class="
                    px-6
                    py-3
                    text-left text-xs
                    font-medium
                    text-gray-500
                    uppercase
                    tracking-wider
                  "
                >
                  Entities
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vocabulary in vocabularies" :key="vocabulary.id">
                <td
                  class="
                    px-6
                    py-4
                    whitespace-nowrap
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
                  {{ vocabulary.label }}
                </td>
                <td
                  class="
                    px-6
                    py-4
                    whitespace-nowrap
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
                  {{ vocabulary.description }}
                </td>
                <td
                  class="
                    px-6
                    py-4
                    whitespace-nowrap
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
                  {{ vocabulary.created }}
                </td>
                <td
                  class="
                    px-6
                    py-4
                    whitespace-nowrap
                    text-sm
                    font-medium
                    text-gray-900
                  "
                >
                  {{ vocabulary.lastModified }}
                </td>
                <td
                  class="
                    px-6
                    py-4
                    whitespace-nowrap
                    text-right text-sm
                    font-medium
                    text-tmOrange
                  "
                >
                  <router-link :to="'/vocab/' + vocabulary.id + '/entities'"
                    >Entities</router-link
                  >
                </td>
              </tr>
            </tbody>
          </table>
          <button
            type="button"
            class="
              inline-flex
              items-center
              px-4
              py-2
              border border-transparent
              text-sm
              font-medium
              rounded-md
              shadow-sm
              text-white
              bg-tmOrange
              hover:bg-tmHoverOrange
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-tmFocusOrange
            "
            @click="loadMore"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "VocabListView",
  mounted() {
    this.$store.dispatch("vocabStore/loadVocabList", {});
  },
  computed: {
    ...mapGetters("vocabStore", ["vocabularies"]),
  },
  methods: {
    loadMore() {
      this.$store.dispatch("vocabStore/loadNextPage");
    },
    createNew() {
      this.$router.push("/create");
    },
  },
};
</script>

<style scoped></style>
