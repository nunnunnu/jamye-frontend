<template>
    <div>
    </div>
    </template>
    <script>
        import axios from '@/js/axios'
        export default {
            name: 'discordLogin',
            created(){
                const searchParams = new URLSearchParams(window.location.search);
    
                // code 파라미터 추출
                const code = searchParams.get('code');
    
                if(code == null || code == undefined) {
                    this.$toastr.error("정상적인 접근이 아닙니다")
                    this.$router.push("/")
                    return
                }

                axios.get("/discord/oauth/callback?code="+code, {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
            })
                .then((r)=>{
                    console.log(r)
                })
                this.$router.push("/notify-box")
            },
            methods:{
            }
            
        }
    </script>
    <style>
    </style>