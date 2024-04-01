<template>
  <div class="app-container">
    <el-row class="display">
      <el-card class="box-card size">
        <div slot="header" class="clearfix">
          <span>员工状态分析</span>
        </div>
        <div id="staff_status_pie" style="width: 400px;height:400px;" ></div>
      </el-card>
      <el-card class="box-card mid_margin_l size" style="width: 900px;">
        <div slot="header" class="clearfix">
          <span>人员累计预排班次数统计</span>
        </div>
        <div id="main" style="width: 800px;height:400px;" ref="main"></div>
      </el-card>
    </el-row>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>员工状态百分比分析</span>
      </div>
      <div id="staff_status_percentage_pie" style="width: 1200px;height:400px;" ></div>
    </el-card>


  </div>
</template>

<script>
  import service from '@/utils/request'
  import * as echarts from 'echarts'
  import { Message } from 'element-ui'
  import moment from 'moment'
  export default {
    data() {
      return {
      }
    },
    created(){
    },
    mounted(){
        this.$nextTick(()=>{
          this.getcharts()
          this.get_staff_status_analyse_pie()
          this.staff_status_percentage_pie()
        })

    }
    ,
    methods:{
       getcharts(){
        service.get('/duty/analyse').then((resp) => {
          // this.namelist=resp.data.namelist
          // this.count=resp.data.count
          let chartContainer = document.getElementById('main')
              // 初始化Echarts实例
              let myChart = echarts.init(chartContainer)

               // 指定图表的配置项和数据
               var option = {
                 title: {
                   text: ''
                 },
                 toolbox: {
                   show: true,
                   feature: {
                     mark: { show: true },
                     dataView: { show: true, readOnly: false },
                     saveAsImage: { show: true }
                   }
                 },
                 tooltip: {},
                 legend: {
                   data: ['预排班人员']
                 },
                 xAxis: {
                   data: resp.data.namelist
                 },
                 yAxis: {},
                 series: [
                   {
                     name: '累计排班次数',
                     type: 'bar',
                     data: resp.data.count
                   }
                 ]
               }

               // 使用刚指定的配置项和数据显示图表。
               myChart.setOption(option)
        }).catch(error => {
          Message({
            message: error,
            type: 'error',
            duration: 3 * 1000
          })
        })
      },
      get_staff_status_analyse_pie(){
        service.get('/staff/analyse').then((resp)=>{
          let chartDom = document.getElementById('staff_status_pie');
          let myChart = echarts.init(chartDom);
          let option;

          option = {
            title: {
              left: 'center'
            },
            tooltip: {
              trigger: 'item'
            },
            legend: {
              orient: 'vertical',
              left: 'left'
            },
            series: [
              {
                type: 'pie',
                radius: '50%',
                data:resp.data,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }
            ]
          };

          option && myChart.setOption(option);
        })
      },
      staff_status_percentage_pie(){
        service.get('/staff/analyse').then(resp=>{
          let chartDom = document.getElementById('staff_status_percentage_pie');
          let myChart = echarts.init(chartDom);
          let option;
          option = {
            title: {
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
              left: 'center',
              top: 'bottom',
              data: [

              ]
            },
            toolbox: {
              show: true,
              feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                saveAsImage: { show: true }
              }
            },
            series: [
              {
                type: 'pie',
                radius: [20, 140],
                center: ['25%', '50%'],
                roseType: 'radius',
                itemStyle: {
                  borderRadius: 5
                },
                label: {
                  show: false
                },
                emphasis: {
                  label: {
                    show: true
                  }
                },
                data: resp.data
              },
              {
                type: 'pie',
                radius: [20, 140],
                center: ['75%', '50%'],
                roseType: 'area',
                itemStyle: {
                  borderRadius: 5
                },
                data: resp.data
              }
            ]
          };
          option && myChart.setOption(option);
        })
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
   .text {
      font-size: 14px;
    }

    .item {
      margin-bottom: 18px;
    }

    .clearfix:before,
    .clearfix:after {
      display: table;
      content: "";
    }
    .clearfix:after {
      clear: both
    }

    .box-card {

    }
    .mid_margin_l{
      margin-left: 20px;
    }
    .size{
      width: 480px;
      float: left;
    }

</style>
