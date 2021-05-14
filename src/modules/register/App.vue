<template>
  <div class="registration-card">
    <h1>Student Registration</h1>

    <form @submit.prevent>
      <fieldset class="registration-card__step-1">
        <div class="fieldset">
          <label for="registration-card--invite-code">Invite Code</label>
          <input
            id="registration-card--invite-code"
            v-model="inviteCode"
            type="text"
            name="inviteCode"
          />
        </div>

        <div class="fieldset">
          <label for="registration-card--account-number">Student ID</label>
          <input
            id="registration-card--account-number"
            v-model="accountNumber"
            type="text"
            name="accountNumber"
          />
        </div>

        <div class="buttons">
          <button
            type="button"
            class="primary"
          >
            Next
          </button>
        </div>
      </fieldset>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  setup() {
    const inviteCode = ref('');
    const accountNumber = ref('');

    onMounted(() => {
      const params = new URLSearchParams(window.location.search);
      const urlInviteCode = params.get('i');

      if (!urlInviteCode) return;
      if (!urlInviteCode.match(/[A-Za-z0-9]/)) return;
      inviteCode.value = urlInviteCode;
    });

    return {
      inviteCode,
      accountNumber,
    };
  },
});
</script>

<style lang="scss">
  @import "./scss/index.scss";

  .registration-card {
    width: 95vw;
    margin-top: 3em;
    padding: 3em;

    background-color: map.get($theme, primary, color);
    border-radius: 0.5rem;
    border: 1px solid colorStep(primary, $step: 3);

    h1 {
      line-height: 1.5;
      margin: 0 0 1em 0;
    }

    &__step-1 {
      border: none;
    }

    .fieldset {
      display: flex;
      flex-direction: column;
    }

    .fieldset + .fieldset {
      margin-top: 1.25em;
    }

    .buttons {
      margin-top: 3em;
      text-align: right;
    }

    @media (min-width: 800px) {
      width: 600px;
      box-shadow: 5px 10px 10px 0px rgba(30, 30, 30, 0.1);
    }
  }
</style>
