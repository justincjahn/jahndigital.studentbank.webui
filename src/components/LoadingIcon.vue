<template>
  <div class="loading">
    <svg xmlns="http://www.w3.org/2000/svg" class="loading__img" viewBox="0 0 139.01 318.26">
      <g class="loading__img__main">
        <path class="loading__img__s"
          d="M130.05,59.46C74.25,30.44,23.12,50,17.72,89.13S42.47,135.76,74.87,152s57.64,28.77,54.94,63.87-32.4,48.6-59.41,48.6-67-16.2-67-16.2" />
        <path class="loading__img__l1" d="M51.32,0V318.26" />
        <path class="loading__img__l2" d="M93,0V318.26" />
      </g>
    </svg>

    <div class="loading__content"><slot>Please wait...</slot></div>
  </div>
</template>

<style lang="scss">
@function spring-wobbly($t) {
  $result: -0.5 * math.pow(2.71818, (-6 * $t)) * (-2 * math.pow(2.71828, (6 * $t)) + math.sin(12 * $t) + 2 * math.cos(12 * $t));
  @return $result;
}

.loading {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    align-items: center;

    &__content {
        margin: auto 0 auto 0.15em;
    }

    &__img {
        position: relative;
        overflow: visible;
        animation: wobble 4s ease-in-out 4.25s infinite;
        margin: 0.25em;
        height: 1.5em;

        &__s, &__l1, &__l2 {
            fill: none;
            stroke: currentColor;
            stroke-miterlimit: 10;
        }

        &__s {
            stroke-width: 2rem;
        }

        &__l1, &__l2 {
            opacity: 0;
            stroke-width: 1.25rem;
            animation: down 4s cubic-bezier(.6,.73,.12,1.04) infinite;
        }

        &__l1 {
            animation-delay: 2s;
        }

        &__l2 {
            animation-delay: 2.5s;
        }
    }
}

@keyframes wobble {
    @for $i from 1 through 100 {
        #{$i * 1%} {
            transform: scale(spring-wobbly($i / 30), spring-wobbly($i / 20));
        }
    }
}

@keyframes down {
    0% {
        opacity: 0;
        transform: translateY(-30%);
    }

    15% {
        transform: translateY(5%);
    }

    30% {
        transform: translateY(0%);
    }

    50% {
        opacity: 1;
    }
}
</style>
