import { createStore } from "vuex";
import { vocabStore } from "@/store/Vocab/vocabStore";

export default createStore({
  modules: {
    vocabStore: vocabStore,
  },
});
