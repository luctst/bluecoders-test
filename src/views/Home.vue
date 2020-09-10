<template>
  <div id="app">
    <Loader v-if="!dataLoaded"/>
    <template></template>
  </div>
</template>

<script>
import Loader from '@/components/Loader.vue';

export default {
  components: {
    Loader,
  },
  data() {
    return {
      dataLoaded: false,
      tasks: {},
    };
  },
  mounted() {
    return fetch('http://localhost:3000/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          return this.$router.push('/login');
        }

        this.tasks = { ...data.tasks };
        return null;
      });
  },
};
</script>
