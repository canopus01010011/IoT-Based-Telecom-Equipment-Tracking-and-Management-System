export function useMissions() {
  const missions = [
    {
      id: 1,
      site: "Blida Telecom Tower",
      company: "Mobilis",
      address: "13 Mai, Blida",
      time: "10:00 AM",
      items: 5,
      status: "Pending",
      technician: {
        latitude: 36.47,
        longitude: 2.83,
        phone: "0550000001",
      },
    },
    {
      id: 2,
      site: "Alger Center Hub",
      company: "Ooredoo",
      address: "45 Central Avenue, Alger",
      time: "11:30 AM",
      items: 3,
      status: "In Progress",
      technician: {
        latitude: 36.75,
        longitude: 3.05,
        phone: "0550000002",
      },
    },
    {
      id: 3,
      site: "Boufarik Node",
      company: "Djezzy",
      address: "78 Node Street, Boufarik",
      time: "2:00 PM",
      items: 7,
      status: "Completed",
      technician: {
        latitude: 36.69,
        longitude: 2.85,
        phone: "0550000003",
      },
    },
  ];
  const activeMissions = missions.filter((m) => m.status !== "Completed");

  const completedMissions = missions.filter((m) => m.status === "Completed");

  const activeMission = activeMissions.length > 0 ? activeMissions[0] : null;

  return {
    missions,
    activeMissions,
    activeMission,
    completedMissions,
  };
}
