import { Module } from "vuex";
import { Pageable, Vocabulary } from "@/openapi";

export const vocabStore: Module<any, any> = {
  state: () => ({
    entities: new Map<string, Vocabulary>(),
    pageable: <Pageable>{},
  }),
  mutations: {
    /*LOADVOCABLIST(state, payload) {},
    LOADNEXTVOCABPAGE(state) {},*/
  },
  actions: {
    loadVocabList({ commit }, payload) {
      commit("LOADVOCABLIST", payload);
    },
    loadNextPage({ commit }) {
      commit("LOADNEXTVOCABPAGE");
    },
  },
  getters: {
    entities: (state) =>
      Array.from<Vocabulary>(state.entities.values()).sort(
        (t1: Vocabulary, t2: Vocabulary) =>
          Date.parse(t1.created) - Date.parse(t2.created)
      ),
  },
};
