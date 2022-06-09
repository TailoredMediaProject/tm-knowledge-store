import {EntityService} from '@/services/EntityService';
import {Entity, Pageable, TagType} from '@/openapi';
import {Module} from 'vuex';
import {EntityList} from '@/Objects/EntityList';

const entityService = new EntityService('./api/v1');
const arrayToMap = (array: Entity[]): Map<string, Entity> => {
  return new Map<string, Entity>(array.map((task: Entity) => [task.id, task]));
};

export const entityStore: Module<any, any> = {
  namespaced: true,
  state: () => ({
    entities: new Map<string, Entity>(),
    entity: undefined,
    pageable: <Pageable>{offset: 0, totalItems: 0, rows: 0},
    searchText: '',
    vocabId: '',
    type: ''
  }),
  mutations: {
    LOADENTITYLIST(
      state,
      payload: {
        searchText?: string;
        type?: Array<TagType>;
        page?: number;
        rowCount?: number;
        vocabID: string;
      }
    ) {
      entityService
        .getEntities(payload.vocabID, payload.searchText, payload.type, payload.page, payload.rowCount)
        .then((list: EntityList | undefined) => {
          if (list && list.entities.length > 0) {
            state.entities = arrayToMap(list.entities);
            state.pageable = list.pageable;
            state.searchText = payload.searchText;
            state.vocabID = payload.vocabID;
            state.tagType = payload.type;
          }
        });
    },
    LOADNEXTENTITYPAGE(state) {
      const nextPage = state.pageable.offset + state.pageable.rows;
      if ((state.vocabID && state.vocabID !== '', state.pageable.totalItems > 0 && nextPage < state.pageable.totalItems)) {
        const range = state.pageable.totalItems - nextPage;
        const nextRowCount = range > state.pageable.rows ? state.pageable.rows : range;
        const searchText = state.searchText && state.searchText !== '' ? state.searchText : undefined;
        entityService.getEntities(state.vocabID, searchText, state.tagType, nextPage, nextRowCount).then((list) => {
          if (list && list.entities.length > 0) {
            state.entities = new Map<string, Entity>(...state.entities, arrayToMap(list.entities));
            state.pageable = list.pageable;
          }
        });
      }
    },
    GETSPECIFICENTITY(state, payload: {vocabID: string; objectID: string}) {
      entityService.getEntity(payload.vocabID, payload.objectID).then((entity) => {
        if (entity) {
          state.entities.set(entity.id, entity);
        }
      });
    },
    CREATEENTITY(
      state,
      payload: {
        entity: {
          type: TagType;
          label: string;
          description: string;
          vocabulary: string;
          externalResources: string[];
          sameAs: string[];
        };
      }
    ) {
      const entity: Entity = {
        id: '',
        created: '',
        lastModified: '',
        vocabulary: payload.entity.vocabulary,
        canonicalLink: '',
        type: payload.entity.type,
        label: payload.entity.label,
        description: payload.entity.description,
        sameAs: payload.entity.sameAs,
        externalResources: payload.entity.externalResources,
        data: {}
      };
      entityService.createEntity(entity.vocabulary, entity).then((entity) => {
        if (entity) {
          state.entities.set(entity.id, entity);
        }
      });
    },
    EDITENTITY(
      state,
      payload: {
        vocabID: string;
        entity: {
          type: TagType;
          label: string;
          description: string;
          externalResources: string[];
          sameAs: string[];
        };
      }
    ) {
      state.entity = {
        vocabulary: payload.vocabID,
        ...payload.entity
      };
    },
    UPDATEENTITY(state, payload: {entity: Entity}) {
      entityService.updateEntity(payload.entity).then((entity) => {
        if (entity?.id) {
          state.entities.set(entity.id, entity);
        }
      });
    },
    DELETEENTITY(state, payload: {entity: Entity}) {
      entityService.deleteEntity(payload.entity).then((entity) => {
        if (entity) {
          state.entities.delete(entity.id);
        }
      });
    },
    CLEAR(state) {
      state.entities.clear();
      state.entity = undefined;
      state.pageable = {offset: 0, totalItems: 0, rows: 0};
      state.searchText = '';
      state.vocabId = '';
      state.type = '';
    }
  },
  actions: {
    loadEntityList({commit}, payload) {
      commit('LOADENTITYLIST', payload);
    },
    loadNextPage({commit}) {
      commit('LOADNEXTENTITYPAGE');
    },
    getEntity({commit}, payload) {
      commit('GETSPECIFICENTITY', payload);
    },
    createEntity({commit}, payload) {
      commit('CREATEENTITY', payload);
    },
    editEntity({commit}, payload) {
      commit('EDITENTITY', payload);
    },
    updateEntity({commit}, payload) {
      commit('UPDATEENTITY', payload);
    },
    deleteEntity({commit}, payload) {
      commit('DELETEENTITY', payload);
    },
    clear({commit}) {
      commit('CLEAR');
    }
  },
  getters: {
    entities: (state) =>
      Array.from<Entity>(state.entities.values()).sort((t1: Entity, t2: Entity) => Date.parse(t1.created) - Date.parse(t2.created)),
    entity: (state) => state.entity
  }
};
