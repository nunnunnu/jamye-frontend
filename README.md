## ✨ 잼얘가챠 - Frontend

<img width="1136" alt="image" src="https://github.com/user-attachments/assets/1d98ed98-6880-4153-b583-416d2941242e" />

프론트 주소: https://jamye.p-e.kr

백엔드 주소: https://jamye-backend.o-r.kr

  
잼얘가챠는 친구들과의 추억을 메시지나 게시글 형식으로 저장하고,

이를 가챠처럼 랜덤으로 뽑아보며 다시 떠올릴 수 있는 서비스입니다.

---

### 🛠️ Language / Framework
- Vue.js (v3)
- Cordova (Android 앱 빌드)

### 📦 주요 라이브러리
- Vue Router
- Axios
- Bootstrap
- vue-cookies

### ☁️ 인프라 및 배포 환경
- 프론트: AWS S3 버킷 `jamye-frontend` + CloudFront + ACM. 서비스 주소는 https://jamye.p-e.kr
- `main` 브랜치에 푸시하면 GitHub Actions 워크플로 `.github/workflows/AwsS3.yml`이 빌드 후 배포
- 백엔드: Google Cloud 무료 티어 VM (저장소 `jamye-backend`). 비용 때문에 AWS에서 이전
- 웹 프론트엔드를 Cordova로 APK로 변환해 Play 스토어에 배포했었으나, 웹뷰 방식이 불안정해 현재는 웹(https://jamye.p-e.kr)으로만 서비스 중이며 네이티브 앱으로 재개발할 계획입니다.

### 🔌 API 주소
API 오리진은 빌드할 때 넣습니다. 저장소에 커밋된 `src/.env`는 없습니다.

- GitHub 저장소 Variable `API_BASE_URL` (Actions Variables. Secrets 항목이 아님)
- 현재 값: `https://jamye-backend.o-r.kr` (끝 슬래시 없음, `/ws` 없음)
- 워크플로 `npm build` 스텝이 이 값을 환경 변수 `VUE_APP_API_URL`로 넘긴 뒤 `npm run build`를 실행합니다. 값이 비어 있으면 빌드를 중단합니다.
- Vue CLI는 `VUE_APP_`로 시작하는 변수만 클라이언트 번들에 넣습니다.
- `src/js/config.js`가 `VUE_APP_API_URL`의 앞뒤 공백과 끝 슬래시를 지우고 `BASE_URL`로 씁니다. WebSocket 주소 `WS_URL`은 그 뒤에 `/ws`를 붙입니다.

### 💻 로컬 개발
`.gitignore`는 `.env`와 `.env.*`를 무시하고, `.env.example`만 예외로 둡니다. 저장소에는 `.env.example`이 없습니다.

프로젝트 루트에 커밋하지 않는 `.env`를 만들고 아래처럼 적습니다.

```
VUE_APP_API_URL=https://jamye-backend.o-r.kr
```

끝 슬래시와 `/ws`는 붙이지 않습니다.

```bash
npm install
npm run serve
```

`npm run serve`와 `npm run build`가 이 값을 읽습니다. `.env`를 바꾼 뒤에는 개발 서버를 다시 띄웁니다.

### 🚀 배포
`main`에 푸시되면 `.github/workflows/AwsS3.yml`(워크플로 이름 `Main CI`)이 순서대로 실행됩니다.

1. 체크아웃 후 `npm install`
2. 저장소 변수 `API_BASE_URL`을 `VUE_APP_API_URL`로 넣어 `npm run build`
3. `dist`를 리전 `ap-northeast-2`의 S3 버킷 `jamye-frontend`에 업로드 (`aws s3 cp --recursive`). AWS 자격 증명은 저장소 시크릿으로 넘깁니다.
4. CloudFront 캐시 무효화 (`aws cloudfront create-invalidation --paths "/*"`, 리전 `us-east-1`)

무효화 스텝은 저장소 시크릿 `CLOUDFRONT_DISTRIBUTION_ID`를 사용합니다. 시크릿이 비어 있으면 이 스텝은 에러로 끝납니다. IAM 사용자에게 `cloudfront:CreateInvalidation` 권한이 없으면 무효화 명령이 실패합니다. S3 업로드 스텝은 그 전에 끝나 있으므로 버킷 반영은 유지됩니다. `vue.config.js`의 `filenameHashing`이 꺼져 있어 파일명이 바뀌지 않으니, 무효화가 실패하면 이전 파일이 CloudFront에 남을 수 있습니다.

---

### 📱 주요 기능
##### ✅ 메인
- 소속 그룹 조회
- 현재 그룹 선택
- 잼얘 가챠 뽑기
- 그룹 삭제 투표 

##### 📝 게시글 생성
- 메세지 타입
  ![화면 기록 2025-05-05 오후 9 33 47 (2) (1)](https://github.com/user-attachments/assets/2c984ff3-54c7-409f-bb6d-98b088fd7fd8)
  ![KakaoTalk_Video_2025-05-05-22-02-07](https://github.com/user-attachments/assets/86c684a7-8388-487d-9e2c-2969858023b3)
  ![KakaoTalk_Video_2025-05-05-22-02-11](https://github.com/user-attachments/assets/8c96bf2b-0770-4fec-b4ae-2b42169746cd)
	- 사진 업로드로 메세지 자동 변환
	- 사진에서 인식할 전송자 이름 등록 가능 - 그룹 유저와 매핑
	- 그룹 별 사용 태그 조회
	- 이미지 보관함
	- 이미지 자동 변환 시 생기는 특수문자 & 안읽은 회원 수 일괄 제거
	- 말풍선 수정/위치 변경/삭제/사진 업로드
	- 말품선 답장 연결(클릭 시 원본 메세지 이동)
- 게시글 타입
  <img width="1455" alt="image" src="https://github.com/user-attachments/assets/915dc165-7eab-41a5-b1ee-afa28ff650c0" />
	- 이미지 보관함
	- 그룹 별 사용 태그 조회

##### 📝 게시글 목록
![화면 기록 2025-05-06 오후 3 21 05 (1)](https://github.com/user-attachments/assets/c70c3fe4-cac3-4189-aacc-5ce5dcf8e92f)

- 그룹 별 사용 태그 조회
- 보유 잼얘 목록 필터(태그, 게시글 타입, 제목) 조회
- 그룹 전체 게시글 수와 보유 게시글 수 조회
- 페이징 기능

##### 📝 게시글 조회
<img width="1472" alt="image" src="https://github.com/user-attachments/assets/8d9cbf2a-6867-434f-9cd8-7bf1d4f893c1" />

- 게시글 수정
- 댓글 등록/수정/삭제

##### 👥 그룹 목록 조회

- 소속 그룹 목록 조회
- 그룹 생성/초대코드로 가입

##### 👥 그룹 정보 상세 조회
<img width="1455" alt="image" src="https://github.com/user-attachments/assets/64fa986b-731f-4b0c-ac85-707146d074dd" />

- 그룹 상세정보/소속 회원 목록 조회
- 그룹 정보 수정/회원 정보 수정
- 그룹 탈퇴
- 그룹 초대코드 발급
- 그룹 삭제 투표 진행 가능(마스터 권한 필요)

##### 📬 쪽지함
<img width="1455" alt="image" src="https://github.com/user-attachments/assets/b9749745-0fcf-4e3c-b0b5-38891b4b00ac" />

- 쪽지 목록 조회
- 디스코드 알람 수신 - jamye bot 연동
- 모두읽기/안읽은 쪽지 일괄 삭제

##### 👤 MY페이지
<img width="1455" alt="image" src="https://github.com/user-attachments/assets/5cd10886-d33e-454b-b04c-901dcdaac642" />

- 회원 탈퇴
- 회원 정보 수정
- 그룹 목록 조회
- 그룹 생성/초대코드로 가입

