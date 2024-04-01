<template>
  <div>
    <div class="mid_margin_top mid_margin_left flex">
      <el-row class="card-size mid_margin_left">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
             <span>[月排班计划-今日值班人员]</span>
           <span  class="mid_margin_left">[{{ duty_current_month_plan.date===null? '' : duty_current_month_plan.date }}]</span>
            <!-- <span class="mid_margin_left">[{{ duty_current_month_plan.is_working===1?'工作日':'非工作日' }}]</span> -->
            <span class="mid_margin_left">[{{ process_working(duty_current_month_plan.is_working) }}]</span>
            <span class="mid_margin_left">{{ duty_current_month_plan.comment }}</span>

          </div>
          <div v-for="(item,index) in duty_current_month_plan.list" v-show="!(item.address===null)" :key="index" class="text item">
            <span style="color: red;">值班地点：{{ item.address }}</span><br>
            <span class="mid_margin_left">值班人员：{{ item.namelist }}</span>
          </div>
        </el-card>
      </el-row>
      <el-row class="card-size mid_margin_left">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
             <span>[周排班计划-今日值班人员]</span>
           <span  class="mid_margin_left">[{{ duty_current_week_plan.date }}]</span>
            <span class="mid_margin_left">[{{ process_working(duty_current_week_plan.is_working) }}]</span>
            <span class="mid_margin_left">{{ duty_current_week_plan.comment }}</span>

          </div>
          <div v-for="(item,index) in duty_current_week_plan.list" v-show="!(item.address===null)" :key="index" class="text item">
            <span style="color: red;">值班地点：{{ item.address }}</span><br>
            <span class="mid_margin_left">值班人员：{{ item.namelist }}</span>
          </div>
        </el-card>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import service from '@/utils/request'
import { Message } from 'element-ui'

export default {
  data() {
    return {
      duty_current_month_plan: {},
      duty_current_week_plan: {}
    }
  },
  created() {
    this.getMonthCurrentPlanList()
    this.getWeekCurrentPlanList()
  },
  methods: {
    getMonthCurrentPlanList() {
      service.get('/duty/current_duty_month_list').then((resp) => {
        if (resp.code === '20000') {
          this.duty_current_month_plan = resp.data
          console.log(this.duty_current_month_plan)
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
    getWeekCurrentPlanList() {
      service.get('/duty/current_duty_week_list').then((resp) => {
        if (resp.code === '20000') {
          this.duty_current_week_plan = resp.data
          // console.log(this.duty_current_week_plan)
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
    process_working(work_status){
      if (work_status === null){
        return null
      }
      if (work_status === 1){
        return '工作日'
      }
      if (work_status === 0){
        return '非工作日'
      }
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
  /* height: 280px; */
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
</style>
