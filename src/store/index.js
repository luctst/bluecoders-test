import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    jwt: '',
    accountData: {},
  },
  mutations: {
    connected(state, data) {
      state.jwt = data.jwt;
      state.accountData = { ...data };

      delete state.accountData.jwt;
    },
    resetStore(state) {
      state.jwt = '';
      state.accountData = {};
    },
    updateJwt(state, newJWt) {
      state.jwt = newJWt;
    },
  },
  actions: {
  },
});
