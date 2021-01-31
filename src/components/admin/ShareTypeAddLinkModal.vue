<template>
  <Modal
    title="Add and Link Share Types"
    okLabel="Close"
    customClass="large"
    okButtonClass=""
    :show="show"
    @ok.prevent="handleOk"
    @cancel.prevent="handleOk"
    :handleEnter="false"
  >
    <div class="share-type-form">
      <div class="share-type-form--fieldset">
        <label :for="`share-type-form__name--${id}`">Name</label>
        <input type="text" ref="inputElement" :id="`share-type-form__name--${id}`" v-model="input" />
      </div>
      <div class="share-type-form--fieldset">
        <label :for="`share-type-form__rate--${id}`">Dividend Rate</label>
        <p class="help-text">Specify the dividend rate in percent.</p>
        <input type="text" :id="`share-type-form__rate--${id}`" v-model="rate" />
      </div>
      <button class="primary">Add</button>
    </div>

    <div class="share-type-link">
      <share-type-multiselect
        :shareTypes="shareTypes"
        :loading="loading"
        v-model="selected"
        prompt="Use the form above to add a new Share Type, and link it here."
      />

      <button class="share-type-link__button primary">Link Selected</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, ref, computed } from 'vue';
import instanceStore from '@/store/instance';
import { setup as setupShareTypeStore } from '@/store/shareType';
import Modal from '@/components/Modal.vue';
import uuid4 from '@/utils/uuid4';

export default defineComponent({
  components: {
    Modal,
    ShareTypeMultiselect: defineAsyncComponent(() => import('@/components/ShareTypeMultiselector.vue')),
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'ok',
  ],
  setup(_, { emit }) {
    const shareTypeStore = setupShareTypeStore(instanceStore, false);
    const selected = ref<ShareType[]>([]);
    const input = ref('');
    const rate = ref(0.00);
    const id = uuid4();

    // Filter share types that are already in the selected instance
    const shareTypes = computed(() => (
      shareTypeStore.shareTypes.value.filter((s) => (
        s.shareTypeInstances.findIndex(
          (instance) => (instanceStore.selected.value?.id ?? -1) !== instance.instanceId,
        )
      ))
    ));

    function handleOk() { emit('ok'); }

    return {
      selected,
      shareTypes,
      loading: shareTypeStore.loading,
      handleOk,
      input,
      rate,
      id,
    };
  },
});
</script>

<style lang="scss">
$size: 35rem;

.share-type-form {
  @include round-border();

  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: $size;
  margin: 0px auto;
  padding: 1em;

  &--fieldset input {
    width: 100%;
  }

  & button {
    margin: 0;
  }
}

.share-type-link {
  margin-top: 1em;
  display: flex;
  flex-direction: column;
  max-width: $size;
  margin: 1em auto 0em auto;

  &__button.primary {
    align-self: flex-end;
    width: 100%;
    margin: 0.5em 0 0 0;
  }
}
</style>
