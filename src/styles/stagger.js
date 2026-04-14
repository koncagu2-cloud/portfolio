export function staggerContainer(stagger = 0.09, delayChildren = 0) {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  }
}

