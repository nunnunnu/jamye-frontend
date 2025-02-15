<template>
    <div class="image-preview-overlay" @click="closePreview">
        <div class="image-preview-container">
            <img 
                v-if="image" 
                :src="image" 
                alt="Preview Image" 
                class="large-image" 
                />
            <img v-else-if="imageUrlLink != null" :src="imageUrl(imageUrlLink)" alt="Preview Image" class="large-image" />  
        </div>
    </div>
</template>
<script>
import { imageUrl } from '@/js/fileScripts';
export default {
    data() {
        return {
        }
    },
    props: {
        image: {
            type: File,
            require: false,
        },
        imageUrlLink: {
            type: String,
            require: false,
        }
    },
    methods: {
        imageUrl,
        closePreview() {
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