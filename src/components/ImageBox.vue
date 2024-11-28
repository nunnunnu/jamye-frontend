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
                                        v-for="[key, value] in Object.entries(this.imageUidMap)"
                                        :key="key"
                                        @click="toggleSelection(key)" 
                                    ><span>sss</span>
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
                            <div class="modal-footer">
                                <button
                                    v-if="this.imageKey != null && this.imageSeq != null"
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
            selectedImages: []
        }
    },
    props: {
        imageKey: Number,
        imageSeq: Number,
        message: Map,
        imageUidMap: Map
    },
    created() {
        console.log(this.imageUidMap)
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
            const selectedImages = this.selectedImages.map(
                (index) => this.images[index]
            );
            console.log(this.message)
            
            if (this.message[this.imageKey] && Array.isArray(this.message[this.imageKey].message)) {
                this.message[this.imageKey].message.forEach(it => {
                    if(it.seq > this.imageSeq) {
                        it.seq = it.seq + 1
                    }
                });
                this.message[this.imageKey].message.push({
                    seq: this.imageSeq + 1,
                    image: selectedImages
                })    
                
                this.message[this.imageKey].message.sort((a, b) => a.seq - b.seq);

                this.$emit('messageResponse', this.message)
                
                if(this.isEditing[this.imageKey, this.imageSeq + 1]) {
                    console.log(true)
                    this.$emit.editMessage(this.imageKey, this.imageSeq + 1 + 1)
                }
                this.$emit.editMessage(this.imageKey, this.imageSeq + 1)
            }    
            this.selectedImages = []

        },
        deleteSelectedImages() {
            this.images = this.images.filter(
                (_, index) => !this.selectedImages.includes(index)
            );
            this.selectedImages = [];
        },
        handleImageUpload(event) {
            const files = Array.from(event.target.files);

            files.forEach((file) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    console.log(e.target.result)
                    this.images.push(e.target.result); 
                    const id = uuidv4();
                    console.log(id)
                    this.imageUidMap[id] = e.target.result
                };

                reader.readAsDataURL(file); 
            });

            event.target.value = ""; 
            console.log(this.imageUidMap)
            this.$emit("imageMap", this.imageUidMap)
            console.log(this.images)
            console.log(">..")
            
        },
    }
}

</script>
