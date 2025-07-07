<template>
    <div>
    </div>
</template>
<script>
import axios from '@/js/axios'
export default {
    name: 'kakaoLogin',
    created(){
        const searchParams = new URLSearchParams(window.location.search);

        // code 파라미터 추출
        const code = searchParams.get('code');
        console.log("code:", code)
        const state = searchParams.get('state');
        console.log("state:", state)

        if(state != 'web') return

        if(code == null || code == undefined) {
            this.$toastr.error("정상적인 접근이 아닙니다")
            this.$router.push("/")
            return
        }
        console.log("카카오 인증코드 정상 수신 확인")

        axios.get("/oauth/kakao/callback?code="+code)
        .then((response)=>{
            console.log("kakao callback api 호출")
            const token = response.data.data.token;
            const accessToken = token.accessToken; 
            const refreshToken = token.refreshToken; 
            
            if (!accessToken || !refreshToken) {
                this.$toastr.warning("토큰을 받아오는 데 실패했습니다.");
                return;
            }
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('id', response.data.data.id);
            localStorage.setItem('sequence', response.data.data.sequence);
            this.$emit("isLoginChange", true)
            console.log("status:" + state)
            // setTimeout(() => {
                console.log("setTimeout 실행됨")
                if (state == 'app') {
                    console.log("app close")
                    // window.cordova.InAppBrowser.close();
                    console.log("app close2")
                    this.$router.push("/");
                } else {
                    console.log("kakao redirect 웹 ver")
                    this.$router.push("/");
                }
            // }, 0)
            this.$toastr.success("카카오 로그인 성공")
        }).catch(() => {
            this.$toastr.error("카카오 로그인에 실패하였습니다. 운영자에게 문의해주세요.")
            this.$router.push("/")
        })
        
    },
    methods:{
    }
    
}
</script>
<style>
</style>