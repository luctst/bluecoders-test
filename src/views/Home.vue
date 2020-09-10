<template>
  <div id="app">
    <Loader v-if="!dataLoaded"/>
    <template>
      <main class="container">
        <section class="row">
          <form class="col-4 pl-0 pr-0">
            <div class="form-group">
              <label>
                <small>Press enter to add your task</small>
              </label>
              <input type="text" placeholder="New task" class="form-control"/>
            </div>
          </form>
        </section>
        <section class="row mt-4">
          <section class="col-5 rounded shadow bg-white todo">
            <div class="todo--title">
              <h3 class="h5">Todo</h3>
            </div>
          </section>
          <section class="ml-3 col-5 rounded shadow bg-white done">
            <div class="done--title">
              <h3 class="h5">Done</h3>
            </div>
          </section>
        </section>
      </main>
    </template>
  </div>
</template>

<script>
import Loader from '@/components/Loader.vue';
import { mapState, mapMutations } from 'vuex';

export default {
  components: {
    Loader,
  },
  computed: mapState([
    'jwt',
  ]),
  data() {
    return {
      dataLoaded: false,
      tasks: {},
    };
  },
  methods: {
    ...mapMutations([
      'updateJwt',
      'resetStore',
    ]),
  },
  mounted() {
    return fetch('http://localhost:3000/api/tasks', {
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          if (this.jwt.length !== 0) {
            this.resetStore();
          }

          return this.$router.push('/login');
        }

        if (data.token) {
          this.updateJwt(data.token);
        }

        this.tasks = [...data.tasks];
        this.dataLoaded = true;
        return null;
      });
  },
};
</script>

<style lang="scss" scoped>
main {
  margin-top: 10%;
}
</style>
