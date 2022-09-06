<template>
  <li
    ref="element"
    class="student-selector-student"
    :class="{ highlighted: isHighlighted, selectable: !isHighlighted }"
    @click="handleClick"
  >
    <span class="student-selector-student--account-number">
      {{ student.accountNumber }}
    </span>

    <span class="student-selector-student--name">
      {{ student.lastName }}, {{ student.firstName }}
    </span>

    <span
      v-if="student.email && student.email.trim().length > 0"
      class="student-selector-student--email"
    >
      {{ student.email }}
    </span>

    <ul
      v-if="student.shares && student.shares.length > 0"
    >
      <student-selector-student-share
        v-for="share in student.shares"
        :key="share.id"
        :share="share"
      />
    </ul>
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';

// Components
import StudentSelectorStudentShare from './StudentSelectorStudentShare.vue';

export default defineComponent({
  components: {
    StudentSelectorStudentShare,
  },
  props: {
    student: {
      type: Object as PropType<Student>,
      required: true,
    },
    highlighted: {
      type: Object as PropType<Student|null>,
      default: null,
    },
  },
  emits: [
    'click',
  ],
  setup(props, { emit }) {
    const element = ref<HTMLLIElement|null>(null);

    const isHighlighted = computed(() => {
      if (!props.highlighted) return false;
      return props.highlighted.id === props.student.id;
    });

    function handleClick() {
      emit('click', props.student);
    }

    watch(() => isHighlighted.value, () => {
      if (isHighlighted.value && element.value) {
        (element.value.parentNode as HTMLElement).scrollTop = element.value.offsetTop;
      }
    }, { immediate: true });

    return {
      element,
      isHighlighted,
      handleClick,
    };
  },
});
</script>

<style lang="scss">
  .student-selector-student {
    padding: 0.5em;
    user-select: none;

    &--account-number {
      font-family: Consolas, 'Courier New', Courier, monospace;

      &::after {
        content: ' ';
      }
    }

    &--email {
      display: block;
    }

    &:hover, &.highlighted {
      background-color: colorStep(button-secondary);
    }

    &:hover.highlighted {
      background-color: colorStep(button-secondary, $step: 2);
    }

    &.selectable {
      cursor: pointer;
    }

    ul {
      list-style: none;
      margin-top: 0.5em;
    }
  }
</style>
