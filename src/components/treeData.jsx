import { useEffect, useState } from 'react';
import TreeChart from './TreeChart';
import './App.css';

function TreeData() {
const [teamMembers, setTeamMembers] = useState([]);
const [teams, setTeams] = useState([]);
const [chartData, setChartData] = useState({ name: "flare", children: [] });
const [cooCto, setCooCto] = useState([]);

useEffect(() => {
  const fetchTeamMembers = async () => {
    const res = await fetch('http://localhost:1337/api/team-members');
    const data = await res.json();
    setTeamMembers(data.data || []);
  };

  const fetchTeams = async () => {
    const res = await fetch('http://localhost:1337/api/company-teams');
    const responseData = await res.json();
    setTeams(responseData.data || []);
  };

  const fetchCooCto = async () => {
    const res = await fetch('http://localhost:1337/api/coo-ctos');
    const responseData = await res.json();
    setCooCto(responseData.data || []);
  };

  fetchTeams();
  fetchCooCto();
  fetchTeamMembers();
}, []);

useEffect(() => {
  // In the buildChartData function
const buildChartData = () => {
const teamMap = new Map();
const ceoMap = new Map();

// Organize members under their respective teams and managers
teamMembers.forEach(member => {
  const teamName = member.company_teams.name;
  const manager = member.manager ? member.manager.name : null;

  if (manager) {
    if (!teamMap.has(teamName)) {
      teamMap.set(teamName, { name: teamName, type: "Team", children: [] });
    }

    const team = teamMap.get(teamName);
    let managerEntry = team.children.find(child => child.name === manager);

    if (!managerEntry) {
      managerEntry = { name: manager, type: "Manager", children: [] };
      team.children.push(managerEntry);
    }

    managerEntry.children.push({
      name: member.name,
      type: "Team Member", // Added type here
      value: 1
    });
  }
});

// Add the COO/CTO and CEO structure
cooCto.forEach(cooCto => {
  const ceo = cooCto.ceo;

  if (ceo) {
    if (!ceoMap.has(ceo.name)) {
      ceoMap.set(ceo.name, { name: ceo.name, type: "CEO", children: [] });
    }

    const ceoEntry = ceoMap.get(ceo.name);
    ceoEntry.children.push({
      name: cooCto.name,
      type: cooCto.type,
      children: []
    });
  }
});

// Add teams under the respective COOs/CTOs
teams.forEach(team => {
  const cooCtoName = team.coo_cto ? team.coo_cto.name : null;

  if (cooCtoName) {
    const cooEntry = [...ceoMap.values()].find(entry => entry.children.some(child => child.name === cooCtoName));

    if (cooEntry) {
      const teamEntry = teamMap.get(team.name);
      if (teamEntry) {
        const cooChild = cooEntry.children.find(child => child.name === cooCtoName);
        if (cooChild) {
          cooChild.children.push(teamEntry);
        }
      }
    }
  }
});

const children = Array.from(ceoMap.values());
setChartData({ name: "525K", children });
};


  buildChartData();
}, [teamMembers, teams, cooCto]);
return (
    <>
      <TreeChart data={chartData} />
    </>
  );
}

export default TreeData;