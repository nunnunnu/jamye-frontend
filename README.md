## ✨ 잼얘가챠 - Frontend

<img width="1136" alt="image" src="https://github.com/user-attachments/assets/1d98ed98-6880-4153-b583-416d2941242e" />

프론트 주소: https://jamye.p-e.kr

백엔드 주소: https://jamye-backend.o-r.kr

구글 플레이스토어: https://play.google.com/store/apps/details?id=com.jamye.android&pcampaignid=web_share

  
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
- AWS S3
- AWS CloudFront
- AWS ACM
- Android (Google Play 등록 심사 중)

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

