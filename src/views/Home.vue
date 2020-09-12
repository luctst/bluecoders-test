<template>
  <div id="app">
    <Loader v-if="!dataLoaded" />
    <template>
      <main class="container">
        <section class="row">
          <form class="col-4 pl-0 pr-0" @submit.prevent="addTask">
            <div class="form-group">
              <label>
                <small>Press enter to add your task</small>
              </label>
              <input
                type="text"
                placeholder="New task"
                :class="['form-control', errorAddTask && 'border-danger']"
                ref="inputTask"
              />
              <small
                class="text-danger"
                v-if="errorAddTask">Oups il y a un petit probléme essayez de vous déco / reco.
              </small>
            </div>
          </form>
        </section>
        <section class="row mt-4">
          <section class="col-5 pt-2 rounded shadow todo">
            <h3>Todo</h3>
            <div class="todo--card" v-for="(task, index) in tasks" :key="index">
              <router-link :to="{path: `/task/${task._id}`}" v-if="task.status === 'todo'">
                <div class="todo--card--tags">
                  <span v-for="(tag, i) in task.tags" :key="i">{{tag}}</span>
                </div>
                <h4>{{task.title}}</h4>
                <p
                  v-if="task.description.length !== 0"
                  class="text-muted small"
                >{{task.description}}</p>
                <div class="todo--card--metadata">
                  <small>{{task.author}}</small>
                  <small
                    class="text-muted"
                  >
                  {{new Date(task.created).getDate()}}/
                  {{new Date(task.created).getMonth()}}/{{new Date(task.created).getFullYear()}}
                  </small>
                </div>
                <small
                  @click.prevent="deleteTask(task._id)"
                  v-if="accountData.mail === task.author"
                  class="border rounded p-1 border-danger text-center bg-danger text-white">
                  Delete
                </small>
              </router-link>
            </div>
          </section>
          <section class="ml-3 col-5 pt-2 rounded shadow done">
            <h3>Done</h3>
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
  computed: mapState(['jwt', 'accountData']),
  data() {
    return {
      errorAddTask: false,
      dataLoaded: false,
      tasks: {},
    };
  },
  methods: {
    ...mapMutations(['updateJwt', 'resetStore']),
    deleteTask(taskId) {
      return fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        credentials: 'include',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.jwt}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) return null;

          if (data.token) {
            this.updateJwt(data.token);
          }

          this.tasks = [...data.tasks];
          return null;
        });
    },
    addTask() {
      if (this.$refs.inputTask.value.length === 0) return false;

      return fetch('http://localhost:3000/api/tasks', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.jwt}`,
        },
        body: JSON.stringify(
          {
            title: this.$refs.inputTask.value,
            author: this.accountData.mail,
          },
        ),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            this.errorAddTask = true;
            return null;
          }

          if (data.token) {
            this.updateJwt(data.token);
          }

          if (this.errorAddTask) {
            this.errorAddTask = false;
          }

          this.tasks = [...data.tasks];
          this.$refs.inputTask.value = '';
          return null;
        });
    },
  },
  mounted() {
    return fetch('http://localhost:3000/api/tasks', {
      credentials: 'include',
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
  margin-top: 8%;

  section {
    .todo,
    .done {
      background-color: #ebecf0;
      overflow: auto;

      h3 {
        color: #172b4d;
        font-size: 0.9em;
      }

      &--card {
        margin-bottom: 8px;

        :hover {
          background-color: #f4f5f7;
        }

        a {
          background-color: #fff;
          border-radius: 3px;
          box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
          display: inline-block;
          padding: 6px 8px 8px;
          width: 100%;

        }

        a:hover {
          text-decoration: none;
        }

        &--tags {
          span {
            background-color: #f1f8ff;
            border: 1px solid transparent;
            border-radius: 2em;
            color: #0366d6;
            font-size: 12px;
            font-weight: 500;
            margin-right: 2%;
            padding: 0 10px;
          }
        }

        h4 {
          color: #172b4d;
          font-size: 1.1em;
          margin-top: 20px;
        }

        p {
          margin-bottom: 2px;
        }

        &--metadata {
          display: flex;
          margin: 12px 0;
          justify-content: space-between;
        }
      }
    }
  }
}
</style>
