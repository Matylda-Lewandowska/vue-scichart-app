<template>
  <div id="scichart-root" style="width: 100%; height: 400px;"></div>
</template>

<script>
import { SciChartSurface } from "scichart/Charting/Visuals/SciChartSurface";
import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
import { FastLineRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastLineRenderableSeries";
import { FastColumnRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastColumnRenderableSeries";
import { fetchData } from "@/services/DataService";
import { NumericLabelProvider } from "scichart/Charting/Visuals/Axis/LabelProvider/NumericLabelProvider";

export default {
  name: "GraphComponent",
  async mounted() {
    try {
      SciChartSurface.setRuntimeLicenseKey("YOUR_RUNTIME_KEY");
      SciChartSurface.configure({
        wasmUrl: './js/scichart2d.wasm',
        dataUrl: './scichart2d.data'
      });

      let data = await fetchData();

      const lastRecordTimestamp = data[data.length - 1].dt; 
      const threeHoursAgoTimestamp = lastRecordTimestamp - (180 * 60); 
      const filteredData = data.filter(item => item.dt >= threeHoursAgoTimestamp);

      await this.initSciChart(filteredData);
    } catch (error) {
      console.error("Error in mounted:", error);
    }
  },
  methods: {
    async initSciChart(filteredData) {
      SciChartSurface.setRuntimeLicenseKey("MY_KEY");

      const { sciChartSurface, wasmContext } = await SciChartSurface.create("scichart-root");

      class CustomLabelProvider extends NumericLabelProvider {
        formatLabel(value) {
          const date = new Date(value * 1000); // Assuming 'value' is a Unix timestamp in seconds
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
      }

      const xAxis = new NumericAxis(wasmContext);
      xAxis.labelProvider = new CustomLabelProvider();

      const yAxis = new NumericAxis(wasmContext);

      sciChartSurface.xAxes.add(xAxis);
      sciChartSurface.yAxes.add(yAxis);

      const data = filteredData;

      // Assuming your fetchData returns an array of {dt, price, amount}
      const priceDataSeries = new XyDataSeries(wasmContext);
      const amountDataSeries = new XyDataSeries(wasmContext);

      data.forEach(item => {
        const date = item.dt * 1000; // Convert Unix timestamp to milliseconds
        priceDataSeries.append(date, item.price);
        amountDataSeries.append(date, item.amount);
      });

      const lineSeries = new FastLineRenderableSeries(wasmContext, {
        dataSeries: amountDataSeries,
        stroke: "rgba(176,196,222,1)",
        strokeThickness: 2
      });

      const columnSeries = new FastColumnRenderableSeries(wasmContext, {
        dataSeries: priceDataSeries,
        fill: "rgba(255,165,0,0.5)",
        strokeThickness: 0,
      });

      sciChartSurface.renderableSeries.add(lineSeries);
      sciChartSurface.renderableSeries.add(columnSeries);

      sciChartSurface.zoomExtents();
    },
  },
};
</script>
