<template>
  <div class="student-search">
    <form>
      <label for="student-search__input__input">Search</label>

      <div class="student-search__input">
        <span class="student-search__input__reset-wrapper">
          <input type="text" id="student-search__input__input" />
          <input type="reset" value="X" />
        </span>

        <ul class="student-search__input__results">
          <li class="student-search__input__results__item">Hello</li>
          <li class="student-search__input__results__item">World</li>
          <li class="student-search__input__results__item">Yeah</li>
        </ul>
      </div>
    </form>
  </div>

  <div class="student-info">
    <form @submit.prevent>
      <div class="student-info--form-group">
        <label for="student-info__account-number">Account Number</label>
        <input type="text" id="student-info__account-number" />
      </div>
      <div class="student-info--form-group">
        <label for="student-info__email">Email</label>
        <input type="text" id="student-info__email" />
      </div>
      <div class="student-info--form-group">
        <label for="student-info__first-name">First Name</label>
        <input type="text" id="student-info__first-name" />
      </div>
      <div class="student-info--form-group">
        <label for="student-info__last-name">Last Name</label>
        <input type="text" id="student-info__last-name" />
      </div>
    </form>
    <div class="student-info--submit-group">
      <input type="submit" class="primary" value="Update" />
    </div>
  </div>

  <section class="sub-nav sub-nav--padded">
    <a href="#">Transactions</a>
    <a href="#">Stocks</a>
    <a href="#">Purchases</a>
  </section>

  <div class="student-transactions">
    Hello World!
  </div>
</template>

<script>
export default {

};
</script>

<style lang="scss">
  .student-search {
    margin: 0 1.5em;

    label[for=student-search__input__input] {
      padding-right: 1em;
      margin: auto 0;
    }

    & form {
      display: flex;
      flex-direction: column;
    }

    &__input {
      position: relative;

      &__reset-wrapper {
        width: 100%;
        display: inline-block;

        input[type=reset] {
          @include input-reset;
        }
      }

      &__results {
        display: none;
        position: absolute;
        z-index: 1;
        list-style: none;
        margin: 0;
        width: 100%;

        background-color: map.get($theme, button-secondary, color);
        border: 1px solid colorStep(button-secondary, $step: 2);

        &__item {
          padding: 0.25em;
          cursor: pointer;

          &:hover {
            background-color: colorStep(button-secondary);
          }
        }
      }
    }
  }

  #student-search__input__input {
    width: 100%;
    border-radius: 0.25em;

    &.open {
      border-radius: 0.25rem 0.25rem 0px 0px;
    }
  }

  .student-info {
    margin-top: 1.5em;
    padding: 1em;
    background-color: colorStep(secondary);

    & form {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      gap: 1.5em;
    }

    & input {
      width: 100%;
    }

    &--submit-group {
      margin-top: 1.5em;
      flex-basis: 100%;
      text-align: center;
    }
  }

  .student-transactions {
    padding: 0 1.5em;
  }

  @media only screen and (min-width: 760px) {
    .student-search {
      & form {
        flex-direction: row;
      }

      &__input {
        &__reset-wrapper {
          width: clamp(300px, 30vw, 400px);
        }
      }
    }

    .student-info {
      & form {
        flex-direction: row;
      }

      & label {
        display: inline-block;
        width: 150px;
        text-align: right;
        padding-right: 0.5em;
      }

      & input[type=text] {
        width: clamp(200px, 25vw, 400px);
      }

      & input[type=submit] {
        width: inherit;
      }
    }
  }
</style>
