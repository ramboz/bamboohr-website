export default async function decorate(block) {
  const steps = block.querySelectorAll(':scope > div');
  steps.forEach((step, i) => {
    step.dataset.step = i;
    step.classList = 'signup-step';
  });
}