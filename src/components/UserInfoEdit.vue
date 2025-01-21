<template>
    <div class="b-container">
        <h2 class="title"> 사용자 정보 수정 </h2><br>
        <div class="data-title">아이디</div>
        <div class="user-info-box">
            <span class="user-id">{{ userInfo.id }}</span>
        </div>
        <div class="data-title">이메일</div>
        <div class="user-info-box">{{ userInfo.email }}</div>
        <div class="data-title">비밀번호 변경</div>
        <div class="data-sub-title">비밀번호 확인</div>
            <div class="password-check">
                <input type="password" id="password" class="form-control" placeholder=" " v-model="originPassword" />
                <button class="btn btn-dark">비밀번호 확인</button>
            </div>
        <div class="data-sub-title">새로운 비밀번호</div>
        <div class="change-password">
            <input v-if="passwordCheck" type="password" id="password" class="form-control" placeholder=" " v-model="newPassword" />
            <input v-else type="password" id="password" class="form-control" placeholder=" " v-model="newPassword" disabled />
        </div>
        <button class="btn btn-dark">비밀번호 변경</button>
    </div>
</template>
<script>
import axios from '@/js/axios';
export default {
    data() {
        return {
            userInfo: {},
            originPassword: null,
            passwordCheck: false,
            newPassword: null
        }
    },
    props: {
        isLogin: {
            require: true
        }
    },
    created() {
        if(!this.isLogin) {
            alert("로그인 후 접속가능한 페이지입니다.")
            this.$router.push("/login")
            return
        }
        axios.get("/api/user", {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
        }).then(r => {
            this.userInfo = r.data.data
        })
    }
}
</script>
<style>
.user-info-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #d7d7d7;
  outline-style: solid;
  outline-color: #d7d7d7;
  padding: 10px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}
.user-id {
  font-size: 16px;
  color: #333;
  text-align: left;
  font-weight: bold;
  margin-left: 10px;
}
.data-title {
    margin-bottom: 10px;
    font-size: 22px;
    color: #333;
}
data-sub-title {
    margin-bottom: 10px;
    font-size: 18px;
    color: #333;
}
.change-password {
    margin-bottom: 10px;
}
.password-check {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    width: 100%;
}
</style>