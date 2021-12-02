import { Module } from "vuex";
import {Entity, Pageable} from "@/openapi";

export const entityStore: Module<any, any> = {
  state: () => ({
    entities: new Map<string, Entity>(),
    pageable: <Pageable>{},
  }),
  mutations: {
    /*LOADENTITYLIST(state, payload) {},
    LOADNEXTENTITYPAGE(state) {},*/
  },
  actions: {
    loadVocabList({ commit }, payload) {
      commit("LOADENTITYLIST", payload);
    },
    loadNextPage({ commit }) {
      commit("LOADNEXTENTITYPAGE");
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
