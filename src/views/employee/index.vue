<template>
  <div class="app-container">
    <el-row>
      <div class="control_btn">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="add_staff">添加</el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click="delete_bitch_staff">批量删除</el-button>
        <el-button size="mini"  type="info" @click="import_staff_file">通过模板导入</el-button>
        <el-button size="mini" type="info" plain @click="export_staff_file">模板下载</el-button>
        <el-input
          v-model="key_employee_name"
          class="mimi_margin_l input_width_mini"
          placeholder="请输入人员名称"
          prefix-icon="el-icon-search"
        />
        <el-input
          v-model="key_employee_code"
          class="mimi_margin_l input_width_mini"
          placeholder="请输入人员编码"
          prefix-icon="el-icon-search"
        />
        <el-button class="mimi_margin_l" icon="el-icon-search" @click="search" />
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column label="人员编码" align="center" fixed>
        <template slot-scope="scope">
          {{ scope.row.staff_code }}
        </template>
      </el-table-column>
      <el-table-column label="人员名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.staff_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系方式" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.staff_tel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系地址" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.staff_address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="人员状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.staff_status }} </span>
        </template>
      </el-table-column>
      <el-table-column label="人员角色" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.staff_role }} </span>
        </template>
      </el-table-column>
      <el-table-column label="电子邮件" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.staff_email }}</span>
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
      <el-table-column
        fixed="right"
        label="操作"
        width="150"
      >
        <template slot-scope="scope">
          <div class="btn">
            <el-link
              type="primary"
              @click="update_info(scope.row.staff_code,scope.row.staff_name,
              scope.row.staff_tel,scope.row.staff_address,scope.row.staff_email,
              scope.row.create_time,scope.row.update_time,scope.row.staff_role
              ,scope.row.staff_status,scope.row.staff_role_id,scope.row.staff_status_id)"
            >查看
            </el-link>
            <el-link type="danger" @click="delete_staff(scope.row.staff_code)">删除</el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div id="page_block" class="block mid_margin_t">
      <el-pagination
        :current-page="current_page"
        :page-sizes="[30, 50, 100, 200]"
        :page-size="page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @prev-click="prevPage"
      />
    </div>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="50%"
    >
      <el-upload
        ref="upload"
        class="upload-demo"
        drag
        action="http://localhost:5000/staff/addbatch"
        :auto-upload="false"
        :on-preview="handlePreview"
        :on-success="upSuccess"
        multiple
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传xlsx/txt文件，且不超过500kb</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="提示"
      :visible.sync="deleteDialog"
      width="30%"
    >
      <span>确定删除编码为<span v-for="i in ids" :key="i">{{ i }}、</span>{{ staff_code }} 的记录吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialog = false">取 消</el-button>
        <el-button type="primary" @click="delete_staff_confirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="人员信息查看与修改"
      :visible.sync="infodialogVisible"
      width="60%">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>人员信息</span>
        <el-button style="float: right; padding: 3px 0" type="text" v-show="!editflag" @click="update_info_click">修改</el-button>
        <el-button style="float: right; padding: 3px 0" type="text" v-show="editflag" @click="update_info_cannel">取消</el-button>
         <el-button style="float: right; padding: 3px 0" type="text" v-show="editflag" @click="update_info_save">保存</el-button>

      </div>
      <el-row>
       <el-descriptions :column='2'>
           <el-descriptions-item label="员工编码">
               <span class="discription_span">{{ staff_info.staff_code }}</span>
           </el-descriptions-item>
           <el-descriptions-item label="员工姓名">
              <div class="discription_">
                <span>{{ staff_info.staff_name }}</span>
                <el-input class="input_style" v-show="editflag" v-model="staff_info.staff_name" />
              </div>
           </el-descriptions-item>
           <el-descriptions-item label="联系方式">
             <div class="discription_">
               <span>{{ staff_info.staff_tel }}</span>
               <el-input class="input_style" v-show="editflag" v-model="staff_info.staff_tel" />
             </div>
           </el-descriptions-item>
           <el-descriptions-item label="电子邮件">
             <div class="discription_">
               <el-tag size="small"><a href="">{{ staff_info.staff_email }}</a></el-tag>
               <el-input class="input_style" v-show="editflag" v-model="staff_info.staff_email" />
             </div>
           </el-descriptions-item>
           <el-descriptions-item label="联系地址">
             <div class="discription_">
               <span>{{ staff_info.staff_address }}</span>
               <el-input class="input_style" v-show="editflag" v-model="staff_info.staff_address" />
             </div>
           </el-descriptions-item>
           <el-descriptions-item label="人员角色">
             <div class="discription_">
               <span>{{ staff_info.staff_role }}</span>
               <!-- <el-input class="input_style" v-show="editflag" v-model="staff_info.staff_role" /> -->
              <el-select class="input_style" v-show="editflag" v-model="staff_info.staff_role" placeholder="请选择人员身份" @change="role_change">
                 <el-option v-for="role in role_list" :key="role.role_id" :label="role.role_name" :value="role.role_id" />
               </el-select>
             </div>
           </el-descriptions-item>
           <el-descriptions-item label="人员状态">
             <div class="discription_">
               <span>{{ staff_info.staff_status }}</span>
               <!-- <el-input class="input_style" v-show="editflag" v-model="staff_info.staff_status" /> -->
               <el-select class="input_style" v-show="editflag" v-model="staff_info.staff_status" placeholder="请选择人员状态" @change="status_change">
                 <el-option v-for="status in status_list" :key="status.status_id" :label="status.status_name" :value="status.status_id" />
               </el-select>
             </div>
           </el-descriptions-item>
           <el-descriptions-item label="创建时间">
               <span>{{ format_date(staff_info.create_time) }}</span>
           </el-descriptions-item>
           <el-descriptions-item label="修改时间">
               <span>{{ format_date(staff_info.update_time) }}</span>
           </el-descriptions-item>
       </el-descriptions>
      </el-row>

    </el-card>
      <span slot="footer" class="dialog-footer">
        <el-button @click="infodialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import service from '@/utils/request'
import { Message } from 'element-ui'
import moment from 'moment/moment'

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
      current_page: 1,
      page_size: 30,
      key_employee_name: null,
      key_employee_code: null,
      dialogVisible: false,
      total: 0,
      deleteDialog: false,
      staff_code: null,
      ids: [],
      infodialogVisible: false,
      editflag: false,
      staff_info:{
        staff_code: null,
        staff_name: null,
        staff_tel: null,
        staff_address: null,
        staff_email: null,
        create_time: null,
        update_time: null,
        staff_role: null,
        staff_status: null,
        staff_role_id: null,
        staff_status_id: null
      },
      role_list: null,
      status_list: null
    }
  },
  created() {
    this.fetchData()
    this.get_role_list()
    this.get_status_list()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      service.get('/staff/list?current_page=' +
        this.current_page + '&page_size=' + this.page_size + '&key_employee_name=' +
        this.key_employee_name + '&key_employee_code=' + this.key_employee_code).then((resp) => {
        if (resp.code === '20000') {
          this.list = resp.data.page.list
          this.total = resp.data.page.total
          this.listLoading = false
        } else {
          this.listLoading = false
          Message({
            message: resp.msg,
            type: 'error',
            duration: 3 * 1000
          })
        }
      }).catch(() => {
        this.listLoading = false
      })
    },
    format_date(date) {
      return moment(date).format('YYYY/MM/DD HH:MM:SS')
    },
    update_info(staff_code,staff_name,staff_tel,staff_address,staff_email,create_time,update_time,staff_role,staff_status,staff_role_id,staff_status_id) {
      this.staff_info.staff_code = staff_code
      this.staff_info.staff_name = staff_name
      this.staff_info.staff_tel = staff_tel
      this.staff_info.staff_address = staff_address
      this.staff_info.staff_email = staff_email
      this.staff_info.create_time = create_time
      this.staff_info.update_time = update_time
      this.staff_info.staff_role = staff_role
      this.staff_info.staff_status = staff_status
      this.staff_info.staff_role_id = staff_role_id
      this.staff_info.staff_status_id = staff_status_id
      this.infodialogVisible = true
      this.editflag = false
    },
    delete_staff(staff_code) {
      this.staff_code = staff_code
      this.deleteDialog = true
    },
    add_staff() {
      this.$router.push('/employee/add')
    },
    search() {
      this.fetchData()
    },
    import_staff_file() {
      this.dialogVisible = true
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    handlePreview(file) {
      console.log(file)
    },
    handleSizeChange(val) {
      this.page_size = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.current_page = val
      this.fetchData()
      // console.log(`当前页: ${val}`)
    },
    prevPage() {
      console.log(`当前页:`)
    },
    export_staff_file() {
      service.get('/staff/export_template', { responseType: 'blob' }).then((resp) => {
        const blob = new Blob([resp], { type: 'application/vnd.ms-excel;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', '人员信息模板.xls')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
    },
    upSuccess(response, file, fileList) {
      if (response.code === '20004') {
        this.dialogVisible = false
        file = null
        fileList = null
        this.fetchData()
        Message({
          message: response.msg + '数据导入成功！',
          type: 'success',
          duration: 3 * 1000
        })
      } else {
        file = null
        fileList = null
        Message({
          message: response.msg + '请检查模板或人员编码是否重复！',
          type: 'error',
          duration: 5 * 1000
        })
      }
    },
    delete_staff_confirm() {
      this.deleteDialog = false
      if (this.ids.length > 0) {
        const str_ids = this.ids.join(',')
        service.get(`/staff/deletebitch?ids=${str_ids}`).then((resp) => {
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
        }).catch((error) => {
          Message({
            message: error,
            type: 'error',
            duration: 3 * 1000
          })
        })
      } else {
        service.get(`/staff/delete?staff_code=${this.staff_code}`).then((resp) => {
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
      }
    },
    handleSelectionChange(val) {
      this.ids = []
      for (const elem of val) {
        this.ids.push(elem.staff_code)
      }
    },
    delete_bitch_staff() {
      // console.log(1)
      this.deleteDialog = true
    },
    update_info_click(){
      this.editflag = true
    },
    update_info_cannel(){
      this.editflag = false
    },
    get_role_list() {
      service.get('/role/rolelist').then((resp) => {
        if (resp.code === '20000') {
          this.role_list = resp.data
        } else {
          Message({
            message: '人员身份列表获取失败',
            type: 'error',
            duration: 3 * 1000
          })
        }
      }).catch(() => {
        Message({
          message: '人员身份列表获取失败',
          type: 'error',
          duration: 3 * 1000
        })
      })
    },
    get_status_list() {
      service.get('/status/statuslist').then((resp) => {
        if (resp.code === '20000') {
          this.status_list = resp.data
        } else {
          Message({
            message: '人员状态列表获取失败',
            type: 'error',
            duration: 3 * 1000
          })
        }
      }).catch(() => {
        Message({
          message: '人员状态列表获取失败',
          type: 'error',
          duration: 3 * 1000
        })
      })
    },
    role_change(val) {
      this.staff_info.staff_role_id = val

    },
    status_change(val) {
      this.staff_info.staff_status_id = val
    },
    update_info_save(){
      service.post('/staff/update_info', this.$qs.stringify(
        { 'staff_code': this.staff_info.staff_code, 'staff_name': this.staff_info.staff_name,
          'staff_tel': this.staff_info.staff_tel, 'staff_address': this.staff_info.staff_address,
          'staff_email': this.staff_info.staff_email, 'staff_status_id': this.staff_info.staff_status_id,
          'staff_role_id': this.staff_info.staff_role_id
        })).then((resp) => {
        if (resp.code === '20004') {
          this.fetchData()
          this.infodialogVisible = false
          Message({
            message: resp.msg,
            type: 'success',
            duration: 3 * 1000
          })

        }else{
          Message({
            message: resp.msg,
            type: 'error',
            duration: 3 * 1000
          })
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
.input_style{
 position: absolute;
  top: 0px;
  left: 0px;
  width: 240px;
}
.discription_{
  /* border:1px solid black; */
  position: relative;
},
.discription_span{

}
.el-descriptions__body .el-descriptions__table .el-descriptions-item__cell{
  line-height:2.5!important;
}
</style>
