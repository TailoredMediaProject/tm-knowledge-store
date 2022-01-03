<template>
  <div class="mt-5 md:mt-0">
    <div class="shadow sm:rounded-md">
      <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2 sm:col-span-2">
            <label class="block text-sm font-bold text-gray-700">
              Entity Label
            </label>
            <div class="mt-2 flex rounded-md shadow-sm">
              <input
                type="text"
                v-model="label"
                name="label"
                id="label"
                class="
                  px-2
                  py-2
                  shadow-sm
                  focus:ring-indigo-500 focus:border-indigo-500
                  block
                  w-full
                  sm:text-sm
                  border border-gray-300
                  rounded-md
                "
                placeholder="Label"
                autofocus="autofocus"
              />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2 sm:col-span-2">
            <label class="block text-sm font-bold text-gray-700">
              Entity Description
            </label>
            <div class="mt-2 flex rounded-md shadow-sm">
              <input
                type="text"
                v-model="description"
                name="description"
                id="description"
                class="
                  px-2
                  py-2
                  shadow-sm
                  focus:ring-indigo-500 focus:border-indigo-500
                  block
                  w-full
                  sm:text-sm
                  border border-gray-300
                  rounded-md
                "
                placeholder="Description"
              />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-6">
          <Listbox as="div" v-model="selected">
            <ListboxLabel class="block text-sm font-medium text-gray-700">
              Entity Type
            </ListboxLabel>
            <div class="mt-1 relative">
              <ListboxButton
                class="
                  bg-white
                  relative
                  w-full
                  border border-gray-300
                  rounded-md
                  shadow-sm
                  pl-3
                  pr-10
                  py-2
                  text-left
                  cursor-default
                  focus:outline-none
                  focus:ring-1
                  focus:ring-indigo-500
                  focus:border-indigo-500
                  sm:text-sm
                "
              >
                <span class="block truncate">{{ selected }}</span>
                <span
                  class="
                    absolute
                    inset-y-0
                    right-0
                    flex
                    items-center
                    pr-2
                    pointer-events-none
                  "
                >
                  <SelectorIcon
                    class="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </ListboxButton>

              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <ListboxOptions
                  class="
                    absolute
                    z-10
                    mt-1
                    w-full
                    bg-white
                    shadow-lg
                    max-h-60
                    rounded-md
                    py-1
                    text-base
                    ring-1 ring-black ring-opacity-5
                    overflow-visible
                    focus:outline-none
                    sm:text-sm
                  "
                >
                  <ListboxOption
                    as="template"
                    v-for="(tagTypeKey, index) in tagTypeKeys"
                    :key="tagTypeKey"
                    :value="tagTypeKey"
                    v-slot="{ active, selected }"
                  >
                    <li
                      :class="[
                        active ? 'text-white bg-indigo-600' : 'text-gray-900',
                        'cursor-default select-none relative py-2 pl-3 pr-9',
                      ]"
                    >
                      <span
                        :class="[
                          selected ? 'font-semibold' : 'font-normal',
                          'block truncate',
                        ]"
                      >
                        {{ tagTypeValues[index] }}
                      </span>

                      <span
                        v-if="selected"
                        :class="[
                          active ? 'text-white' : 'text-indigo-600',
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                        ]"
                      >
                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>
      </div>
      <div class="flow-root px-2 py-3 bg-gray-50 text-center">
        <button
          type="button"
          @click="cancel"
          class="
            inline-flex
            justify-center
            py-2
            px-4
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
            mr-2
          "
        >
          Cancel
        </button>
        <button
          type="button"
          @click="createEntity"
          class="
            inline-flex
            justify-center
            py-2
            px-4
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
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue';
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions} from '@headlessui/vue';
import {CheckIcon, SelectorIcon} from '@heroicons/vue/solid';
import {TagType} from '@/openapi';
import {mapGetters} from 'vuex';

const tagTypeKeys = Object.keys(TagType);
const tagTypeValues = Object.values(TagType);
export default {
  name: "CreateEntity",
  components: {
    Listbox,
    ListboxButton,
    ListboxLabel,
    ListboxOption,
    ListboxOptions,
    CheckIcon,
    SelectorIcon,
  },
  computed: {
    ...mapGetters("entityStore", ["entity"]),
    ...mapGetters("vocabStore", ["vocabulary"]),
    label: {
      get: function () {
        return this.entity?.label;
      },
      set: function (label) {
        this.entity.label = label;
      },
    },
    description: {
      get: function () {
        return this.entity?.description;
      },
      set: function (description) {
        this.entity.description = description;
      },
    },
    vocabID() {
      return this.$route?.params?.vocabID || this.vocabulary?.id;
    },
  },
  setup() {
    const selected = ref("Select...");
    return {
      tagTypeKeys,
      tagTypeValues,
      selected,
    };
  },
  methods: {
    createEntity() {
      if (this.selected === "Select...") {
        alert("Please select an Entity Type");
      } else {
        this.$store.dispatch("entityStore/createEntity", {
          vocabID: this.vocabID,
          entity: {
            tagType: TagType[TagType[this.selected]],
            label: this.label,
            description: this.description,
            externalResources: [],
            sameAs: [],
          },
        });
        this.cancel();
      }
    },
    cancel() {
      this.$store.dispatch("enitiyStore/editVocab", {
        vocabID: this.vocabID,
        entity: undefined,
      });
      this.$router.push("/vocab/" + this.vocabID + "/entities");
    },
  },
};
</script>

<style scoped></style>
