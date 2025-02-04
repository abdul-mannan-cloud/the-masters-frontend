// DonutChart.js
import ReactApexChart from 'react-apexcharts';

const DonutChart = ({ title, value }) => {
    const chartOptions = {
        series: [35.1, 23.5, 2.4],
        colors: ["#EF9A91", "#00A389", "#FFBB54"],
        chart: {
            height: 320,
            width: "100%",
            type: "donut",
        },
        stroke: {
            colors: ["transparent"],
            lineCap: "",
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            position: "bottom",
            fontFamily: "Inter, sans-serif",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                },
            },
        },
        grid: {
            padding: {
              top: -2,
            },
        },
    };

    const series =  [35.1, 23.5, 2.4];

    return (
        <div className="w-full h-full ml-0 sm:ml-32 md:w-1/4">
            <div className="">
                <div>
                    <p className="ml-10 text-xl font-semibold text-center">Chart Summary</p>
                </div>
                <div className='flex items-center justify-center w-full h-full mt-10 sm:mt-24'>
                    <ReactApexChart options={chartOptions} series={series} type="donut" width={350} height={350}/>
                </div>
            </div>
        </div>
    );
};

export default DonutChart;
