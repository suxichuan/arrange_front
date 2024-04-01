<template>
  <div class="app-container">
    <el-row>
      <div class="control_btn">
        <!-- <el-button type="primary" size="mini" icon="el-icon-edit" @click="add_place('add')">添加</el-button> -->
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="add_place('add')">添加</el-button>
        <el-input
          v-model="key_place_name"
          class="mimi_margin_l input_width_mini"
          placeholder="请输入值班地点名称"
          prefix-icon="el-icon-search"
        />
        <el-input
          v-model="key_place_code"
          class="mimi_margin_l input_width_mini"
          placeholder="请输入地点编码"
          prefix-icon="el-icon-search"
        />
        <el-button class="mimi_margin_l" icon="el-icon-search" @click="search()" />
      </div>
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
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="值班地点编码" align="center">
        <template slot-scope="scope">
          {{ scope.row.place_code }}
        </template>
      </el-table-column>
      <el-table-column label="值班地点名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.place_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值班地点人数" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.duty_place_num }}</span>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="值班地点状态" align="center">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="禁用后该值班点不可排班" placement="top">
            <el-tag :type="scope.row.place_status | statusFilter">{{ scope.row.place_status == 1 ? '启用' : '禁用' }}
              <el-switch
                v-model="scope.row.place_status==1 ? true:false"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="updatePlacestatus(scope.row.place_code,scope.row.place_status)"
              />
            </el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          {{ format_date(scope.row.create_time) }}
        </template>
      </el-table-column>

      <el-table-column align="center" prop="created_at" label="更新时间">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ format_date(scope.row.update_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" width="120" prop="created_at" label="操作">
        <template slot-scope="scope">
          <div class="btn">
            <el-link
              type="info"
              @click="update_info('update',scope.row.place_code,scope.row.place_name,scope.row.duty_place_num)"
            >修改
            </el-link>
            <el-link type="danger" @click="delete_place(scope.row.place_code)">删除</el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <span>确定删除编码为{{ place_code }}条记录吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="delete_place_confirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="title" :visible.sync="dialogFormVisible" :close-on-click-modal="close_dialog()">
      <el-form :model="form">
        <el-form-item label="地点编号" :label-width="formLabelWidth">
          <el-input v-model="form.place_code" type="number" :disabled="is_disable" autocomplete="off" @blur="check_code()" />
          <el-alert
            v-show="show_tips"
            :title="tips"
            type="error"
            :closable="false"
          />
        </el-form-item>
        <el-form-item label="值班地点名称" :label-width="formLabelWidth">
          <el-input v-model="form.place_name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="值班人数" :label-width="formLabelWidth">
          <el-input v-model="form.place_num" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm_update()">确 定</el-button>
      </div>
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
      </div>
    </el-row>
  </div>
</template>

<script>
import service from '@/utils/request'
import { Message } from 'element-ui'
import { delete_place } from '@/api/place'
import moment from 'moment'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '启用',
        2: '停用'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      value: true,
      dialogVisible: false,
      key_place_name: null,
      key_place_code: null,
      place_code: null,
      place_name: null,
      flag: false,
      save_btn: false,
      total: 0,
      dialogFormVisible: false,
      form: {
        place_code: '',
        place_name: '',
        place_num:''
      },
      formLabelWidth: '120px',
      title: null,
      is_disable: false,
      type: null,
      current_page: 1,
      page_size: 10,
      tips: null,
      show_tips: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      service.get('/place/list?current_page=' +
        this.current_page + '&page_size=' + this.page_size + '&key_place_name=' +
        this.key_place_name + '&key_place_code=' + this.key_place_code).then((resp) => {
        if (resp.code === '20000') {
          this.list = resp.data.list
          this.listLoading = false
          this.total = resp.data.total
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
    updatePlacestatus(place_code, place_status) {
      service.post('/place/updatestatus', this.$qs.stringify({
        'place_code': place_code,
        'place_status': place_status
      })).then((resp) => {
        if (resp.code === '20004') {
          this.fetchData()
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
    delete_place(place_code) {
      this.place_code = place_code
      this.dialogVisible = true
    },
    delete_place_confirm() {
      this.dialogVisible = false
      delete_place({ 'place_code': this.place_code }).then((resp) => {
        if (resp.code === '20004') {
          this.fetchData()
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
    update_info(type, place_code, place_name,duty_place_num) {
      this.title = '修改值班地点信息'
      if (this.is_disable === false) {
        this.is_disable = true
      }
      this.dialogFormVisible = true
      this.form.place_code = place_code
      this.form.place_name = place_name
       this.form.place_num = duty_place_num
      this.type = type
    },
    confirm_update() {
      let request_url = null
      if (this.type === 'update') {
        request_url = '/place/update'
      } else {
        request_url = '/place/add'
      }
      service.post(request_url, this.$qs.stringify({ 'place_code': this.form.place_code,
        'place_name': this.form.place_name,'place_num':this.form.place_num })).then((resp) => {
        // console.log(resp)
        if (resp.code === '20004') {
          this.dialogFormVisible = false
          this.fetchData()
          Message({
            message: resp.msg,
            type: 'success',
            duration: 3 * 1000
          })
        } else {
          this.dialogFormVisible = false
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
    add_place(type) {
      this.form.place_code = ''
      this.form.place_name = ''
      this.form.place_num = ''
      this.type = type
      this.title = '添加值班地点信息'
      if (this.is_disable === true) {
        this.is_disable = false
      }
      this.dialogFormVisible = true
      // console.log(place_code)
    },
    close_dialog() {
      // this.form.place_code = ''
      // this.form.place_name = ''
    },
    search() {
      service.get('/place/list?current_page=' +
        this.current_page + '&page_size=' + this.page_size + '&key_place_name=' +
        this.key_place_name + '&key_place_code=' + this.key_place_code).then((resp) => {
        console.log(resp)
        if (resp.code === '20000') {
          this.list = resp.data.list
          this.listLoading = false
          this.total = resp.data.total
        } else {
          this.listLoading = false
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
    format_date(date) {
      return moment(date).format('YYYY/MM/DD HH:MM:SS')
    },
    current_change(val) {
      this.current_page = val
      this.fetchData()
    },
    check_code() {
      this.show_tips = false
      if (this.form.place_code === null) {
        return
      }
      service.get(`/place/checkcode?place_code=` + this.form.place_code).then((resp) => {
        console.log(resp)
        if (resp.code === '20006') {
          this.show_tips = true
          this.tips = resp.msg
        }
      })
    }
  }
}
</script>
<style>
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
 /*  .control_btn{
     display: flex;
     flex-direction: row;
   } */
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
