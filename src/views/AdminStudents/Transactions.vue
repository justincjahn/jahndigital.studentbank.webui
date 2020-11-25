<template>
  <div class="student-transactions">
    <table class="student-transactions__share-list">
      <thead>
        <tr>
          <th>Name</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="share in StudentStore.selectedStudent.shares" :key="share.id">
          <th>{{share.shareType.name}}</th>
          <td>${{share.balance}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import StudentStore from '@/store/modules/student';

export default {
  setup() {
    return {
      StudentStore,
    };
  },
};
</script>

<style lang="scss">
.student-transactions {
  width: 80%;
  margin: 0px auto;

  &__share-list {
    width: 100%;
    border-spacing: 0;
    margin: 0.25em;
    border: 1px solid colorStep(primary, $step: 8);
    border-radius: 0.25rem;

    & tr {
      text-align: left;
    }

    & tr :first-child{
      padding-left: 0.5em;
    }

    & th:last-child,
    & td:last-child
    {
      text-align: right;
      padding-right: 0.5em;
    }

    & thead th {
      padding: 0.25em 0.25em;
    }

    & tbody tr {
      cursor: pointer;

      & td {
        padding: 0.5em 0.25em;
        user-select: none;

        &.student-list__select-group {
          text-align: left;
        }
      }

      &:nth-child(even) {
        $bgcolor: colorStep(secondary, $step: 0, $darken: false);
        background-color: $bgcolor;

        color: chooseColor(
          $bgcolor,
          map.get($theme, secondary, font-color),
          map.get($theme, secondary, font-color-alt)
        );
      }

      &:hover {
        $bgcolor: colorStep(secondary, $step: 3, $darken: true);
        background-color: $bgcolor;

        color: chooseColor(
          $bgcolor,
          map.get($theme, secondary, font-color),
          map.get($theme, secondary, font-color-alt)
        );
      }
    }
  }
}
</style>
