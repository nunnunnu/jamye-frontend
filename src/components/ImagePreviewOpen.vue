<template>
    <div class="image-preview-overlay" @click="closePreview">
        <div class="image-preview-container">
            <img 
                v-if="image" 
                :src="image" 
                alt="Preview Image" 
                class="large-image" 
                />
            <img v-else-if="imageUrlLink != null" :src="imageSrc" alt="Preview Image" class="large-image" />  
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
    computed: {
        imageSrc() {
            // base64 데이터인지 확인
            if (this.imageUrlLink && this.imageUrlLink.startsWith('data:image')) {
                return this.imageUrlLink;
            } else {
                // 일반 URL인 경우
                return this.imageUrl(this.imageUrlLink);
            }
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
    max-width: 90vw; /* 뷰포트 너비의 90% */
    max-height: 90vh; /* 뷰포트 높이의 90% */
    width: auto;
    height: auto;
    object-fit: contain; /* 비율 유지하면서 컨테이너에 맞춤 */
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}
</style>