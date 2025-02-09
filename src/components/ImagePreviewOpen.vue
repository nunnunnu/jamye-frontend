<template>
    <div class="image-preview-overlay" @click="closePreview">
        <div class="image-preview-container">
            <img 
                v-if="image" 
                :src="image" 
                alt="Preview Image" 
                class="large-image" 
                />
            <img v-else-if="imageUrl != null" :src="`http://localhost:8080/api/file/${imageUrl}`" alt="Preview Image" class="large-image" />  
        </div>
    </div>
</template>
<script>

export default {
    data() {
        return {
        }
    },
    props: {
        image: {
            type: File
        },
        imageUrl: {
            type: String
        }
    },
    methods: {
        closePreview() {
            this.image = null
            this.imageUrl = null
            this.$emit("closePreview", false)
        },
    }
}
</script>
<style>
/* 큰 이미지 스타일 */
.large-image {
    max-width: 70%; /* 컨테이너 너비에 맞추기 */
    max-height: 70%; /* 컨테이너 높이에 맞추기 */
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}
</style>