<template>
  <div class="flex flex-col h-screen">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 h-screen">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow items-center border-gray-200 sm:rounded-lg overflow-y-visible">
          <div class="bg-white px-4 py-5 border-b border-tmBlue sm:px-6">
            <div class="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ heading }}
              </h3>
            </div>
          </div>
          <component :is="isEntity ? 'CreateEntity' : 'CreateVocab'"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CreateVocab from '@/components/CreateVocab';
import CreateEntity from '@/components/CreateEntity';
import {mapGetters} from 'vuex';

export default {
  name: 'Create',
  components: {CreateVocab, CreateEntity},
  computed: {
    ...mapGetters('vocabStore', ['vocabulary']),
    ...mapGetters('entityStore', ['entity']),
    isUpdate() {
      return this.isEntity ? !!this.entity?.id : !!this.vocabulary?.id;
    },
    isEntity() {
      return !!this.entity;
    },
    heading() {
      const begin = this.isUpdate ? 'Update ' : 'Create ';
      const end = this.isEntity ? 'Entity' : 'Vocabulary';
      let id = '';

      if (this.isUpdate) {
        id = ` ${this.isEntity ? this.entity.id : this.vocabulary.id}`;
      }

      return begin + end + id;
    }
  }
};
</script>
