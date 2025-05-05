<template>
    <div class="b-container">
        <h1 class="title" id="jamye-create1">{{ groupName }} 가챠 잼얘 목록 ({{ totalElements }}/{{ allPostCount }})
        </h1>
        <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="검색어를 입력해주세요" aria-describedby="button-addon2" v-model="keyword">
            <button class="btn btn-outline-dark" type="button" @click="jamyeSearch">검색</button>
        </div>
        <div class="input-group mb-3">
            <div v-for="(item, index) in items" :key="index" class="form-check">
                <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="'checkbox-' + index" 
                    :value="item.value" 
                    v-model="types"
                />
                <label class="form-check-label" :for="'checkbox-' + index">
                    {{ item.label }}
                </label>
            </div>
        </div>
        <div class="input-group mb-3">
            <div class="tag-list" v-for="tag in tags" :key="tag.tagSeq">
                <button 
                    class="btn btn-sm tag-item-btn" 
                    :class="{ 'btn-danger': isSelected(tag.tagSeq), 'btn-secondary': !isSelected(tag.tagSeq) }"
                    @click="toggleTag(tag.tagSeq)"
                >
                    #{{ tag.tagName }}
                </button>
            </div>
            <div v-if="!tagLast">
                <button class="btn btn-sm tag-more-btn" @click="tagNextPage">더보기</button>
            </div>
        </div>
        <div class="jamye-page" v-if="jamyes.length != 0">
            <div class="jamye-info-box-container">
                <div class="jamye-info-box" v-for="jamye in jamyes" :key="jamye.postSequenc"
                    :class="{ selectable: jamye.isViewable }"
                    @click="movePost(jamye.postType, jamye.postSequence, jamye.isViewable)" 
                >
                    <div class="jamye-header">
                        <div class="jamye-type">{{ jamye.postTypeName }}</div>
                        <div class="jamye-title">{{ jamye.title }}</div>
                        <div class="isViewable" v-if="jamye.isViewable">{{ jamye.isViewableName }}</div>
                    </div>
                    <div class="tag-list">
                        <div
                            v-for="tag in jamye.tags" :key="tag.tagPostConnectionSeq"
                            class="tag-item"
                            @mouseover="hoverIndex = index"
                            @mouseleave="hoverIndex = -1"
                        >
                            # {{ tag.tagName }}
                        </div>
                    </div>
                    <div class="jamye-detail">
                        <div>작성자: {{ jamye.createdUserNickName }}</div>
                        <div>생성일: {{ jamye.createDate }}</div>
                        <div>수정일: {{ jamye.updateDate }}</div>
                    </div>
                </div>
            </div>
            <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage == 0 }">
                    <a class="page-link" v-if="currentPage == 0">
                        <font aria-hidden="true" color="black">&laquo;</font>
                    </a>
                    <a class="page-link" v-else @click="pageClick(currentPage - 1)">
                        <font color="black" aria-hidden="true">&laquo;</font>
                    </a>
                </li>
                
                <li v-for="page in totalPage" :key="page" class="page-item">
                    <a class="page-link" @click="pageClick(page - 1)">
                        <font v-if="page - 1 == currentPage" color="red">{{ page }}</font>
                        <font v-else color="black">{{ page }}</font>
                    </a>
                </li>
                
                <li class="page-item" :class="{ disabled: currentPage + 1 == totalPage }">
                    <a class="page-link" v-if="currentPage + 1 == totalPage">
                        <font color="black" aria-hidden="true">&raquo;</font>
                    </a>
                    <a class="page-link" v-else @click="pageClick(currentPage + 1)">
                        <font color="black" aria-hidden="true">&raquo;</font>
                    </a>
                </li>
            </ul>
        </div>
        <div v-else>
                    등록된 잼얘가 없습니다.
        </div>
    </div>
</template>
<script>
import axios from '@/js/axios';
export default{
    data() {
        return {
            jamyes: {},
            keyword: null,
            currentPage: 0,
            totalPage: 0,
            tagPage: 0,
            tagLast: true,
            types: new Set,
            items: [
                { label: "포스트", value: "BOR" },
                { label: "메세지", value: "MSG" }
            ],
            tags: new Set,
            selectedTags: [],
            totalElements: 0,
            allPostCount: 0,
            groupSeq: null
        }
    },
    props: {
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    watch: {
        types: {
            handler() {
                this.jamyeSearch();
            },
            deep: true
        },
        selectedTags: {
            handler() {
                this.jamyeSearch();
            },
            deep: true 
        }
    },
    created() {
        this.groupSeq = this.$cookies.get("groupSeq")
        if(!this.isLogin) {
            this.$toastr.warning("로그인 후 조회 가능합니다.")
            this.$router.push("/login")
        } else if(this.groupSeq == null) {
            this.$toastr.warning("잼얘를 조회할 그룹을 먼저 선택해주세요")
            this.$router.push("/")
            return
        } else {
            axios.get("/api/group/name/" + this.groupSeq, {
              headers: {
              Authorization: `Bearer ${this.$cookies.get('accessToken')}`
              }
          }).then(r => {
            this.groupName = r.data.data.name
          }) 
        }
        this.jamyeList()
        this.tagList()
    },
    methods: {
        jamyeList() {
            const safeParam = encodeURIComponent(this.keyword);
            axios.get(`/api/post/${this.groupSeq}?page=${this.currentPage}` 
                + (this.keyword==null?"":`&keyword=${safeParam}`)
                + (this.selectedTags == null || this.selectedTags.size == 0 ? "" : `&tagSeqs=${Array.from(this.selectedTags).join(", ")}`)
                + (this.types == null || this.types.size == 0 ? "" : `&types=${Array.from(this.types).join(", ")}`)
            , {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
                }).then(r => {
                    const jamyesData = r.data.data.content;
                    this.totalPage = r.data.data.totalPages
                    const formatDate = (dateString) => {
                        const apiTime = new Date(dateString);
                        return `${apiTime.getFullYear()}-${String(apiTime.getMonth() + 1).padStart(2, '0')}-${String(apiTime.getDate()).padStart(2, '0')} ${String(apiTime.getHours()).padStart(2, '0')}:${String(apiTime.getMinutes()).padStart(2, '0')}`;
                    };

                    jamyesData.forEach(jamye => {
                        if (jamye.createDate) {
                            jamye.createDate = formatDate(jamye.createDate);
                        }
                        if (jamye.updateDate) {
                            jamye.updateDate = formatDate(jamye.updateDate);
                        }
                        if (jamye.postType == 'MSG') {
                            jamye.postTypeName = "메세지"
                        } else {
                            jamye.postTypeName = "포스트"
                        }
                        if(jamye.isViewable) {
                            jamye.isViewableName = "보유"
                        }
                    });

                    this.jamyes = jamyesData;
                }).catch(e => {
                    this.$toastr.warning(e.response.data.message)
                    this.$router.push("/")
                })

                axios.get(`/api/group/${this.groupSeq}/all-post/count`, {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
                }).then(r => {
                    this.allPostCount = r.data.data.totalCount
                    this.totalElements = r.data.data.haveCount
                }).catch(e => {
                    this.$toastr.warning(e.response.data.message)
                    this.$router.push("/")
                })
        },
        jamyeSearch() {
            console.log(this.types)
            this.currentPage = 0
            this.jamyeList()
        },
        movePost(type, postSeq, isViewable) {
            if(!isViewable) {
                return
            }
            if(type == "MSG") {
                this.$router.push({ 
                    name: 'messageJamye',
                    params: { postSeq: postSeq },
                    query: { groupSeq: this.groupSeq }
                })
            } else if(type == "BOR") {
                this.$router.push({ 
                    name: 'boardJamye',
                    params: { postSeq: postSeq },
                    query: { groupSeq: this.groupSeq }
                })
            }
        },
        pageClick(page){
            this.currentPage=page
            this.jamyeList()
        },
        tagNextPage() {
            this.tagPage = this.tagPage + 1
            this.tagList()
        },  
        tagList() {
            axios.get(`/api/post/tag/${this.groupSeq}?page=${this.tagPage}`, {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
            }).then(r => {
                r.data.data.content.forEach(item => this.tags.add(item))
                this.tagLast = r.data.data.last
                
            }).catch(e => {
                    this.$toastr.warning(e.response.data.message)
                    this.$router.push("/")
                })
        },
        isSelected(tagSeq) {
            return this.selectedTags.includes(tagSeq);
        },
        toggleTag(tagSeq) {
            const index = this.selectedTags.indexOf(tagSeq);
            if (index === -1) {
                this.selectedTags.push(tagSeq); // 선택 (Long 값 추가)
            } else {
                this.selectedTags.splice(index, 1); // 해제
            }
        },
    }
    
}
</script>
<style>
@import url("/src/css/tag.css");
.jamye-info-box-container {
    max-height: 800px;
    min-height: 500px;
    overflow-y: auto;
    padding-right: 10px;
}
.jamye-info-box {
    align-items: center;
    margin-bottom: 20px;
    margin-top: 10px;
    margin-left: 5px;
    background-color: #ffffff;
    border-radius: 20px;
    height: auto;
    outline-style: solid;
    outline-color: #d7d7d7;
    overflow: hidden;
}
.jamye-info-box.selectable {
    cursor: pointer;
    opacity: 1;
}

.jamye-info-box.selectable:hover {
    color: darkblue;
    /* transform: scale(1.05); */
}
.jamye-header {
    display: flex;
    justify-content: space-between;
}
.jamye-type {
    margin-left: 15px;
    margin-top: 15px;
    background-color: black;
    color: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 5px 10px;
    align-items: center;
    font-size: 14px;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease-in-out;
}
.jamye-title {
    font-weight: bold;
    font-size: 20px;
    margin-left: 15px;
    margin-top: 15px;
    margin-right: auto;
}
.isViewable {
    margin-top: 15px;
    margin-right: 10px;
    text-align: right;
    background-color: black;
    border-radius: 10px;
    color: white;
    padding: 5px 10px;
}
.jamye-detail {
    margin-left: 15px;
    margin-bottom: 5px;
    font-size: 15px;
    display: flex;
    gap: 10px
}
.pagination {
    color: black;
}
.form-check {
    margin-right: 10px;
}

.tag-item {
  font-size: 10px;
}

.tag-item-btn {
  font-size: 15px;
  margin-left: 5px;
  border-radius: 20px !important;
  background-color: #6c757d;
}
.tag-more-btn {
    background-color: #8a9096 !important;
    color: white !important;
    margin-top: 3px;
    margin-left: 15px;
}

.tag-list {
    margin-left: 15px;
    margin-top: 5px;
}
</style>
