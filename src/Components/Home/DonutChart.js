import React from 'react';
import ReactApexChart from 'react-apexcharts';

// Using design-system colors: tertiary-fixed, secondary-container, primary-fixed, primary
const STATUS_COLORS = ['#ffdea5', '#dae1e3', '#baeed9', '#003629'];

const DonutChart = ({ data = [0, 0, 0, 0] }) => {
    const seriesData = data.length ? data : [0, 0, 0, 0];
    const hasData = seriesData.some((v) => v > 0);

    const chartOptions = {
        series: seriesData,
        colors: STATUS_COLORS,
        labels: ['Pending', 'In Progress', 'Completed', 'Shipped'],
        chart: {
            type: 'donut',
            fontFamily: 'Manrope, sans-serif',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 600,
            },
        },
        stroke: {
            colors: ['transparent'],
        },
        dataLabels: {
            enabled: hasData,
            style: {
                fontFamily: 'Manrope, sans-serif',
                fontSize: '11px',
                fontWeight: '700',
            },
            formatter: (val) => `${val.toFixed(0)}%`,
            dropShadow: { enabled: false },
        },
        legend: {
            position: 'bottom',
            fontFamily: 'Manrope, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            labels: { colors: '#404945' },
            markers: { width: 8, height: 8, radius: 4 },
            itemMargin: { horizontal: 8, vertical: 4 },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '72%',
                    labels: {
                        show: hasData,
                        name: {
                            show: true,
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: '700',
                            color: '#191c1b',
                        },
                        value: {
                            show: true,
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: '600',
                            color: '#404945',
                            formatter: (val) => `${parseFloat(val).toFixed(0)}%`,
                        },
                        total: {
                            show: true,
                            label: 'Pipeline',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: '700',
                            color: '#191c1b',
                            formatter: () => 'Active',
                        },
                    },
                },
            },
        },
        tooltip: {
            style: { fontFamily: 'Manrope, sans-serif' },
            y: { formatter: (val) => `${val.toFixed(1)}%` },
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: { width: 280, height: 280 },
                legend: { position: 'bottom' },
            },
        }],
    };

    return (
        <div className="w-full h-full">
            <ReactApexChart
                options={chartOptions}
                series={seriesData}
                type="donut"
                height="100%"
                width="100%"
            />
        </div>
    );
};

export default DonutChart;
