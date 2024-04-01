<template>
  <div class="app-container">
    <el-row>
        <el-button type="primary" icon="el-icon-edit" @click="addoreditholidays('add')">添加</el-button>
        <el-input
          v-model="keyword"
          class="mimi_margin_l input_width_mini"
          placeholder="请输入节假日名称"
          prefix-icon="el-icon-search"
        />
        <el-button class="mimi_margin_l" icon="el-icon-search" @click="search()" />
    </el-row>
    <el-dialog
      :title="addorupdatetips"
      :visible.sync="dialogVisible"
      width="50%">
      <el-form :model="form">
        <el-form-item label="少数民族节假日名称:" :label-width="formLabelWidth">
          <el-input v-model="form.holidayname" type="text"/>
        </el-form-item>
        <el-form-item label="节假日开始日期" :label-width="formLabelWidth">
          <el-date-picker
                v-model="form.start"
                type="date" class="wid_date_input"
                value-format="yyyy-MM-dd"
                >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="节假日结束日期" :label-width="formLabelWidth">
          <el-date-picker
                v-model="form.end"
                type="date" class="wid_date_input"
                value-format="yyyy-MM-dd"
                >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth">
          <el-input v-model="form.comment" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm_operation">确 定</el-button>
      </div>
    </el-dialog>
    <el-table
      v-loading="listLoading"
      class="mid_margin_t"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="节假日编码" align="center">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="节假日名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.holidays_name }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="节假日开始时间" align="center">
        <template slot-scope="scope">
           <i class="el-icon-time" />
          <span>{{ format_date(scope.row.start_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="节假日结束时间" align="center">
        <template slot-scope="scope">
           <i class="el-icon-time" />
          {{ format_date(scope.row.end_time) }}
        </template>
      </el-table-column>

      <el-table-column align="center" prop="created_at" label="备注">
        <template slot-scope="scope">
          <span>{{ scope.row.comments }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" width="120" prop="created_at" label="操作">
        <template slot-scope="scope">
          <div class="btn">
            <el-link
              type="info"
              @click="update_info('update',scope.row.id,scope.row.holidays_name,scope.row.start_time,scope.row.end_time,scope.row.comments)"
            >修改
            </el-link>
            <el-link type="danger" @click="delete_holiday(scope.row.id)">删除</el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="删除少数民族节假日信息"
      :visible.sync="deletedialogVisible"
      width="30%">
      <span> 确定要删除ID为 {{ holiday_id }} 信息吗？</span>
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
        form:{
          id:null,
          holidayname: null,
          start: null,
          end: null,
          comment: null
        },
        formLabelWidth: '200px',
        type:null,
        keyword: null,
        list:null,
        holiday_id:null,
        addorupdatetips:null,
        deletedialogVisible: false,
        total:0,
        current_page: 1,
        page_size: 10
      }
    },
    created() {
      this.get_holiday_list()
    },
    methods:{
      addoreditholidays(type){
        this.addorupdatetips= '添加少数民族节日期信息'
        this.form.holidayname = null
        this.form.start = null
        this.form.end = null
        this.form.comment = null
        this.dialogVisible = true
        this.type = type
      },
      confirm_operation(){
        let request_url=null
        if (this.type === "add" && this.form.start<=this.form.end){
          request_url='/holidays/add'
        }else if (this.type === 'update'){
          request_url='/holidays/update'
        }
        else{
          this.dialogVisible = false
          Message({
            message: '输入数据不正确！',
            type: 'error',
            duration: 3 * 1000
          })
          return
        }
       service.post(request_url, this.$qs.stringify({'id':this.form.id, 'holiday_name': this.form.holidayname,
         'start': this.form.start,'end':this.form.end,'comment':this.form.comment })).then((resp) => {
         // console.log(resp)
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
         this.get_holiday_list()
       }).catch(error => {
         Message({
           message: error,
           type: 'error',
           duration: 3 * 1000
         })
       })
      },
      search(){
        this.get_holiday_list()
      },
      get_holiday_list(){
        this.listLoading = true
        service.get('/holidays/list?current_page=' +
          this.current_page + '&page_size=' + this.page_size + '&keyword=' +
          this.keyword).then((resp) => {
          // console.log(resp)
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
        return moment(date).format('YYYY/MM/DD')
      },
      update_info(type,id,holidayname,starttime,endtime,comment){
        this.addorupdatetips= '修改少数民族节日期信息'
        this.type = type
        this.form.holidayname = holidayname
        this.form.start = this.format_date(starttime)
        this.form.end = this.format_date(endtime)
        this.form.comment = comment
        this.form.id = id
        this.dialogVisible = true
      },
      delete_holiday(id){
        this.deletedialogVisible = true
        this.holiday_id = id
      },
      confirm_delete(){
        this.deletedialogVisible = false
        service.get('/holidays/delete?holiday_id='+this.holiday_id).then((resp) => {
          if (resp.code === '20004') {
            this.get_holiday_list()
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
        this.get_holiday_list()
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
