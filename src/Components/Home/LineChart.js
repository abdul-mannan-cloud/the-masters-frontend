import React from 'react';
import ReactApexChart from 'react-apexcharts';

const LineChart = ({ data = [], categories = [] }) => {
    const chartData = data.length ? data : [0, 0, 0, 0, 0, 0];
    const chartCategories = categories.length ? categories : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const chartOptions = {
        chart: {
            height: '100%',
            type: 'area',
            fontFamily: 'Manrope, sans-serif',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
            },
        },
        colors: ['#003629'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.18,
                opacityTo: 0.02,
                stops: [0, 90, 100],
                colorStops: [
                    { offset: 0, color: '#003629', opacity: 0.18 },
                    { offset: 100, color: '#003629', opacity: 0 },
                ],
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 2.5,
        },
        grid: {
            show: true,
            strokeDashArray: 4,
            borderColor: 'rgba(192, 201, 195, 0.2)',
            padding: { left: 0, right: 0, top: 0 },
        },
        xaxis: {
            categories: chartCategories,
            labels: {
                show: true,
                style: {
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '11px',
                    colors: '#707974',
                },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '11px',
                    colors: '#707974',
                },
                formatter: (value) => `Rs. ${value.toLocaleString()}`,
            },
        },
        tooltip: {
            enabled: true,
            style: { fontFamily: 'Manrope, sans-serif' },
            x: { show: true },
            y: { formatter: (value) => `Rs. ${value.toLocaleString()}` },
        },
        markers: {
            size: 0,
            hover: { size: 5, sizeOffset: 2 },
        },
        responsive: [{
            breakpoint: 480,
            options: { chart: { height: 200 } },
        }],
    };

    const series = [{ name: 'Revenue', data: chartData }];

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
