<template>
    <div class="b-container">
        <h2 class="title pb-4 mb-4 fst-italic border-bottom">회원 가입</h2>
        <div class="duplicateMessage-error" v-if="idIsDuplicate!=null && idIsDuplicate">이미 가입된 ID입니다.</div>
        <div class="duplicateMessage-success" v-if="idIsDuplicate!=null && !idIsDuplicate">사용 가능한 ID입니다.</div>
        <div v-if="idIsDuplicate==null"><div class="duplicate-message-space"></div></div>
        <div class="form-group verification-group">
            <input type="text" id="userId" v-model="userId" class="form-control" placeholder="사용자ID" />
            <button @click="idCheck" class="btn btn-dark btn-sm">중복 확인</button>
        </div>
        <div class="message">비밀번호는 8자리 이상 입력해주세요.<span class="success" v-if="password != null && password.length >= 8">적합</span><span class= "error" v-if="password != null && password.length<8">부적합</span></div>
        <div class="form-group">
            <input type="password" id="password" v-model="password" class="form-control" placeholder="비밀번호" />
        </div>
        <div v-if="passwordConfirmError==null || passwordConfirmError==false"><div class="duplicate-message-space"></div></div>
        <div v-if="passwordConfirmError" class="duplicateMessage-error">비밀번호가 일치하지 않습니다.</div>
        <div class="form-group">
            <input type="password" id="comfirmPassword" v-model="comfirmPassword" class="form-control" placeholder="비밀번호 확인" />
        </div>
        <div class="duplicateMessage-error" v-if="emailConfirmError!=null && emailConfirmError">이메일 형식이 아닙니다.</div>
        <div class="duplicateMessage-error" v-if="emailIsDuplicate!=null && emailIsDuplicate">이미 가입된 이메일입니다.</div>
        <div class="duplicateMessage-success" v-if="emailIsDuplicate!=null && !emailIsDuplicate">인증코드가 전송되었습니다. 이메일이 도착하지않았다면 재발송 버튼을 눌러주세요</div>
        <div class="duplicate-message-space" v-if="emailIsDuplicate==null && (emailConfirmError == null || !emailConfirmError)"></div>
        <div class="form-group verification-group">
            <input type="email" id="email" v-model="email" class="form-control" placeholder="이메일" />
            <button v-if="!emailCodeSend" @click="emailCheck" class="btn btn-dark btn-sm">이메일 검증</button>
            <button v-if="emailCodeSend && !verifcationSuccess" @click="emailCheck" class="btn btn-dark btn-sm">재발송</button>
            <button v-if="emailCodeSend && verifcationSuccess" @click="emailCheck" class="btn btn-dark btn-sm" disabled>재발송</button>
        </div>
        <div class="duplicateMessage-success" v-if="verifcationSuccess!=null && verifcationSuccess">인증 성공</div>
        <div class="duplicateMessage-error" v-if="verifcationSuccess!=null && !verifcationSuccess">인증실패. 인증코드를 재확인해주세요.</div>
        <div class="duplicate-message-space" v-if="verifcationSuccess==null"></div>
        <div class="form-group verification-group">
            <input type="text" id="verificationCode" v-model="verificationCode" class="form-control" placeholder="인증코드" />
            <button v-if="this.emailCodeSend != null & this.emailCodeSend != false & !this.verifcationSuccess" @click="sendVerification" class="btn btn-dark btn-sm">인증</button>
            <button v-if="this.emailCodeSend != true | this.verifcationSuccess" @click="sendVerification" class="btn btn-dark btn-sm" disabled>인증</button>
        </div>

        <div v-if="verifcationSuccess !=null & verifcationSuccess && idIsDuplicate != null & !idIsDuplicate && emailIsDuplicate != null & !emailIsDuplicate && passwordConfirmError != null & !passwordConfirmError">
            <button @click="signup" class="btn btn-dark signup-btn">회원가입</button>
        </div>
        <div v-else>
            <button @click="signup" class="btn btn-dark signup-btn" disabled>회원가입</button>
        </div>
    </div>
</template>
<script>
import axios from '@/js/axios';

export default ({
    data() {
        return {
            userId:null,
            password: null,
            comfirmPassword: null,
            email: null,
            verificationCode: null,
            verifcationSuccess: null,
            idIsDuplicate: null,
            emailIsDuplicate: null,
            passwordConfirmError: false,
            emailConfirmError: null,
            emailCodeSend: false
        }
    },
    props: {
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        if(this.isLogin) {
            this.$router.push("/")
            this.$toastr.warning("이미 로그인중입니다.")
        }
    },
    watch: {
        userId(){
            this.idIsDuplicate=null
        },
        comfirmPassword() {
            if(this.comfirmPassword != this.password) {
                this.passwordConfirmError=true
            } else {
                this.passwordConfirmError = false
            }
        },
        email() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailPattern.test(this.email)) {
                this.emailConfirmError = false
            } else {
                this.emailConfirmError = true
            }
            this.emailIsDuplicate = null
            this.verifcationSuccess = null
            this.emailCodeSend = false
        },
        password() {
            if(this.comfirmPassword != this.password) {
                this.passwordConfirmError=true
            } else {
                this.passwordConfirmError = false
            }
        },
    },
    methods: {
        signup() {
            if(!this.verifcationSuccess | this.idIsDuplicate || this.emailIsDuplicate || this.passwordConfirmError) {
                this.$toastr.warning("모든 인증을 성공한 후 회원가입이 가능합니다.")
            } else {
                axios.post("/api/user/join", {
                    "id":this.userId,
                    "password": this.password,
                    "email":this.email
                })
                this.$toastr.success("회원가입이 완료되었습니다.")
                this.$router.push("/")
            }
        },
        idCheck(){
            if(this.userId==undefined || this.userId == null || this.userId=="" || this.userId==" "){
                this.$toastr.warning("아이디를 입력하지않으셨습니다")
            }else{
                axios.get("/api/user/check/id/"+this.userId)
                .then((e) => {
                            if(e.data.data){
                                this.idIsDuplicate=false
                            }else{
                                this.idIsDuplicate=true
                            }
                        })
            }
        },
        emailCheck(){
            if(this.email==undefined || this.email == null || this.email=="" || this.email==" "){
                this.$toastr.warning("이메일을 입력하지않으셨습니다")
            } else if(this.emailConfirmError) {
                this.$toastr.warning("이메일 형식이 올바르지 않습니다.")
            } else if(this.verifcationSuccess) {
                this.$toastr.warning("이미 이메일 인증이 완료되었습니다.")
            } else {
                axios.get("/api/user/check/email/"+this.email)
                .then((e) => {
                            if(e.data.data){
                                this.emailIsDuplicate=false
                                this.emailCodeSend = true
                                axios.post("/api/email/send?email="+this.email)
                            }else{
                                this.emailIsDuplicate=true
                            }
                        })
            }
        },
        sendVerification() {
            if(this.verificationCode == null) {
                this.$toastr.warning("인증코드를 입력하지않으셨습니다.")
            } else if(this.emailConfirmError || this.emailIsDuplicate) {
                this.$toastr.warning("이메일 검증을 먼저 진행해주세요.")
            } else if(this.verifcationSuccess) {
                this.$toastr.warning("이미 인증을 완료하셨습니다.")
            }else {
                axios.post("/api/email/verify", {
                "email": this.email,
                "verifyCode": this.verificationCode
            }).then(e => {
                if(e.data.data) {
                    this.verifcationSuccess = true
                } else {
                    this.verifcationSuccess = false
                }
            })
            }
            
        }
    }
})
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 30px;
}

.verification-group {
  display: flex;
  gap: 10px;
}

.signup-btn {
  width: 100%;
}
.form-control {
    background-color: #f0f0f0;
    outline-style: solid;
    outline-color: #d7d7d7;
    height: 50px;
    border-radius: 15px;
}
.btn-sm {
    margin-top: 2px;
    margin-bottom: 2px;
    margin-left: 10px;
    width: 120px;
    border-radius: 15px;
}
.duplicateMessage-error {
    color: rgb(224, 100, 100);
    font-size: 14px;
}
.duplicateMessage-success {
    color: rgb(86, 186, 240);
    font-size: 14px;
}
.duplicate-message-space {
  height: 21px; /* 원하는 높이 설정 */
}
.message {
    color: rgb(127, 127, 127);
    font-size: 14px;
}
.success {
    width: 10px;            /* 직사각형의 너비 */
    height: 20px;
    background-color: rgb(86, 186, 240); /* 배경색 */
    border-radius: 2px;     /* 모서리 둥글게 */
    font-size: 11px;        /* 글자 크기 */
    color: #ffffff;            /* 글자 색 */
    margin: 5px 7px;        /* 상하 여백 */
    margin-bottom: 20px;
}
.error {
    width: 10px;            /* 직사각형의 너비 */
    height: 20px;
    background-color: rgb(224, 100, 100); /* 배경색 */
    border-radius: 2px;     /* 모서리 둥글게 */
    font-size: 11px;        /* 글자 크기 */
    color: #ffffff;            /* 글자 색 */
    margin: 5px 7px;        /* 상하 여백 */
    margin-bottom: 20px;
}
</style>