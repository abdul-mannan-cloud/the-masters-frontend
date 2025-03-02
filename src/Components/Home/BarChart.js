import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BarChart = ({ data = [], categories = [] }) => {
    // Default values in case data is missing
    const chartData = data.length ? data : [0, 0, 0, 0, 0];
    // Default categories if none provided
    const chartCategories = categories.length ? categories : ['Shirts', 'Kurta', 'Qameez', 'Pants', 'Suits'];

    const chartOptions = {
        chart: {
            type: 'bar',
            stacked: false,
            toolbar: {
                show: false
            },
            fontFamily: "Inter, sans-serif",
        },
        colors: ["#FFBB54"],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4,
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: chartCategories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return val.toFixed(0);
                }
            },
        },
        grid: {
            borderColor: '#f1f1f1',
            strokeDashArray: 4,
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        legend: {
            position: 'bottom',
            fontFamily: "Inter, sans-serif",
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val.toFixed(0);
                }
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: 300
                },
            }
        }]
    };

    const series = [
        {
            name: 'Orders',
            data: chartData,
        },
    ];

    return (
        <div className="w-full h-full">
            <div className="h-60">
                <ReactApexChart
                    options={chartOptions}
                    series={series}
                    type="bar"
                    height="100%"
                    width="100%"
                />
            </div>
        </div>
    );
};

export default BarChart;