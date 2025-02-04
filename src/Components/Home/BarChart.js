// BarChart.js
import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BarChart = ({ title , data}) => {
    const chartOptions = {
        chart: {
            type: 'bar',
            stacked: true,
        },
        colors: ["#FFBB54", "#00A389"],
        plotOptions: {
            bar: {
                horizontal: false,
            },
        },
        xaxis: {
            categories: [ 'Shirts', 'Kurta', 'Qameez', 'Pants', 'Suits'],
        },
        legend: {
            position: 'bottom',
        },
    };

    const series = [
        {
            name: 'Series 1',
            data: data,
        },
    ];

    return (
        <div className="w-full md:w-1/2">
            <div className="flex flex-col gap-5 overflow-hidden">
                <div>
                    <p className="text-xl font-semibold text-center">Charts</p>
                </div>
                <div className="mt-10 bg-white">
                    <ReactApexChart options={chartOptions} series={series} type="bar" height={350} />
                </div>
            </div>
        </div>
    );
};

export default BarChart;
