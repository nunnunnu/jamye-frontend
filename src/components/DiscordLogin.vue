<template>
    <div>
    </div>
    </template>
    <script>
        import axios from '@/js/axios'
        // import Cookies from 'js-cookie'
        export default {
            name: 'discordLogin',
            created(){
                const searchParams = new URLSearchParams(window.location.search);
    
                // code 파라미터 추출
                const code = searchParams.get('code');
    
    
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