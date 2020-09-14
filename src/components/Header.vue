<template>
  <header>
    <nav
      class="fixed-top navbar navbar-expand-lg navbar navbar-light"
      style="background-color: #e3f2fd;"
    >
      <router-link to="/">Bluecoders</router-link>
      <div v-if="accountData.id" class="collapse navbar-collapse" style="flex-basis:auto">
        <ul class="navbar-nav ml-auto align-items-end">
          <li class="nav-item">
            <router-link
              :to="{ path: `/user/${accountData.id}`}">
              {{accountData.mail}}
            </router-link>
          </li>
          <li class="nav-item ml-4">
            <p class="text-danger mb-0" @click="disconnect">Déconnexion</p>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  computed: mapState([
    'accountData',
    'jwt',
  ]),
  methods: {
    ...mapMutations([
      'resetStore',
    ]),
    disconnect() {
      return fetch('http://localhost:3000/api/logout', {
        credentials: 'include',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.jwt}`,
        },
      })
        .then(() => {
          this.resetStore();
          this.$router.push('/login');
          return null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  .collapse:not(.show) {
    display: flex;
  }

  nav {
    height: 8vh;
    max-height: 8vh;

    div {
      flex-basis: auto;

      ul {
        li:last-child:hover {
          cursor: pointer;
        }

        li {
          a,
          p {
            font-size: 0.8em;
          }
        }
      }
    }
  }
}
</style>
