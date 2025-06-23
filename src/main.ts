import { animate, utils, createDraggable, createSpring, createTimer, Timer, type AnimationParams, type TargetsParam, type JSAnimation } from 'animejs';

const [$logo] = utils.$('.logo.js');
const [$button] = utils.$('button#rotation-button');
let rotations = 0;

// the timer
const [$time, $count] = utils.$('.value');

createTimer({
  duration: 1000,
  loop: true,
  frameRate: 30,
  onUpdate: self => $time.innerHTML = self.currentTime,
  onLoop: self => $count.innerHTML = self._currentIteration
});

// Created a bounce animation loop
animate('.logo.js', {
  autoplay: false,
  scale: [
    { to: 0.05, ease: 'inOut(3)', duration: 200 },
    { to: 0.1, ease: createSpring({ stiffness: 300 }) }
  ],
  loop: true,
  loopDelay: 250,
});

// Make the logo draggable around its center
createDraggable('.logo.js', {
  container: [0, 0, 0, 0],
  releaseEase: createSpring({ stiffness: 200 })
});

// Animate logo rotation on click
const rotateLogo = () => {
  rotations++;
  $button.innerText = `rotations: ${rotations}`;
  animate($logo, {
    rotate: rotations * 360,
    ease: 'out(4)',
    duration: 1500,
  });
}

$button.addEventListener('click', rotateLogo);

type SteppedAnimation = {
  animation: JSAnimation,
  goToStep: (step: number) => void
}

function createSteppedAnimation(targets: TargetsParam, parameters: AnimationParams & {steps : number}): SteppedAnimation {
  const thisAnimation = animate(targets, Object.assign({
    autoplay: false,
    duration: 2000,
    ease: 'linear',
    loop: false,
    direction: 'alternate',
  }, parameters));

  let timer: Timer | null = null;

  const goToStep = (step: number) => {
    
    if (step > parameters.steps || step < 0) {
      throw new Error(`Step ${step} is out of bounds. Valid range is 0 to ${parameters.steps}.`);
    }

    const stepDuration = thisAnimation.duration / parameters.steps;
    const to = step * stepDuration;

    return () => {

      console.log('goToStep', step, 'to:', to, 'duration:', thisAnimation.duration, 'currentTime:', thisAnimation.currentTime, 'iterationCurrentTime:', thisAnimation.iterationCurrentTime);

      const from = thisAnimation.iterationCurrentTime;
      const duration = Math.abs(to - from);
      
      if (timer) {
        timer.cancel();
        timer = null;
      }

      if (to < from) {
				thisAnimation.reverse()
			} else {
				thisAnimation.play();
			}


      timer = createTimer({
        autoplay: true,
        duration,
        onComplete: () => {
          timer = null;
          thisAnimation.pause();
        },
      });
    }
  };

  return {
    animation: thisAnimation,
    goToStep,
  };
}


const box1 = createSteppedAnimation('#box1', {
  steps: 2,
  rotate: 180,
  duration: 2000,
});

utils.$('button.data-step').forEach((button, index) => {
  button.addEventListener('click', box1.goToStep(index));
});
