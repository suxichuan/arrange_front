<template>
  <div class="app-container">
    <el-row>
        <el-button type="primary" icon="el-icon-edit" @click="addrole('add')">添加</el-button>
        <el-input
          v-model="keyword"
          class="mimi_margin_l input_width_mini"
          placeholder="请输入人员状态名称"
          prefix-icon="el-icon-search"
        />
        <el-button class="mimi_margin_l" icon="el-icon-search" @click="search()" />
    </el-row>
    <el-table
      v-loading="listLoading"
      class="mid_margin_t"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="人员状态ID" align="center">
        <template slot-scope="scope">
          {{ scope.row.status_id }}
        </template>
      </el-table-column>
      <el-table-column label="人员状态名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status_name }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="人员状态是否禁用" align="center">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="禁用后该角状态不参与排班" placement="top">
            <el-tag :type="scope.row.status_isdisable">{{ scope.row.status_isdisable == 1 ? '启用' : '禁用' }}
              <el-switch
                v-model="scope.row.status_isdisable==1 ? true:false"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="updatestatus(scope.row.status_id,scope.row.status_isdisable)"
              />
            </el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="人员状态创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ format_date(scope.row.create_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="人员状态修改时间" align="center">
        <template slot-scope="scope">
          {{ format_date(scope.row.update_time) }}
        </template>
      </el-table-column>
      <el-table-column align="center" width="120" prop="created_at" label="操作">
        <template slot-scope="scope">
          <div class="btn">
            <el-link
              type="info"
              @click="update_info('update',scope.row.status_id,scope.row.status_name)"
            >修改
            </el-link>
            <el-link class="mini_margin_l" type="danger" @click="delete_status(scope.row.status_id)">删除</el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="删除人员状态信息"
      :visible.sync="deletedialogVisible"
      width="30%">
      <span> 确定要删除ID为 {{ status_id }} 信息吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deletedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm_delete">确 定</el-button>
      </span>
    </el-dialog>
    <el-row id="page_block">
        <div class="block mid_margin_t">
          <span class="demonstration" />
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :current-page.sync="current_page"
            @current-change="current_change"
          />
    </el-pagination>
        </div>
      </el-row>
      <el-dialog
        :title="tips"
        :visible.sync="dialogVisible"
        width="50%">
        <el-form>
          <el-form-item label="人员状态名称:" :label-width="formLabelWidth">
            <el-input v-model="status_name" type="text"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirm_operation">确 定</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
  import service from '@/utils/request'
  import { Message } from 'element-ui'
  import moment from 'moment'
  export default {
    data() {
      return {
        dialogVisible: false,
        listLoading: false,
        type:null,
        keyword: null,
        list:null,
        total:0,
        current_page: 1,
        page_size: 10,
        deletedialogVisible: false,
        status_id:null,
        tips: null,
        status_name:null,
        dialogVisible: false,
        formLabelWidth: '200px',
        keyword: null
      }
    },
    created() {
      this.get_status_list()
    },
    methods:{
      confirm_operation(){
        let request_url=null
        if (this.type === "add"){
          request_url='/status/add'
        }else if (this.type === 'update'){
          request_url='/status/update'
        }
       service.post(request_url, this.$qs.stringify({'status_id':this.status_id, 'status_name': this.status_name })).then((resp) => {
         if (resp.code === '20004') {
           this.dialogVisible = false
           Message({
             message: resp.msg,
             type: 'success',
             duration: 3 * 1000
           })
         } else {
           this.dialogVisible = false
           Message({
             message: resp.msg,
             type: 'error',
             duration: 3 * 1000
           })
         }
         this.get_status_list()
       }).catch(error => {
         Message({
           message: error,
           type: 'error',
           duration: 3 * 1000
         })
       })
      },
      search(){
        this.get_status_list()
      },
      get_status_list(){
        this.listLoading = true
        service.get('/status/list?current_page=' +
          this.current_page + '&page_size=' + this.page_size + '&keyword=' +
          this.keyword).then((resp) => {
          if (resp.code === '20000') {
            this.list = resp.data.page.list
            this.listLoading = false
            this.total = resp.data.page.total
          } else {
            this.listLoading = false
            Message({
              message: resp.msg,
              type: 'error',
              duration: 3 * 1000
            })
          }
        }).catch(error => {
          this.listLoading = false
          Message({
            message: error,
            type: 'error',
            duration: 3 * 1000
          })
        })
      },
      format_date(date) {
        if ( date === null ){
          return
        }
        return moment(date).format('YYYY/MM/DD')
      },
      update_info(type,id,status_name){
        this.tips='修改人员状态信息'
        this.status_id = id
        this.status_name= status_name
        this.dialogVisible = true
        this.type = 'update'
      },
      delete_status(id){
        this.status_id = id
        this.deletedialogVisible = true
      },
      confirm_delete(){
        this.deletedialogVisible = false
        service.get('/status/delete?status_id='+this.status_id).then((resp) => {
          if (resp.code === '20004') {
            this.get_status_list()
            Message({
              message: resp.msg,
              type: 'success',
              duration: 3 * 1000
            })
          } else {
            Message({
              message: resp.msg,
              type: 'error',
              duration: 3 * 1000
            })
          }
        }).catch(error => {
          Message({
            message: error,
            type: 'error',
            duration: 3 * 1000
          })
        })
      },
      current_change(val) {
        this.current_page = val
        this.get_status_list()
      },
      updatestatus(status_id, status_isdisable) {
        service.post('/status/updatestatus', this.$qs.stringify({
          'status_id': status_id,
          'status_isdisable': status_isdisable
        })).then((resp) => {
          if (resp.code === '20004') {
            this.get_status_list()
            Message({
              message: resp.msg,
              type: 'success',
              duration: 3 * 1000
            })
          } else {
            Message({
              message: resp.msg,
              type: 'error',
              duration: 3 * 1000
            })
          }
        }).catch(error => {
          Message({
            message: error,
            type: 'error',
            duration: 3 * 1000
          })
        })
      },
      addrole(type){
        this.tips='添加人员状态信息'
        this.status_name = ''
        this.type = type
        this.dialogVisible = true
      }
    }
  }
</script>

<style>
  .wid_date_input{
    width: 100%!important;
  }

  .btn{
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .edit-input{
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    outline: 1px solid #ccc;
    border: 1px solid #ccc;
    padding: 5px 5px 5px 5px;
    width: 300px;
    height: 70px;
    line-height: 40px;
  }
  .place_name_box{
    padding-left: 10px;
    padding-right: 10px;
    box-sizing: border-box;
  }
  .control_btn{
    display: flex;
    flex-direction: row;
  }
  .mimi_margin_l{
    margin-left: 10px;
  }
  .mid_margin_t{
    margin-top: 20px;
  }
  .input_width_mini{
    width: 240px;
  }
  #page_block{
    text-align: center;
  }
</style>
