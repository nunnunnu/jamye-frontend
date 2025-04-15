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

        if(code == null || code == undefined) {
            this.$toastr.error("정상적인 접근이 아닙니다")
            this.$router.push("/")
            return
        }

        axios.get("/oauth/kakao/callback?code="+code)
        .then((response)=>{
            const token = response.data.data.token;
                const accessToken = token.accessToken; 
                const refreshToken = token.refreshToken; 
                
                if (!accessToken || !refreshToken) {
                    this.$toastr.warning("토큰을 받아오는 데 실패했습니다.");
                    return;
                }
                
                this.$cookies.set('accessToken', accessToken);
                this.$cookies.set('refreshToken', refreshToken);
                this.$cookies.set('id', response.data.data.id);
                this.$cookies.set('sequence', response.data.data.sequence);
                this.$emit("isLoginChange", true)
                setTimeout(() => {
                    this.$router.push("/");
                }, 0)
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