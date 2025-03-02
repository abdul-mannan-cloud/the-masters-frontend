import React from 'react';
import ReactApexChart from 'react-apexcharts';

const DonutChart = ({ data = [0, 0, 0, 0] }) => {
    // Default values in case data is missing
    const seriesData = data.length ? data : [0, 0, 0, 0];

    const chartOptions = {
        series: seriesData,
        colors: ["#FFBB54", "#00A389", "#4F46E5", "#EF9A91"],
        labels: ['Pending', 'In Progress', 'Completed', 'Shipped'],
        chart: {
            type: "donut",
            fontFamily: "Inter, sans-serif",
        },
        stroke: {
            colors: ["transparent"],
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val.toFixed(1) + "%";
            },
        },
        legend: {
            position: "bottom",
            fontFamily: "Inter, sans-serif",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                        },
                        value: {
                            show: true,
                            formatter: function(val) {
                                return val;
                            }
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: function(w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                },
            },
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 280,
                    height: 280
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    return (
        <div className="w-full h-full">
            <div className="h-80 flex items-center justify-center">
                <ReactApexChart
                    options={chartOptions}
                    series={seriesData}
                    type="donut"
                    height="100%"
                    width="100%"
                />
            </div>
        </div>
    );
};

export default DonutChart;