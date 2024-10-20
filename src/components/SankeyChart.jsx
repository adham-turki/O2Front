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
    ["From", "To", "Weight", { role: 'tooltip', type: 'string' }], // Add tooltip column
  ];

  tickets.forEach((ticket) => {
    // Add connections and tooltips
    sankeyData.push([
      "All Tickets",
      ticket.severity,
      2,
      `Ticket: ${ticket.title}`, // Tooltip shows ticket title
    ]);

    sankeyData.push([
      ticket.severity,
      ticket.type,
      1,
      `Ticket: ${ticket.title}`, // Tooltip shows ticket title
    ]);

    ticket.domains.forEach((domain) => {
      sankeyData.push([
        ticket.type,
        domain.name,
        1,
        `Ticket: ${ticket.title}`, // Tooltip for domain connection
      ]);

      sankeyData.push([
        domain.name,
        ticket.tier,
        1,
        `Ticket: ${ticket.title}`, // Tooltip for tier connection
      ]);
    });

    ticket.tags.forEach((tag) => {
      sankeyData.push([
        ticket.tier,
        tag.label,
        1,
        `Ticket: ${ticket.title}`, // Tooltip for tag connection
      ]);

      sankeyData.push([
        tag.label,
        ticket.reportedBy.name,
        1,
        `Ticket: ${ticket.title}`, // Tooltip for reporter connection
      ]);
    });
  });

  // Sankey chart options
  const options = {
    // tooltip: { isHtml: true }, // Enable HTML tooltips for better styling
    // sankey: {
    //   node: {
    //     nodePadding: 30,
    //     nodeWidth: 15,
    //   },
    //   link: {
    //     colorMode: "gradient",
    //   },
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
