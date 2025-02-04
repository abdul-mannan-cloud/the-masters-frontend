// BarChart.js
import React from 'react';
import ReactApexChart from 'react-apexcharts';

const LineChart = ({ title , data}) => {
    const chartOptions = {
        chart: {
            height: "100%",
            maxWidth: "100%",
            type: "area",
            fontFamily: "Inter, sans-serif",
            dropShadow: {
              enabled: false,
            },
            toolbar: {
              show: false,
            },
          },
          colors: ["#FFBB54", "#00A389"],
          tooltip: {
            enabled: true,
            x: {
              show: false,
            },
          },
          
          dataLabels: {
            enabled: false,
          },
          stroke: {
            width: 3,
          },
          grid: {
            show: false,
            strokeDashArray: 4,
            padding: {
              left: 2,
              right: 2,
              top: 0
            },
          },
          series: [
            {
              name: "New users",
              data: [1500, 6418, 2456, 3526, 1356, 456],
              color: "#1A56DB",
            },
          ],
          xaxis: {
            categories: ['01 February', '02 February', '03 February', '04 February', '05 February', '06 February', '07 February'],
            labels: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
            axisTicks: {
              show: false,
            },
          },
          yaxis: {
            categories: [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000],
            show: false,
          },
        }

    const series = [
        {
            name: 'Series 1',
            data: data
        },
    ];

    return (
        <div className="w-full xl:w-1/2">
            <div className="flex flex-col gap-5">
                <div className="bg-white">
                    <ReactApexChart options={chartOptions} series={series} type="line" width={120} />
                </div>
            </div>
        </div>
    );
};

export default LineChart;
