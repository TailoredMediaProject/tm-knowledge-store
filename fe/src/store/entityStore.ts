import { EntityService } from "@/services/EntityService";
import { Entity, Pageable, TagType } from "@/openapi";
import { Module } from "vuex";
import { EntityList } from "@/Objects/EntityList";

const entityService = new EntityService();
const arrayToMap = (array: Entity[]): Map<string, Entity> => {
  return new Map<string, Entity>(array.map((task: Entity) => [task.id, task]));
};

export const entityStore: Module<any, any> = {
  namespaced: true,
  state: () => ({
    entities: new Map<string, Entity>(),
    pageable: <Pageable>{ offset: 0, totalItems: 0, rows: 0 },
    searchText: "",
    vocabID: "",
    tagType: [],
  }),
  mutations: {
    LOADENTITYLIST(
      state,
      payload: {
        vocabID: string;
        searchText?: string;
        tagType?: Array<TagType>;
        page?: number;
        rowCount?: number;
      }
    ) {
      entityService
        .getEntities(
          payload.vocabID,
          payload.searchText,
          payload.tagType,
          payload.page,
          payload.rowCount
        )
        .then((list: EntityList | undefined) => {
          if (list && list.entities.length > 0) {
            state.entities = arrayToMap(list.entities);
            state.pageable = list.pageable;
            state.searchText = payload.searchText;
            state.vocabID = payload.vocabID;
            state.tagType = payload.tagType;
          }
        });
    },
    LOADNEXTENTITYPAGE(state) {
      const nextPage = state.pageable.offset + state.pageable.rows;
      if (
        (state.vocabID && state.vocabID !== "",
        state.pageable.totalItems > 0 && nextPage < state.pageable.totalItems)
      ) {
        const range = state.pageable.totalItems - nextPage;
        const nextRowCount =
          range > state.pageable.rows ? state.pageable.rows : range;
        const searchText =
          state.searchText && state.searchText !== ""
            ? state.searchText
            : undefined;
        entityService
          .getEntities(
            state.vocabID,
            searchText,
            state.tagType,
            nextPage,
            nextRowCount
          )
          .then((list) => {
            if (list && list.entities.length > 0) {
              state.entities = new Map<string, Entity>(
                ...state.entities,
                arrayToMap(list.entities)
              );
              state.pageable = list.pageable;
            }
          });
      }
    },
    GETSPECIFICENTITY(state, payload: { vocabID: string; objectID: string }) {
      entityService
        .getEntity(payload.vocabID, payload.objectID)
        .then((entity) => {
          if (entity) {
            state.entities.set(entity.id, entity);
          }
        });
    },
    CREATEENTITY(
      state,
      payload: {
        vocabID: string;
        entity: {
          tagType: TagType;
          label: string;
          description: string;
          externalResources: string[];
          sameAs: string[];
        };
      }
    ) {
      const entity: Entity = {
        id: "",
        created: "",
        lastModified: "",
        vocabulary: payload.vocabID,
        canonicalLink: "",
        type: payload.entity.tagType,
        label: payload.entity.label,
        description: payload.entity.description,
        sameAs: payload.entity.sameAs,
        externalResources: payload.entity.externalResources,
        data: {},
      };
      console.log(entity);
      entityService.createEntity(payload.vocabID, entity).then((entity) => {
        if (entity) {
          state.entities.set(entity.id, entity);
        }
      });
    },
    UPDATEENTITY(state, payload: { vocabID: string; entity: Entity }) {
      entityService
        .updateEntity(payload.vocabID, payload.entity)
        .then((entity) => {
          if (entity) {
            state.entities.set(entity.id, entity);
          }
        });
    },
    DELETEENTITY(state, payload: { entity: Entity }) {
      entityService.deleteEntity(payload.entity).then((entity) => {
        if (entity) {
          state.entities.delete(entity.id);
        }
      });
    },
  },
  actions: {
    loadEntityList({ commit }, payload) {
      commit("LOADENTITYLIST", payload);
    },
    loadNextPage({ commit }) {
      commit("LOADNEXTENTITYPAGE");
    },
    getEntity({ commit }, payload) {
      commit("GETSPECIFICENTITY", payload);
    },
    createEntity({ commit }, payload) {
      commit("CREATEENTITY", payload);
    },
    updateEntity({ commit }, payload) {
      commit("UPDATEENTITY", payload);
    },
    deleteEntity({ commit }, payload) {
      commit("DELETEENTITY", payload);
    },
  },
  getters: {
    entities: (state) =>
      Array.from<Entity>(state.entities.values()).sort(
        (t1: Entity, t2: Entity) =>
          Date.parse(t1.created) - Date.parse(t2.created)
      ),
  },
};
