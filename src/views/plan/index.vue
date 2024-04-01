<template>
  <div class="main_con">
    <div style="text-align: left;" class="flex">

    <el-row>
      <div class="max_margin_left mid_margin_top">
        <el-button type="primary" size="mini" class="mini_margin_r" @click="duty_month_arrange('arrange')">月度排班</el-button>
        <el-button type="info" size="mini" class="mini_margin_r" @click="duty_month_arrange('clear')">清空本次排班计划</el-button>
        <el-button type="success"  size="mini" class="mini_margin_r" @click="convertHTMLToPDF()">导出本月排班计划</el-button>
      </div>
    </el-row>
    </div>
   <div class="mid_margin_top mid_margin_left" id="html-content">
     <div>
       <el-row  v-for="dutyplan in scheduleData" :key="dutyplan.date" class="card-size mid_margin_left">
           <el-card class="box-card mid_margin_top" shadow="hover"  v-if="dutyplan.data.length>1">
               <div slot="header" class="clearfix">
                 <span>{{ dutyplan.date }}</span>
                 <span class="mid_margin_left">[{{ dutyplan.is_week }}]</span>
                 <span class="mid_margin_left">{{ dutyplan.comment }}</span>
               </div>
               <div v-for="(item,index) in dutyplan.data" v-show="!(item.address===null)" :key="index" class="text item mid_margin_bottom">
                 <span style="color: red;">值班地点：{{ item.address }}</span><br>
                 <span class="mid_margin_left" style="padding-bottom: 10px;">值班人员：{{ item.namelist }}</span>
               </div>
           </el-card>
           <el-card class="box-card mid_margin_top" shadow="hover"  v-if="dutyplan.data.length<=1">
             <div slot="header" class="clearfix">
                <span>{{ dutyplan.date }}</span>
                <span class="mid_margin_left">[{{ dutyplan.is_week }}]</span>
                <span class="mid_margin_left">{{ dutyplan.comment }}</span>
             </div>
           </el-card>
       </el-row>
     </div>
   </div>
    <el-empty v-show="tips" description="当前无月度排班计划" />
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
    <el-dialog
      title="月度排班计划pdf导出中"
      :visible.sync="pdfdialogVisible"
      width="30%">
      <el-progress :percentage="percentage"></el-progress>
    </el-dialog>
  </div>
</template>
<script>

import service from '@/utils/request'
import htmlToPdf from '@/utils/htmlToPdf.js'
import { Message } from 'element-ui'

export default
{ name: 'PatrolSchedule', components: {},
  data() {
    return {
      scheduleData: null,
      tipsDialog: false,
      today: new Date().toDateString(),
      tips: false,
      value: null,
      operation: null,
      pdfdialogVisible: false,
      percentage:0,
      time:0,
      timerId: null
    }
  },
  mounted() {
    this.getPlanList()
  },
  methods: {
    getPlanList() {
      service.get('/duty/get_month_duty_plan').then((resp) => {
        if (resp.code === '20000') {
          this.scheduleData = resp.data
          if (this.scheduleData.length <= 0) {
            this.tips = true
          }
          this.tips = false
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
    duty_month_arrange(type) {
      this.operation = type
      if (type==='arrange'){
        this.value = '该操作会重新生成月度排班计划,从当前日开始'
      }
      if (type ==='clear'){
        this.value = '该操作会清空已生成的排班计划,请确认操作'
      }
      this.tipsDialog = true
    },
    duty_month_clear() {
      service.get('/duty/arrange_month_clear').then((resp) => {
        if (resp.code === '20004') {
          Message({
            message: resp.msg,
            type: 'success',
            duration: 3 * 1000
          })
          this.getPlanList()
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
    duty_arrange_confirm() {
      if (this.operation === 'clear') {
        if (this.scheduleData.length === 0){
          Message({
            message: '计划为空无需清除值班计划',
            type: 'warning',
            duration: 3 * 1000
          })
          this.tipsDialog = false
          return
        }
        this.duty_month_clear()
      }
      if (this.operation === 'arrange') {
        this.duty_arrange_reset()
      }
    },
    duty_arrange_reset() {
      service.get('/duty/arrange_month').then((resp) => {
        if (resp.code === '20004') {
          Message({
            message: resp.msg,
            type: 'success',
            duration: 3 * 1000
          })
          this.getPlanList()
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
        this.tipsDialog = false
      })
    },
    compareDates(today, date2Str) {
      const inst1 = Date.parse(today)
      const inst2 = Date.parse(date2Str)
      if (inst1 > inst2) {
        return 0
      } else if (inst1 < inst2) {
        return 1
      }
    },
    cannel() {
      this.tipsDialog = false
    },
    convertHTMLToPDF() {
      if (this.scheduleData.length === 0){
        Message({
          message: '当前无值班计划无需导出',
          type: 'warning',
          duration: 3 * 1000
        })
        return
      }
      this.pdfdialogVisible = true
       if (!this.timerId) {
              this.time = 0 // 重置计时器值
              this.timerId = setInterval(() => {
                this.time++ // 每隔1秒自增1次
                this.percentage +=25
                if (this.percentage===100){
                  clearInterval(this.timerId)
                  this.timerId=null
                  this.percentage = 0
                  this.pdfdialogVisible = false
                  return
                }
              }, 500)
       }
       const month = (new Date().getMonth()+1).toString()
       const year = new Date().getFullYear().toString()
       var dom=document.getElementById('html-content')
       htmlToPdf.getPdf(year+'-0'+month+'月度排班计划',dom,2,1)
    }
  }
}
</script>
<style scoped>
/deep/.el-calendar-day {box-sizing: border-box;padding: 5px;height: 80px;
}
.mimi_margin_l{
  margin-left: 10px;
}
.mid_margin_l{
  margin-left: 20px;
}

.mid_margin{
  margin: 20px;
}
.box_model{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 60%;
}
.mid_padding_l{
  padding-left: 20px;
  text-align: left;
}
.size{
  width: 50%;
}
.flex{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.mid_margin_r{
  margin-right: 20px;
}
.box-card {
  /* width: 480px; */
  height: 320px;
  /* line-height: 26px; */
  overflow: hidden;
  box-sizing: border-box;
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
  width:30%;
  float: left;
}
.max_margin_left{
  margin-left: 40px;
}
.mid_margin_top{
  margin-top: 20px;
}
.mid_margin_bottom{
  margin-bottom: 10px;
}
</style>
