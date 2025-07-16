export const tourSteps = {
  first: [
    {
      target: '.navbar-group-btn',
      content: '가입 후 처음 하실 일은 그룹 생성 버튼을 눌러 그룹을 만들어주세요.',
      params: {
        placement: 'bottom',
      }
    },
    // 다른 스텝 있으면 추가
  ],
  groupCreate: [
    {
        target: '.step1-group-create',
        content: '가입 후 처음 하실 일은 그룹 생성 버튼을 눌러 그룹을 만들어주세요.',
        params: {
            placement: 'bottom',
        }
    },
    {
        target: '.step2-group-create',
        content: '초대코드가 없다면 새로운 그룹을 생성해보세요',
        params: {
            placement: 'bottom',
        }
    },
    {
        target: '.step3-group-create',
        content: '초대코드가 있다면 초대된 그룹에 가입해보세요.',
        params: {
            placement: 'bottom',
        }
    },
  ]
  // ... 다른 스텝들
}
