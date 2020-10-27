<template>
  <div class="group-list">
    <ul v-if="GroupStore.groups.length > 0">
      <li
        class="group-list__item"
        v-for="group in GroupStore.groups"
        :key="group.id"
        :class="{ 'group-list__item--selected': GroupStore.selectedGroup && GroupStore.selectedGroup.id === group.id }"
        @click="select(group)"
      >
        <p class="group-list__item__name">{{group.name}}</p>

        <div class="group-list__item__buttons">
          <button class="group-list__item__buttons__rename">~</button>
          <button class="group-list__item__buttons__delete">&minus;</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Group from '@/@types/Group';
import InstanceStore from '@/store/modules/instance';
import GroupStore from '@/store/modules/group';
import { watchEffect } from 'vue';

export default {
  setup() {
    watchEffect(() => {
      if (InstanceStore.selectedInstance !== null) {
        GroupStore.fetchGroups({
          instanceId: InstanceStore.selectedInstance.id,
        });
      }
    });

    function select(group: Group) {
      GroupStore.setSelectedGroup(group);
    }

    return {
      GroupStore,
      select,
    };
  },
};
</script>

<style lang="scss">
div.group-list {
  margin-top: 0.5em;

  & ul {
    margin: 0;
    width: 100%;

    .group-list__item {
      display: flex;
      justify-content: space-between;
      margin: 0.15em 0;
      padding: 0.15em 0.25em 0.15em 0.25em;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      list-style: none;
      border-radius: 3px;

      & .group-list__item__name { flex-grow: 1; }

      &:hover {
        $step: map.get($theme, accent1, step);
        background-color: lighten(
          map.get($theme, accent1, color),
          $step * 8
        )
      }

      &.group-list__item--selected {
        color: map.get($theme, accent1, font-color);
        background-color: map.get($theme, accent1, color);
      }

      &:hover .group-list__item__buttons {
        opacity: 1;
        transition-property: opacity;
        transition-duration: 250ms;
      }

      & .group-list__item__buttons {
        opacity: 0;
        transition-delay: 1s;
        transition-property: opacity;
        transition-duration: 250ms;

        & button {
          min-width: 20px;
          outline: 0;
          border-radius: 3px;
          color: map.get($theme, button-secondary, font-color);
          background-color: map.get($theme, button-secondary, color);
          cursor: pointer;
          border: 1px solid darken(
            map.get($theme, button-secondary, color),
            map.get($theme, button-secondary, step)
          );

          &:hover {
            background-color: darken(
              map.get($theme, button-secondary, color),
              map.get($theme, button-secondary, step)
            );

            border: 1px solid darken(
              map.get($theme, button-secondary, color),
              map.get($theme, button-secondary, step) * 2
            );
          }

          &:active {
            background-color: darken(
              map.get($theme, button-secondary, color),
              map.get($theme, button-secondary, step) * 2
            );

            border: 1px solid darken(
              map.get($theme, button-secondary, color),
              map.get($theme, button-secondary, step) * 3
            );
          }

          &.group-list__item__buttons__delete {
            margin-left: 0.25em;
            color: map.get($theme, button-destructive, font-color);
            background-color: map.get($theme, button-destructive, color);
            border-color: darken(
              map.get($theme, button-destructive, color),
              map.get($theme, button-destructive, step) * 2
            );

            &:hover {
              background-color: darken(
                map.get($theme, button-destructive, color),
                map.get($theme, button-destructive, step)
              );

              border-color: darken(
                map.get($theme, button-destructive, color),
                map.get($theme, button-destructive, step) * 2
              );
            }

            &:active {
              background-color: darken(
                map.get($theme, button-destructive, color),
                map.get($theme, button-destructive, step) * 2
              );

              border-color: darken(
                map.get($theme, button-destructive, color),
                map.get($theme, button-destructive, step) * 3
              );
            }
          }
        }
      }
    }
  }
}
</style>
