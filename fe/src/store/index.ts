import { createStore } from "vuex";
import { vocabStore } from "@/store/vocabStore";
import { entityStore } from "@/store/entityStore";

export default createStore({
  modules: {
    vocabStore: vocabStore,
    entityStore: entityStore,
  },
});
