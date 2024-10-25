<template>
    <div class="b-container"><br><br><br>
        <h2 class="pb-4 mb-4 fst-italic border-bottom">회원 가입</h2>
        <div class="form-group verification-group">
            <input type="text" id="userId" v-model="userId" class="form-control" placeholder="사용자ID" />
            <button @click="sendVerification" class="btn btn-dark btn-sm">중복 확인</button>
        </div>
        <div class="form-group">
            <input type="password" id="password" v-model="password" class="form-control" placeholder="비밀번호" />
        </div>

        <div class="form-group">
            <input type="password" id="confirmPassword" v-model="confirmPassword" class="form-control" placeholder="비밀번호 확인" />
        </div>

        <div class="form-group verification-group">
            <input type="email" id="email" v-model="email" class="form-control" placeholder="이메일" />
            <button @click="sendVerification" class="btn btn-dark btn-sm">중복 확인</button>
        </div>

        <div class="form-group verification-group">
            <input type="text" id="verificationCode" v-model="verificationCode" class="form-control" placeholder="인증코드" />
            <button @click="sendVerification" class="btn btn-dark btn-sm">인증</button>
        </div>

        <div v-if="verifcationSuccess">
            <button @click="signup" class="btn btn-dark signup-btn">회원가입</button>
        </div>
        <div v-else>
            <button @click="signup" class="btn btn-dark signup-btn" disabled>회원가입</button>
        </div>
    </div>
</template>
<script>

export default ({
    data() {
        return {
            userId:null,
            password: null,
            comfirmPassword: null,
            email: null,
            verificationCode: null,
            verifcationSuccess: false
        }
    },
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
    width: 100px;
    border-radius: 15px;
}
</style>