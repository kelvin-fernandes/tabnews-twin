import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

export default function StatusPage() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 3000,
  });
  if (error) return <h1>Failed to load</h1>;
  if (isLoading) return <h1>Loading...</h1>;

  console.log("Status data:", data);

  return (
    <>
      <h1>Service Status</h1>
      <UpdatedAt timestamp={data?.updated_at} />
      <DatabaseInfo databaseInfo={data?.dependencies?.database} />
    </>
  );
}

function UpdatedAt({ timestamp }) {
  const date = new Date(timestamp);
  return (
    <p>
      Last updated:{" "}
      <time dateTime={date.toISOString()}>{date.toISOString()}</time>
    </p>
  );
}

function DatabaseInfo({ databaseInfo }) {
  return (
    <div>
      <h2>Database Information</h2>
      <p>Status: {databaseInfo.status}</p>
      <p>Version: {databaseInfo.version}</p>
      <p>Max Connections: {databaseInfo.max_connections}</p>
      <p>Opened Connections: {databaseInfo.opened_connections}</p>
    </div>
  );
}
