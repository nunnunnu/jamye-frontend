<template>
    <div class="b-container">
        <br>
        <br>
        <br>
        <br><br>

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
            <div class="d-grid gap-2 col-6 mx-auto">
                <button type="submit" class="btn btn-dark">로그인</button>
                <br>
            </div>
        </form>        
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
                returnUrl:null
            }
        },
        created() {
            if(this.$cookies.get("accessToken")!=null){
                alert("이미 로그인되었습니다.")
                this.$router.go(-1);
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
                            this.$emit("isLoginChange", true)
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
                            } else {
                                alert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
                            }
                        });
                }
            }
        }
    }

</script>
<style>
.clickable:hover {
  cursor: pointer;
}
</style>