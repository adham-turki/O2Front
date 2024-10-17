import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
export default function SankeyChart() {
    const [tickets, setTickets] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://localhost:1337/api/tickets');
            const data = await response.json();
            setTickets(data.data);
            console.log("Tickets data:", data);
        };
        fetchData();
    }, []);




    // Create Sankey data
    const sankeyData = [
        ["From", "To", "Weight"], // Define columns
    ];

    tickets.forEach((ticket) => {
        sankeyData.push(["All Tickets", ticket.severity, 2]);

        sankeyData.push([ticket.severity, ticket.type, 1]);

        ticket.domains.forEach((domain) => {
            sankeyData.push([ticket.type, domain.name, 1]);
            sankeyData.push([domain.name, ticket.tiers, 1]);

        });
        ticket.tags.forEach((tag) => {

            sankeyData.push([ticket.tiers, tag.label, 1]);

            sankeyData.push([tag.label, ticket.reportedBy.name, 1]);
        });
    });

    // Sankey chart options
    const options = {
        // sankey: {
        //     node: {
        //         nodePadding: 30,
        //         nodeWidth: 15,
        //     },
        //     link: {
        //         colorMode: "gradient",
        //         colors: [ "#cab2d6", "#ff7f0e", "#1f77b4", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ],
        //     },
        // },
    };


    return (
        <Chart
            chartType="Sankey"
            width="100%"
            height="500px"
            data={sankeyData}
            options={options}
            chartVersion="51"
            className="mt-8"
        />
    );
}
