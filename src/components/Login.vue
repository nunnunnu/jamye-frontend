<template>
    <div class="b-container">
        <br>
        <br>
        <br>

        <h2 class="pb-4 mb-4 fst-italic border-bottom">로그인</h2>
        <form @submit.prevent="submitForm">
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">아이디</span>
                <input type="text" class="form-control" v-model="id" aria-describedby="basic-addon1">
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">비밀번호</span>
                <input type="password" class="form-control" v-model="pwd" aria-describedby="basic-addon1">
            </div>
                <button type="submit" class="btn btn-dark btn-block">로그인</button>
                <br>
        </form>     
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <input type="checkbox" id="saveId" class="form-check-input me-2" v-model="idSave">
                <label for="saveId">아이디 저장</label>
            </div>
            <div>
                <span class="clickable-text mx-3">아이디 찾기</span>
                <span class="clickable-text">비밀번호 찾기</span>
            </div>
        </div>
        <div class="d-flex align-items-center">
            <span class="clickable-text join" @click="join">회원 가입</span>
        </div>
    </div>
</template>
<script>
    import axios from 'axios'
    export default {
        name: 'loginPage',
        data() {
            return {
                id:null,
                pwd:null,
                returnUrl:null,
                idSave:null
            }
        },
        created() {
            if(this.$cookies.get("accessToken")!=null){
                alert("이미 로그인되었습니다.")
                this.$router.go(-1);
            }
            if(this.$cookies.get("saveId") !==null) {
                this.idSave=true
                this.id = this.$cookies.get("saveId")
            }
            
        },
        methods: {
            submitForm() {
                if (this.id == null || this.id === undefined || this.pwd == null || this.pwd === undefined) {
                    alert("아이디 혹은 비밀번호를 입력하지 않으셨습니다.");
                } else {
                    const param = {
                        id: this.id,
                        password: this.pwd
                    };
                    axios.post('/api/user/login', param)
                        .then(response => {
                            const token = response.data.data.token;
                            const accessToken = token.accessToken; 
                            const refreshToken = token.refreshToken; 

                            if (!accessToken || !refreshToken) {
                                alert("토큰을 받아오는 데 실패했습니다.");
                                return;
                            }

                            this.$cookies.set('accessToken', accessToken);
                            this.$cookies.set('refreshToken', refreshToken);
                            this.$cookies.set('id', response.data.data.id);
                            if(this.idSave) {
                                this.$cookies.set("saveId", response.data.data.id)
                            } else {
                                this.$cookies.remove("saveId")
                            }
                            this.$emit("isLoginChange", true)
                            this.id = null
                            this.pwd = null
                            if (this.$cookies.get('beforePage') != null) {
                                this.$cookies.remove('beforePage');
                                this.$router.push("/");
                            } else {
                                this.$router.go(-1);
                            }
                        })
                        .catch(error => {
                            if (error.response) {
                                alert(error.response.data.message);
                                this.id = null
                                this.pwd = null
                            } else {
                                alert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
                            }
                        });
                }
            },
            join() {
                this.$router.push("/join")
            }
        }
    }

</script>
<style>
.clickable:hover {
  cursor: pointer;
}
.clickable-text {
    cursor: pointer; /* 클릭 가능한 커서로 변경 */
    color: #000000; /* 링크 색상 (부트스트랩의 기본 링크 색상) */
}

.clickable-text:hover {
    color: #696969; /* 호버 시 색상 변경 */
}
.join {
    margin-top: 20px; /* 위쪽 여백을 추가 */
    text-align: center;
    width: 100%; /* 중앙 정렬을 위한 전체 너비 */
}
</style>