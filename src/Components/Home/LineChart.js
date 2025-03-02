import React from 'react';
import ReactApexChart from 'react-apexcharts';

const LineChart = ({ data = [], categories = [] }) => {
    // Default values in case data is missing
    const chartData = data.length ? data : [0, 0, 0, 0, 0, 0];
    // Default categories if none provided
    const chartCategories = categories.length ?
        categories :
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const chartOptions = {
        chart: {
            height: "100%",
            type: "area",
            fontFamily: "Inter, sans-serif",
            toolbar: {
                show: false,
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
            }
        },
        colors: ["#00A389"],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        grid: {
            show: true,
            strokeDashArray: 4,
            padding: {
                left: 0,
                right: 0,
                top: 0
            },
        },
        xaxis: {
            categories: chartCategories,
            labels: {
                show: true,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                }
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
                },
                formatter: function (value) {
                    return value.toLocaleString();
                }
            }
        },
        tooltip: {
            enabled: true,
            x: {
                show: true,
            },
            y: {
                formatter: function (value) {
                    return 'Rs. ' + value.toLocaleString();
                }
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: 200
                }
            }
        }]
    };

    const series = [
        {
            name: 'Revenue',
            data: chartData
        },
    ];

    return (
        <div className="w-full h-full">
            <ReactApexChart
                options={chartOptions}
                series={series}
                type="area"
                height="100%"
                width="100%"
            />
        </div>
    );
};

export default LineChart;