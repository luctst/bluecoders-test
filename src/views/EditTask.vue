<template>
  <div class="app">
    <Loader v-if="!dataLoaded"/>
    <main>
      <header class="container">
        <div class="row">
          <div class="col-12 d-flex align-items-center">
            <router-link to="/">Go back</router-link>
            <h1 class="h4">{{task.title}}</h1>
          </div>
        </div>
      </header>
    </main>
  </div>
</template>

<script>
import Loader from '@/components/Loader.vue';
import { mapState } from 'vuex';

export default {
  components: {
    Loader,
  },
  computed: {
    ...mapState(['jwt']),
  },
  data() {
    return {
      dataLoaded: false,
      task: {},
    };
  },
  created() {
    this.fetchData();
  },
  watch: {
    $route: 'fetchData',
  },
  methods: {
    fetchData() {
      return fetch(`http://localhost:3000/api/tasks/${this.$route.params.id}`, {
        headers: {
          authorization: `Bearer ${this.jwt}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            this.dataLoaded = true;
            this.task = { ...data.task };
            return null;
          }

          return null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
main {
  margin-top: 6%;

  header {
    p {
      margin-bottom: 0;
    }

    h1 {
      text-align: center;
      width: 100%;
    }
  }
}
</style>
