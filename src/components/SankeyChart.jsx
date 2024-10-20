import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

export default function SankeyChart() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:1337/api/tickets');
        const data = await response.json();
        setTickets(data.data || []); // Ensure data is an array
        console.log("Tickets data:", data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchData();
  }, []);

  // Create Sankey data
  const sankeyData = [
    ["From", "To", "Weight", { role: 'tooltip', type: 'string' }], // Add tooltip column
  ];

  tickets.forEach((ticket) => {
    const { severity, type, domains, tags, title, tier, reportedBy } = ticket || {};

    // Check for missing or null values before pushing to sankeyData
    if (severity && type && title) {
      // Add connections and tooltips
      sankeyData.push([
        "All Tickets",
        severity,
        2,
        `Ticket: ${title}`, // Tooltip shows ticket title
      ]);

      sankeyData.push([
        severity,
        type,
        1,
        `Ticket: ${title}`, // Tooltip shows ticket title
      ]);
    }

    if (domains && Array.isArray(domains)) {
      domains.forEach((domain) => {
        if (domain && domain.name && type) {
          sankeyData.push([
            type,
            domain.name,
            1,
            `Ticket: ${title}`, // Tooltip for domain connection
          ]);

          if (tier) {
            sankeyData.push([
              domain.name,
              tier,
              1,
              `Ticket: ${title}`, // Tooltip for tier connection
            ]);
          }
        }
      });
    }

    if (tags && Array.isArray(tags)) {
      tags.forEach((tag) => {
        if (tag && tag.label && tier) {
          sankeyData.push([
            tier,
            tag.label,
            1,
            `Ticket: ${title}`, // Tooltip for tag connection
          ]);

          if (reportedBy && reportedBy.name) {
            sankeyData.push([
              tag.label,
              reportedBy.name,
              1,
              `Ticket: ${title}`, // Tooltip for reporter connection
            ]);
          }
        }
      });
    }
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
