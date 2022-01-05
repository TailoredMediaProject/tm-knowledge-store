import {Module} from 'vuex';
import {Pageable, Vocabulary} from '@/openapi';
import {VocabularyService} from '@/services/VocabularyService';
import {VocabList} from '@/Objects/VocabList';

const vocabService = new VocabularyService('./api/v1');
const arrayToMap = (array: Vocabulary[]): Map<string, Vocabulary> => {
  return new Map<string, Vocabulary>(
    array.map((task: Vocabulary) => [task.id, task])
  );
};

export const vocabStore: Module<any, any> = {
  namespaced: true,
  state: () => ({
    vocabularies: new Map<string, Vocabulary>(),
    pageable: <Pageable> { offset: 0, totalItems: 0, rows: 0 },
    searchText: '',
    vocabulary: undefined
  }),
  mutations: {
    LOADVOCABLIST(
      state,
      payload: { searchText?: string; page?: number; rowCount?: number }
    ) {
      vocabService
        .getVocabs(payload.searchText, payload.page, payload.rowCount)
        .then((list: VocabList | undefined) => {
          if (list && list.vocabs.length > 0) {
            state.vocabularies = arrayToMap(list.vocabs);
            state.pageable = list.pageable;
            state.searchText = payload.searchText;
          }
        });
    },
    LOADNEXTVOCABPAGE(state) {
      const nextPage = state.pageable.offset + state.pageable.rows;
      if (
        state.pageable.totalItems > 0 &&
        nextPage < state.pageable.totalItems
      ) {
        const range = state.pageable.totalItems - nextPage;
        const nextRowCount =
          range > state.pageable.rows ? state.pageable.rows : range;
        const searchText =
          state.searchText && state.searchText !== ''
            ? state.searchText
            : undefined;
        vocabService
          .getVocabs(searchText, nextPage, nextRowCount)
          .then((list) => {
            if (list && list.vocabs.length > 0) {
              state.vocabularies = new Map<string, Vocabulary>(
                ...state.vocabularies,
                arrayToMap(list.vocabs)
              );
              state.pageable = list.pageable;
            }
          });
      } else {
        console.log('Last Page');
      }
    },
    GETSPECIFICVOCAB(state, payload: { objectID: string }) {
      vocabService.getVocab(payload.objectID).then((vocab) => {
        if (vocab) {
          state.vocabularies.set(vocab.id, vocab);
        }
      });
    },
    CREATEVOCAB(state, payload: { label?: string; description?: string }) {
      vocabService
        .createVocab(payload.label, payload.description)
        .then((vocab) => {
          if (vocab) {
            state.vocabularies.set(vocab.id, vocab);
          }
        });
    },
    EDITVOCAB(state, payload: { vocabulary?: Vocabulary }) {
      state.vocabulary = payload.vocabulary;
    },
    UPDATEVOCAB(state, payload: { label?: string; description?: string }) {
      state.vocabulary.label = payload.label;
      state.vocabulary.description = payload.description;
      vocabService
        .updateVocab(state.vocabulary)
        .then((vocab: Vocabulary | undefined) => {
          if (vocab) {
            state.vocabularies.set(vocab.id, vocab);
          }
        });
    },
    DELETEVOCAB(state, payload: { vocabulary: Vocabulary }) {
      vocabService
        .deleteVocab(payload.vocabulary)
        .then((vocab: Vocabulary | undefined) => {
          if (vocab) {
            state.vocabularies.delete(vocab.id);
          }
        });
    }
  },
  actions: {
    loadVocabList({ commit }, payload) {
      commit('LOADVOCABLIST', payload);
    },
    loadNextPage({ commit }) {
      commit('LOADNEXTVOCABPAGE');
    },
    getVocab({ commit }, payload) {
      commit('GETSPECIFICVOCAB', payload);
    },
    createVocab({ commit }, payload) {
      commit('CREATEVOCAB', payload);
    },
    editVocab({ commit }, payload) {
      commit('EDITVOCAB', payload);
    },
    updateVocab({ commit }, payload) {
      commit('UPDATEVOCAB', payload);
    },
    deleteVocab({ commit }, payload) {
      commit('DELETEVOCAB', payload);
    }
  },
  getters: {
    vocabularies: (state) =>
      Array.from<Vocabulary>(state.vocabularies.values()).sort(
        (t1: Vocabulary, t2: Vocabulary) =>
          Date.parse(t1.created) - Date.parse(t2.created)
      ),
    vocabulary: (state) => state.vocabulary
  }
};
