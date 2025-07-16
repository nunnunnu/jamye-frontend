import { useTour } from 'vue3-tour'

const STORAGE_KEY = 'tutorialState'

export const TutorialStep = {
  WELCOME: '0',
  GROUP_CREATE: '1',
  POST_CREATE: '2',
  INVITE_MEMBER: '3',
  DRAW: '4',
  DONE: 'DONE'
}

const STEP_FLOW = [
  TutorialStep.WELCOME,
  TutorialStep.GROUP_CREATE,
  TutorialStep.POST_CREATE,
  TutorialStep.INVITE_MEMBER,
  TutorialStep.DRAW,
  TutorialStep.DONE
]

export function getCurrentStep() {
  return localStorage.getItem(STORAGE_KEY) || TutorialStep.WELCOME
}

export function setStep(step) {
  localStorage.setItem(STORAGE_KEY, step)
}

export function nextStep() {
  const idx = STEP_FLOW.indexOf(getCurrentStep())
  const next = STEP_FLOW[idx + 1] || TutorialStep.DONE
  setStep(next)
  return next
}

export function isDone() {
  return getCurrentStep() === TutorialStep.DONE
}

export function reset() {
  localStorage.removeItem(STORAGE_KEY)
}

// 🧩 이 함수가 각 컴포넌트에서 tour 시작까지 해줌
export function tryStartTour(name, stepMap, router, nextRoute) {
  const step = getCurrentStep()
  const tour = useTour(name)

  if (!tour || !stepMap[step]) return

  tour.steps = stepMap[step]

  tour.start()

  tour.on('stop', () => {
    nextStep()
    router.push(nextRoute)
  })

  tour.on('skip', () => {
    setStep('DONE')
  })
}
