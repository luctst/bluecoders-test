<template>
  <div class="app">
    <Loader v-if="!dataLoaded"/>
    <main>
      <header class="container">
        <div class="row">
          <div class="col-12 d-flex align-items-center">
            <router-link to="/">Go back</router-link>
            <h1 class="h4">Edit {{titleNotBind}}</h1>
          </div>
        </div>
      </header>
      <main class="container">
        <form @submit.prevent="updateTask" class="row">
          <div class="col-12">
            <div class="form-group">
              <label>
                <small>Title</small>
              </label>
              <input v-model="newTask.title" type="text" class="form-control"
              placeholder="Enter title"/>
            </div>
            <div class="form-group">
              <label>
                <small>Description</small>
              </label>
              <input v-model="newTask.description" type="text" class="form-control"
              placeholder="Enter description"/>
            </div>
            <div class="form-group">
              <label>
                <small>tags - use a ',' to separate tags</small>
              </label>
              <textarea class="form-control" v-model="newTask.tags"
              placeholder="Enter tags separate by ,"/>
            </div>
            <button type="submit" class="btn btn-primary">Update</button>
            <small
              :class="[shouldUpdated.error ? 'text-danger': 'text-success']"
              v-if="shouldUpdated.message.length !== 0">
              {{shouldUpdated.message}}
            </small>
          </div>
        </form>
      </main>
    </main>
  </div>
</template>

<script>
import Loader from '@/components/Loader.vue';
import { mapState, mapMutations } from 'vuex';

export default {
  components: {
    Loader,
  },
  computed: {
    ...mapState(['jwt']),
  },
  data() {
    return {
      shouldUpdated: {
        error: false,
        message: '',
      },
      dataLoaded: false,
      titleNotBind: '',
      task: {},
      newTask: {
        title: '',
        description: '',
        tags: [],
      },
    };
  },
  created() {
    this.fetchData();
  },
  watch: {
    $route: 'fetchData',
  },
  methods: {
    ...mapMutations(['updateJwt']),
    fetchData() {
      return fetch(`http://localhost:3000/api/tasks/${this.$route.params.id}`, {
        credentials: 'include',
        headers: {
          authorization: `Bearer ${this.jwt}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            if (data.token) {
              this.updateJwt(data.token);
            }

            this.dataLoaded = true;

            this.task = { ...data.task };

            this.newTask.title = data.task.title;
            this.newTask.description = data.task.description;
            this.newTask.tags = data.task.tags.join();

            this.titleNotBind = data.task.title;
            return null;
          }

          return this.$router.push('/login');
        });
    },
    updateTask() {
      const dataToUpdate = {};

      if (this.task.title !== this.newTask.title) {
        dataToUpdate.title = this.newTask.title;
        this.task.title = this.newTask.title;
      }

      if (this.task.description !== this.newTask.description) {
        dataToUpdate.description = this.newTask.description;
        this.task.description = this.newTask.description;
      }

      if (this.newTask.tags.length !== 0) {
        const tagsArray = this.newTask.tags.split(',');

        if (tagsArray.length !== this.task.tags.length) {
          dataToUpdate.tags = [...tagsArray];
          this.task.tags = [...tagsArray];
        }
      }

      if (Object.keys(dataToUpdate).length === 0) {
        this.shouldUpdated = {
          error: true,
          message: 'Nothing to update, try to update some fields ☝️',
        };
        return null;
      }

      this.dataLoaded = false;
      return fetch(`http://localhost:3000/api/tasks/${this.$route.params.id}`, {
        credentials: 'include',
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.jwt}`,
        },
        body: JSON.stringify({ ...dataToUpdate }),
      })
        .then(async (res) => {
          let data;

          if (res.status !== 204) {
            data = await res.json();
          }

          return {
            data,
            status: res.status,
          };
        })
        .then((newData) => {
          this.dataLoaded = true;

          if (newData.status === 502) {
            this.shouldUpdated = {
              error: true,
              message: 'oupsss.. there is an error try to reconnnect yourself.',
            };

            return null;
          }

          if (newData.status !== 204) {
            this.updateJwt(newData.data.token);
          }

          this.shouldUpdated = {
            error: false,
            message: 'Taks update :)',
          };

          this.$socket.emit('sendUpdateTask', {
            ...dataToUpdate,
            _id: this.$route.params.id,
          });
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
