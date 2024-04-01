<template>
  <div>
    <el-row>
      <div class="control_btn max_margin_left mid_margin_top">
        <el-button type="primary" size="mini" icon="el-icon-refresh" @click="week_plan_duty('arrange')">周排班</el-button>
        <el-button type="info" size="mini" icon="el-icon-stopwatch" @click="week_plan_duty('clear')">清空本次排班</el-button>
        <el-button type="success" size="mini" icon="el-icon-stopwatch" @click="export_week_plan_duty">导出本周值班计划</el-button>
      </div>
    </el-row>
    <div class="mid_margin_top mid_margin_left flex">
       <div id="week_plan_pdf">
         <el-row v-for="dutyplan in duty_week_plan" :key="dutyplan.date" class="card-size mid_margin_left">
           <el-card class="box-card" shadow="hover">
             <div slot="header" class="clearfix">
               <span>{{ dutyplan.date }}</span>
               <span class="mid_margin_left">[{{ dutyplan.is_week }}]</span>
               <span class="mid_margin_left">{{ dutyplan.comment }}</span>
             </div>
             <div v-for="(item,index) in dutyplan.data" v-show="!(item.address===null)" :key="index" class="text item">
               <span style="color: red;font-size: 1.0rem;">值班地点：{{ item.address }}</span><br>
               <span class="mid_margin_left" style="font-size: 0.9rem;">值班人员：{{ item.namelist }}</span>
             </div>
           </el-card>
         </el-row>
       </div>
    </div>
    <el-dialog
      title="提示"
      :visible.sync="tipsDialog"
      width="30%"
    >
      <span>{{ value }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="tipsDialog = false">取 消</el-button>
        <el-button type="primary" @click="duty_arrange_confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import service from '@/utils/request'
import htmlToPdf from '@/utils/htmlToPdf'
import { Message } from 'element-ui'

export default {
  data() {
    return {
      duty_week_plan: null,
      tipsDialog: false,
      value: null,
      operation: null
    }
  },
  created() {
    this.getWeekPlanList()
  },
  methods: {
    getWeekPlanList() {
      service.get('/duty/get_week_duty_plan').then((resp) => {
        if (resp.code === '20000') {
          this.duty_week_plan = resp.data
          // console.log(this.duty_week_plan)
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
    week_plan_duty(type) {
      this.operation = type
      if (type === 'arrange') {
        this.value = '该操作会重新生成按周排班计划,从当前日开始'
      }
      if (type === 'clear') {
        this.value = '该操作会清空已生成的排班计划,请确认操作'
      }
      this.tipsDialog = true
    },
    duty_arrange_confirm() {
      if (this.operation === 'clear') {
        if (this.duty_week_plan.length === 0){
          Message({
            message: '计划为空无需清除值班计划',
            type: 'warning',
            duration: 3 * 1000
          })
          this.tipsDialog = false
          return
        }
        this.duty_week_clear()
      }
      if (this.operation === 'arrange') {
        this.duty_week_arrange_reset()
      }
    },
    duty_week_clear() {
      service.get('/duty/arrange_week_clear').then((resp) => {
        if (resp.code === '20004') {
          Message({
            message: resp.msg,
            type: 'success',
            duration: 3 * 1000
          })
          this.getWeekPlanList()
          this.tipsDialog = false
        } else {
          Message({
            message: resp.msg,
            type: 'error',
            duration: 3 * 1000
          })
          this.tipsDialog = false
        }
      }).catch(error => {
        Message({
          message: error,
          type: 'error',
          duration: 3 * 1000
        })
      })
    },
    duty_week_arrange_reset() {
      service.get('/duty/arrange_week').then((resp) => {
        if (resp.code === '20004') {
          Message({
            message: resp.msg,
            type: 'success',
            duration: 3 * 1000
          })
          this.getWeekPlanList()
          this.tipsDialog = false
        } else {
          Message({
            message: resp.msg,
            type: 'error',
            duration: 3 * 1000
          })
          this.tipsDialog = false
        }
      }).catch(error => {
        Message({
          message: error,
          type: 'error',
          duration: 3 * 1000
        })
      })
    },
    export_week_plan_duty(){
      if (this.duty_week_plan.length === 0){
        Message({
          message: '当前无值班计划无需导出',
          type: 'warning',
          duration: 3 * 1000
        })
        return
      }
      var dom=document.getElementById('week_plan_pdf')
      htmlToPdf.getPdf('周排班计划',dom,2,2)
    }
  }
}
</script>
<style scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: block;
  content: "";
}
 .clearfix:after {
  clear: both
}

.box-card {
  /* width: 480px; */
  height: 360px;
}
.mini_margin_top{
  margin-top: 5px;
}
.mid_margin_top{
  margin-top: 20px;
}
.mid_margin_left{
  margin-left: 20px;
}
.max_margin_left{
  margin-left: 40px;
}
.card-size{
  width:23%;
  float: left;
}
</style>
