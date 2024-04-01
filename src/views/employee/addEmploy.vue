<template>
  <div class="app-container">
    <el-form ref="staff_form" class="form_width" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="人员名称">
        <el-input v-model="form.staff_name" />
      </el-form-item>
      <el-form-item label="人员编码" prop="staff_code">
        <el-input v-model="form.staff_code" />
      </el-form-item>
      <el-form-item label="联系方式" prop="staff_tel">
        <el-input v-model="form.staff_tel" />
      </el-form-item>
      <el-form-item label="电子邮件" prop="staff_email">
        <el-input v-model="form.staff_email" />
      </el-form-item>
      <el-form-item label="联系地址">
        <el-input v-model="form.staff_address" />
      </el-form-item>
      <el-form-item label="人员状态">
        <el-select v-model="form.staff_status" placeholder="请选择人员状态" @change="status_change">
          <el-option v-for="status in status_list" :key="status.status_id" :label="status.status_name" :value="status.status_id" />
        </el-select>
      </el-form-item>
      <el-form-item label="人员身份">
        <el-select v-model="form.staff_role" placeholder="请选择人员身份" @change="role_change">
          <el-option v-for="role in role_list" :key="role.role_id" :label="role.role_name" :value="role.role_id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('staff_form')">提交</el-button>
        <el-button @click="onCancel">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import service from '@/utils/request'
import { Message } from 'element-ui'

export default {
  data() {
    var validateStaffCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('人员编码不能为空'))
      }
      setTimeout(() => {
        if (value < 3) {
          callback(new Error('长度必须大于3'))
        } else {
          callback()
        }
      }, 1000)
    }
    return {
      form: {
        staff_name: '',
        staff_code: '',
        staff_tel: '',
        staff_address: '',
        staff_email: '',
        staff_status: '',
        staff_role: ''
      },
      role_list: null,
      status_list: null,
      rules: {
        staff_code: [
          { validator: validateStaffCode, trigger: 'blur' }
        ],
        staff_tel: [
          { min: 11, max: 11, message: '长度在为11个数字', trigger: 'blur' }
        ],
        staff_email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  created() {
    this.get_role_list()
    this.get_status_list()
  },
  methods: {
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          service.post('/staff/add', this.$qs.stringify(
            { 'staff_code': this.form.staff_code, 'staff_name': this.form.staff_name,
              'staff_tel': this.form.staff_tel, 'staff_address': this.form.staff_address,
              'staff_email': this.form.staff_email, 'staff_status': this.form.staff_status,
              'staff_role': this.form.staff_role
            })).then((resp) => {
            if (resp.code === '20001') {
              Message({
                message: resp.msg,
                type: 'success',
                duration: 3 * 1000
              })
              this.$router.push('/employee/list')
            }
          })
        } else {
          Message({
            message: '请检查输入项',
            type: 'error',
            duration: 3 * 1000
          })
          return false
        }
      })
    },
    onCancel() {
      this.form.staff_email = null
      this.form.staff_status = null
      this.form.staff_tel = null
      this.form.staff_role = null
      this.form.staff_address = null
      this.form.staff_name = null
      this.form.staff_code = null
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
    status_change(val) {
      this.form.staff_status = val
    },
    role_change(val) {
      this.form.staff_role = val
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
.form_width{
  width: 50%;
}
</style>

