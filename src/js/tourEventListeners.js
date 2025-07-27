// 전역 투어 이벤트 리스너 관리
let globalObservers = [];

export function setupGlobalTourEventListeners(component) {
    cleanupGlobalTourEventListeners();
    globalObservers = [
        setupSkipButtonListener(component),
        setupFinishButtonListener(component)
    ];
}

export function cleanupGlobalTourEventListeners() {
    globalObservers.forEach(observer => observer && observer.disconnect && observer.disconnect());
    globalObservers = [];
}

// 스킵 버튼 클릭 감지
function setupSkipButtonListener(component) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const skipButtons = Array.from(document.querySelectorAll('[data-v-step="skip"], .v-tour__skip, button[class*="skip"]'));
                const allButtons = document.querySelectorAll('.v-tour button');
                allButtons.forEach(button => {
                    if (button.textContent.includes('Skip') && !skipButtons.includes(button)) {
                        skipButtons.push(button);
                    }
                });
                skipButtons.forEach(button => {
                    if (!button.hasAttribute('data-skip-listener-added')) {
                        button.setAttribute('data-skip-listener-added', 'true');
                        button.addEventListener('click', () => {
                            console.log('Skip button clicked via global DOM listener');
                            if (component && typeof component.handleSkip === 'function') {
                                console.log('Calling component.handleSkip()');
                                component.handleSkip();
                            } else {
                                console.warn('component.handleSkip is not available:', component);
                            }
                        });
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
}

function setupFinishButtonListener(component) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const finishButtons = Array.from(document.querySelectorAll('[data-v-step="finish"], .v-tour__finish, button[class*="finish"]'));
                const allButtons = document.querySelectorAll('.v-tour button');
                allButtons.forEach(button => {
                    if (button.textContent.includes('Finish') && !finishButtons.includes(button)) {
                        finishButtons.push(button);
                    }
                });
                finishButtons.forEach(button => {
                    if (!button.hasAttribute('data-finish-listener-added')) {
                        button.setAttribute('data-finish-listener-added', 'true');
                        button.addEventListener('click', () => {
                            console.log('Finish button clicked via global DOM listener');
                            console.log('Component reference:', component);
                            console.log('Component methods:', Object.getOwnPropertyNames(component));
                            if (component && typeof component.handleFinish === 'function') {
                                console.log('Calling component.handleFinish()');
                                try {
                                    component.handleFinish();
                                    console.log('handleFinish called successfully');
                                } catch (error) {
                                    console.error('Error calling handleFinish:', error);
                                }
                            } else {
                                console.warn('component.handleFinish is not available:', component);
                                console.warn('Available methods:', Object.getOwnPropertyNames(component || {}));
                            }
                        });
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
} 