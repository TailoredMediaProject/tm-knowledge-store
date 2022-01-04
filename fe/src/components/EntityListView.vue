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
                  Vocabulary {{ vocabID }} / Entities
                </h3>
              </div>
              <div class="ml-4 mt-2 flex-shrink-0">
                <button
                  type="button"
                  @click="$router.push('/vocab')"
                  class="
                    relative
                    inline-flex
                    items-center
                    px-4
                    py-2
                    mx-2
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
                  Back
                </button>
                <button
                  type="button"
                  @click="editEntity($event)"
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
                  New Entity
                </button>
              </div>
            </div>
          </div>
          <table class="min-w-full max-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="
                    px-6
                    py-3
                    text-center text-xs
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
                    text-center text-xs
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
                    text-center text-xs
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
                    text-center text-xs
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
                    text-center text-xs
                    font-medium
                    text-gray-500
                    uppercase
                    tracking-wider
                  "
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="odd:bg-gray-100"
                v-for="entity in entities"
                :key="entity.id"
              >
                <td
                  class="
                    px-6
                    py-4
                    text-sm text-center
                    font-medium
                    text-gray-900
                  "
                >
                  {{ entity.label }}
                </td>
                <td
                  class="
                    px-6
                    py-4
                    text-sm text-center
                    font-medium
                    text-gray-900
                  "
                >
                  {{ entity.description }}
                </td>
                <td
                  class="
                    px-6
                    py-4
                    text-sm
                    whitespace-nowrap
                    text-center
                    font-medium
                    text-gray-900
                  "
                >
                  {{ formatDate(entity.created) }}
                </td>
                <td
                  class="
                    px-6
                    py-4
                    whitespace-nowrap
                    text-sm text-center
                    font-medium
                    text-gray-900
                  "
                >
                  {{ formatDate(entity.lastModified) }}
                </td>
                <td
                  class="
                    flex flex-row flex-nowrap
                    items-center
                    justify-center
                    px-6
                    py-4
                  "
                >
                  <button
                    class="
                      border border-transparent
                      bg-tmOrange
                      rounded-md
                      text-white
                      items-center
                      px-3.5
                      py-2.5
                      text-sm
                      font-medium
                      inline-flex
                      hover:bg-tmHoverOrange
                    "
                    @click="editEntity($event, entity)"
                  >
                    <svg
                      class="fill-current w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      width="20"
                      height="20"
                    >
                      <path
                        d="M16.77 8l1.94-2a1 1 0 0 0 0-1.41l-3.34-3.3a1 1 0 0 0-1.41 0L12 3.23zm-5.81-3.71L1 14.25V19h4.75l9.96-9.96-4.75-4.75z"
                      />
                    </svg>
                  </button>
                  <button
                    class="
                      border border-transparent
                      bg-tmOrange
                      rounded-md
                      text-white
                      items-center
                      ml-3
                      px-3.5
                      py-2.5
                      text-sm
                      font-medium
                      inline-flex
                      hover:bg-tmHoverOrange
                    "
                    @click="deleteEntity(entity)"
                  >
                    <svg
                      class="fill-current w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 1000 1000"
                      width="24"
                      height="24"
                    >
                      <path
                        d="M632.2,500l330.4-330.5c36.5-36.5,36.5-95.8,0-132.2c-36.4-36.5-95.7-36.5-132.2,0L500,367.8L169.6,37.4C133,0.9,73.9,0.9,37.4,37.4C0.9,73.8,0.9,133,37.4,169.6L367.9,500L37.4,830.4c-36.5,36.5-36.5,95.7,0,132.2c36.5,36.5,95.7,36.5,132.2,0L500,632.2l330.4,330.4c36.5,36.5,95.7,36.5,132.2,0c36.5-36.5,36.5-95.7,0-132.2L632.2,500z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="flow-root px-2 py-3 bg-gray-50 text-center">
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
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import {useRoute} from 'vue-router';
import {formatDate} from '@/Utility/DateUtility';

export default {
  name: "EntityListView",
  data() {
    return {
      vocabID: String,
    };
  },
  mounted() {
    const route = useRoute();
    this.vocabID = route.params.vocabID;
    this.$store.dispatch("entityStore/loadEntityList", {
      vocabID: this.vocabID,
    });
  },
  computed: {
    ...mapGetters("entityStore", ["entities"]),
  },
  methods: {
    loadMore() {
      this.$store.dispatch("entityStore/loadNextPage");
    },
    editEntity($event, entity) {
      if (!entity) {
        entity = {};
      }
      this.$store.dispatch("entityStore/editEntity", {
        vocabId: this.vocabID,
        entity,
      });
      this.$router.push(`/create/${this.vocabID}`);
    },
    deleteEntity(entity) {
      this.$store.dispatch("entityStore/deleteEntity", {
        entity,
      });
      this.$router.go(0);
    },
    formatDate(date) {
      return formatDate(date);
    },
  },
};
</script>

<style scoped></style>
