<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="dollar-icon"
    viewBox="0 0 139.01 318.26"
  >
    <g class="dollar-icon__main">
      <path
        class="dollar-icon__s"
        d="M130.05,59.46C74.25,30.44,23.12,50,17.72,89.13S42.47,135.76,74.87,152s57.64,28.77,54.94,63.87-32.4,48.6-59.41,48.6-67-16.2-67-16.2"
      />
      <path class="dollar-icon__l1" d="M51.32,0V318.26" />
      <path class="dollar-icon__l2" d="M93,0V318.26" />
    </g>
  </svg>
</template>

<style>
/*
@use 'sass:math';

@function spring-wobbly($t) {
  $result: -0.5 * math.pow(2.71818, (-6 * $t)) *
    (
      -2 * math.pow(2.71828, (6 * $t)) + math.sin(12 * $t) + 2 * math.cos(12 *
            $t)
    );
  @return $result;
}

@keyframes dollar-icon-wobble {
  @for $i from 1 through 100 {
    #{$i * 1%} {
      transform: scale(
        spring-wobbly(math.div($i, 30)),
        spring-wobbly(math.div($i, 20))
      );
    }
  }
}

.dollar-icon {
  animation: dollar-icon-wobble 4s ease-in-out 4.25s infinite;
}
*/

.dollar-icon {
  height: 0.75em;
  position: relative;
  overflow: visible;
  display: inline;
}

.dollar-icon .dollar-icon__s,
.dollar-icon .dollar-icon__l1,
.dollar-icon .dollar-icon__l2 {
  fill: none;
  stroke: currentColor;
  stroke-miterlimit: 10;
}

.dollar-icon .dollar-icon__s {
  stroke-width: 2rem;
}

@keyframes dollar-icon-down {
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

.dollar-icon .dollar-icon__l1,
.dollar-icon .dollar-icon__l2 {
  opacity: 0;
  stroke-width: 1.25rem;
  animation: dollar-icon-down 4s cubic-bezier(0.6, 0.73, 0.12, 1.04) infinite;
}

.dollar-icon .dollar-icon__l1 {
  animation-delay: 2s;
}

.dollar-icon .dollar-icon__l1 {
  animation-delay: 2.5s;
}
</style>
