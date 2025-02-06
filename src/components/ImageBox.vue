<template>
    <div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="imageModalLabel">이미지 임시보관함</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                <label for="imageUploadInput" class="form-label">이미지 업로드</label>
                                <input class="form-control" type="file" id="imageUploadInput" @change="handleImageUpload" multiple>
                                </div>
                                <div class="row g-3" id="imagePreviewContainer">
                                    <div
                                        class="card position-relative"
                                        style="width: 18rem; cursor: pointer;"
                                        v-for="[key, value] in Object.entries(this.localImageUidMap)"
                                        :key="key"
                                        @click="toggleSelection(key)" 
                                    >
                                        <div v-if="value != null">
                                            <!-- 체크박스 -->
                                            <input
                                            type="checkbox"
                                            class="form-check-input position-absolute"
                                            style="top: 10px; left: 10px; z-index: 1;"
                                            :checked="selectedImages.includes(key)"
                                            readonly
                                            />
                                            <!-- 이미지 -->
                                            <img :src="value" class="card-img-top" alt="Uploaded Image" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button
                                    v-if="(this.imageKey != null && this.imageSeq != null) || this.cursorPosition != null"
                                    class="btn btn-primary me-2"
                                    :disabled="selectedImages.length === 0"
                                    @click="insertSelectedImages"
                                >
                                    삽입
                                </button>
                                <button
                                    class="btn btn-danger"
                                    :disabled="selectedImages.length === 0"
                                    @click="deleteSelectedImages"
                                >
                                    삭제
                                </button>
                                <button type="button" class="btn btn-dark" data-bs-dismiss="modal">닫기</button>
                            </div>
                            </div>
                        </div>
                    </div>
</template>
<script>
import { v4 as uuidv4 } from "uuid";
export default {
    data() {
        return {
            images: [],
            selectedImages: [],
            localMessage: this.message, 
            localImageUidMap: this.imageUidMap
        }
    },
    props: {
        imageKey: Number,
        imageSeq: Number,
        message: Map,
        type: String,
        imageUidMap: {
            type: Object,
            required: true
        },
        cursorPosition: Number
    },
    watch: {
        message: {
            deep: true,
            handler(newVal) {
                this.localMessage = newVal
            }
        }
    },
    setup() {
        
    },
    methods: {
        toggleSelection(index) {
            const selectedIndex = this.selectedImages.indexOf(index);
            if (selectedIndex === -1) {
                this.selectedImages.push(index);
            } else {
                this.selectedImages.splice(selectedIndex, 1);
            }
        },
        insertSelectedImages() {
            if(this.type == 'MSG') {
                if (this.localMessage[this.imageKey] && Array.isArray(this.localMessage[this.imageKey].message)) {
                    this.localMessage[this.imageKey].message.forEach(it => {
                        if(it.seq > this.imageSeq) {
                            it.seq = it.seq + 1
                        }
                    });
                    this.localMessage[this.imageKey].message.push({
                        seq: this.imageSeq + 1,
                        imageKey: this.selectedImages
                    })    
                    
                    this.localMessage[this.imageKey].message.sort((a, b) => a.seq - b.seq);
                    
                    this.$emit('messageUpdate', this.localMessage)
                }    
                this.selectedImages = []
            } else if(this.type == 'POST') {
                this.$emit('addImageAtCursor', this.selectedImages)
            }

        },
        deleteSelectedImages() {
            const usedImages = this.selectedImages.filter((key) => {
                
                return Object.values(this.localMessage).some((message) =>
                    message.message.some((msg) =>
                        msg.imageKey?.includes(key)
                    )
                );
            });

            if (usedImages.length > 0) {
                alert("선택한 이미지 중 사용 중인 이미지가 있어 삭제할 수 없습니다.");
                return;
            }
            this.selectedImages.forEach((key) => {
                this.localImageUidMap[key] = null
            }); 
            this.selectedImages = [];
        },
        handleImageUpload(event) {
            const files = Array.from(event.target.files);

            files.forEach((file) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    this.images.push(e.target.result); 
                    const id = uuidv4();
                    this.localImageUidMap[id] = e.target.result
                };

                reader.readAsDataURL(file); 
            });

            event.target.value = ""; 
            this.$emit("imageMap", this.localImageUidMap)
        },
    }
}

</script>
