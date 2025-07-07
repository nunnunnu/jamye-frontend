<template>
    <div class="b-container">
        <h2 class="title pb-4 mb-4 fst-italic border-bottom">아아디/비밀번호 찾기</h2>
    <div class="find-container">
      <div class="tab-buttons">
        <button
          :class="['tab-btn', activeTabCopy === 'id' ? 'active' : '']"
          @click="activeTabCopy = 'id'" 
        >
          아이디 찾기
        </button>
        <button
          :class="['tab-btn', activeTabCopy === 'pw' ? 'active' : '']"
          @click="activeTabCopy = 'pw'"
        >
          비밀번호 찾기
        </button>
      </div>
  
      <div v-if="activeTabCopy === 'id'" class="tab-content">
        <input v-model="emailForId" type="email" placeholder="이메일 입력" class="input" />
        <button class="btn" @click="sendIdEmail">인증 메일 보내기</button>
  
        <div v-if="maskedId" class="result">
          <p>회원님의 아이디는 <strong>{{ maskedId }}</strong>입니다.</p>
          <button class="btn" @click="sendAllIds">전체 아이디 이메일로 받기</button>
        </div>
      </div>
  
      <div v-else class="tab-content">
          <input v-model="emailForPw" type="email" placeholder="이메일 입력" class="input" />
          <input v-model="idForPw" type="text" placeholder="아이디 입력" class="input" />
        <button class="btn" @click="sendTempPassword">임시 비밀번호 메일로 받기</button>
      </div>
    </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import axios from 'axios'
  import { getCurrentInstance } from 'vue'

  export default {
    props: {
      activeTab: {
        type: String,
        required: true,
      },

    },
    data() {
        return {
            activeTabCopy: this.activeTab
        }
    },
    created() {
       this.isLogin = localStorage.getItem('accessToken') !== null;
        if(this.isLogin) {
          this.$toastr.warning("이미 로그인 하셨습니다.")
          this.$router.push("/")

        }
    },
    emits: ['update:activeTab'],
    setup() {
        const { proxy } = getCurrentInstance()

        const emailForId = ref('')
        const emailForPw = ref('')
        const idForPw = ref('')
        const originId = ref('')
        const maskedId = ref('')
        const maskId = (id) => {
            if (id.length <= 3) return '*'.repeat(id.length)
            const visible = id.slice(0, id.length - 3)
            return visible + '***'
        }
    
      const sendIdEmail = async () => {
        try {
          const res = await axios.post('/api/user/find/id?email=' + emailForId.value)
          originId.value = res.data.data
          maskedId.value = maskId(originId.value)

        } catch (err) {
          console.error('아이디 찾기 실패:', err)
          proxy.$toastr.warning("아이디를 찾을 수 없습니다.", err.response.data.message)
        }
      }
  
      const sendAllIds = async () => {
        try {
          await axios.post('/api/email/id?id=' + originId.value )
          proxy.$toastr.success('전체 아이디를 이메일로 발송했습니다.')
        } catch (err) {
          console.error('전체 아이디 발송 실패:', err)
        }
      }
  
      const sendTempPassword = async () => {
        try {
          await axios.post('/api/email/password', {
            id: idForPw.value,
            email: emailForPw.value,
          })
          proxy.$toastr.success('임시 비밀번호를 이메일로 발송했습니다.')
        } catch (err) {
          console.error('임시 비밀번호 발송 실패:', err.response.data.message)
        }
      }
  
      return {
        emailForId,
        emailForPw,
        idForPw,
        maskedId,
        sendIdEmail,
        sendAllIds,
        sendTempPassword,
      }
    },
  }
  </script>
  
  <style scoped>
.find-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.tab-buttons {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 12px 0;
  background: #f9f9f9;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  border-bottom: 2px solid #007bff;
  color: #007bff;
  background: #fff;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.btn {
  padding: 10px;
  background: #007bff;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn:hover {
  background: #0056b3;
}

.result {
  margin-top: 12px;
  padding: 12px;
  background: #f1f1f1;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}
</style>