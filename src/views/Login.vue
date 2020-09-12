<template>
  <main class="container">
    <form
    :class="['rounded', 'border' , errorApi.length !== 0 ? 'border-danger' : 'border-primary']"
    @submit="logUser">
      <h1 class="h6 mt-4 mb-4">
        {{
          this.$route.name === 'login' ?
            'Connectez-vous'
          : 'Créer un compte'
        }}
      </h1>
      <div class="form-group">
        <label><small>Mail</small></label>
        <input type="mail"
        :class="['form-control', 'pseudo--user', errorInputs['mail'].error && 'border-danger']"
        id="mail"
        ref="inputMail"
        @input="checkInputValue" @blur="checkInputValue">
        <small v-if="errorInputs.mail.error" class="text-danger">
          {{errorInputs.mail.message}}
        </small>
      </div>
      <div class="form-group">
        <label><small>Password</small></label>
        <input
        type="password"
        :class="['form-control', 'pseudo--user', errorInputs['password'].error && 'border-danger']"
        id="password"
        ref="inputPassword" @input="checkInputValue" @blur="checkInputValue">
        <small v-if="errorInputs.password.error" class="text-danger">
          {{errorInputs.password.message}}
        </small>
      </div>
      <button
      type="submit"
      class="btn btn-primary inscription--btn mb-auto"
      :disabled="btnDisabled ? true : false">
        {{this.$route.name === 'login' ? 'Connexion' : 'Créer un compte'}}
      </button>
      <p class="text-danger" v-if="errorApi.length !== 0">{{errorApi}}</p>
      <div class="form-group mt-2">
        <small
        v-if="this.$route.name === 'login'">
          Pas de compte ? <router-link to="/register">Cliquez ici</router-link>
        </small>
        <small v-else>Déja un compte ? <router-link to="/login">Connexion</router-link></small>
      </div>
    </form>
  </main>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      errorApi: '',
      btnDisabled: true,
      errorInputs: {
        mail: {
          error: false,
          message: '',
          accessToChange: false,
        },
        password: {
          error: false,
          message: '',
          accessToChange: false,
        },
      },
    };
  },
  methods: {
    ...mapMutations({
      mapAccountDataToStore: 'connected',
    }),
    logUser(e) {
      e.preventDefault();

      return fetch(`http://localhost:3000/api${this.$route.path}`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          mail: this.$refs.inputMail.value,
          password: this.$refs.inputPassword.value,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            if (data.message === 'Conflict') {
              this.errorApi = 'Already a session for this user';
              return null;
            }

            this.errorApi = data.message;
            return null;
          }

          this.mapAccountDataToStore({
            id: data.id,
            mail: this.$refs.inputMail.value,
            jwt: data.token,
          });
          this.$router.push('/');
          return null;
        });
    },
    checkInputValue(e) {
      if (e.type === 'input') {
        if (!this.errorInputs[e.target.id].accessToChange) return null;
      }

      if (e.target.value === '') {
        if (this.errorInputs[e.target.id].accessToChange) {
          return this.updateInputs(e.target.id, 'Field empty');
        }

        return null;
      }

      if (e.target.id === 'mail') {
        if (/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(e.target.value) === false) {
          return this.updateInputs(e.target.id, 'Format mail incorrect');
        }
      }

      if (e.target.id === 'password') {
        if (e.target.value.length < 5) {
          return this.updateInputs(e.target.id, 'Le mot de passe doit faire 6 charactères');
        }
      }

      if (!this.errorInputs[e.target.id].accessToChange) {
        this.errorInputs[e.target.id].accessToChange = true;
      }

      this.errorInputs[e.target.id].error = false;
      this.errorInputs[e.target.id].message = '';

      if (this.$refs.inputMail.value !== '' && this.$refs.inputPassword.value !== '') {
        const btnEnabled = Object.values(this.errorInputs).every((el) => !el.error);

        if (btnEnabled) {
          this.btnDisabled = false;
        } else {
          this.btnDisabled = true;
        }
      }

      return null;
    },
    updateInputs(inputId, errorMessage) {
      this.errorInputs[inputId].error = true;
      this.errorInputs[inputId].message = errorMessage;

      if (!this.errorInputs[inputId].accessToChange) {
        this.errorInputs[inputId].accessToChange = true;
      }

      if (!this.btnDisabled) {
        this.btnDisabled = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
main {
  align-items: center;
  display: flex;
  justify-content: center;
  height: 100vh;
  max-height: 100vh;

  form {
    padding: 0 3rem 3rem 3rem;
  }
}
</style>
