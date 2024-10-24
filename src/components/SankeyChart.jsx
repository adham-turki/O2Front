import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

export default function SankeyChart() {
  const [sankeyData, setSankeyData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_HOST;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/funnel-data`);
        const data = await response.json();
        setSankeyData(data || []); // Ensure data is an array
        console.log("Tickets data:", data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchData();
  }, []);

  

  // Sankey chart options
  const options = {
    // tooltip: { isHtml: true }, // Enable HTML tooltips for better styling
    // sankey: {
    //   node: {
    //     nodePadding: 30,
    //     nodeWidth: 15,
    //   },
    //   link: {
    //     colorMode: " gradient linear " 
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
