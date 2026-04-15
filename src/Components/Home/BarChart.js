import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BarChart = ({ data = [], categories = [] }) => {
    const chartData = data.length ? data : [0, 0, 0, 0, 0];
    const chartCategories = categories.length ? categories : ['Shirts', 'Kurta', 'Qameez', 'Pants', 'Suits'];

    const chartOptions = {
        chart: {
            type: 'bar',
            stacked: false,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 600,
            },
        },
        colors: ['#003629'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '48%',
                borderRadius: 6,
                dataLabels: { position: 'top' },
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: chartCategories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '12px',
                    colors: '#707974',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '12px',
                    colors: '#707974',
                },
                formatter: (val) => val.toFixed(0),
            },
        },
        grid: {
            borderColor: 'rgba(192, 201, 195, 0.2)',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } },
        },
        tooltip: {
            style: { fontFamily: 'Manrope, sans-serif' },
            y: { formatter: (val) => `${val.toFixed(0)} orders` },
        },
        states: {
            hover: { filter: { type: 'darken', value: 0.85 } },
        },
    };

    const series = [{ name: 'Orders', data: chartData }];

    return (
        <div className="w-full h-full">
            <ReactApexChart
                options={chartOptions}
                series={series}
                type="bar"
                height="100%"
                width="100%"
            />
        </div>
    );
};

export default BarChart;
