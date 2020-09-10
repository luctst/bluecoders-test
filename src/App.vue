<template>
    <section>
      <Header />
      <router-view/>
    </section>
</template>

<script>
import Header from '@/components/Header.vue';

export default {
  components: {
    Header,
  },
};
</script>
