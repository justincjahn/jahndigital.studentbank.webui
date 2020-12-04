/* eslint-disable class-methods-use-this */
import {
  Module,
  VuexModule,
  Mutation,
  getModule,
} from 'vuex-module-decorators';
import store from '@/store';

@Module({ dynamic: true, store, name: 'global' })
class GlobalState extends VuexModule implements State.IGlobalState {
  topmostModal: HTMLElement | null = null;

  openModals: HTMLElement[] = [];

  currentError: string | null = null;

  /**
   * Set the current error message, or turn it off.
   *
   * @param error The error message.
   */
  @Mutation
  setCurrentError(error: string|null) {
    this.currentError = error;
  }

  /**
   * Add the provided modal element to the list of open modals.
   *
   * @param el The modal element to add.
   */
  @Mutation
  openModal(el: HTMLElement) {
    const index = this.openModals.findIndex((x: HTMLElement) => x === el);

    if (index < 0) {
      const openModals = [...this.openModals as HTMLElement[], el];
      this.openModals = openModals;
    }
  }

  /**
   * Remove the provided modal element from the list of open modals.
   *
   * @param el The modal element to remove.
   */
  @Mutation
  closeModal(el: HTMLElement) {
    const index = this.openModals.findIndex((x) => x === el);
    if (index < 0) return;
    this.openModals = this.openModals.filter((x) => x !== el);
  }

  /**
   * Get the topmost modal element.
   */
  get topModal(): HTMLElement|null {
    if (this.openModals.length === 0) return null;
    return this.openModals[this.openModals.length - 1];
  }
}

const GlobalModule = getModule(GlobalState);
export default GlobalModule;
