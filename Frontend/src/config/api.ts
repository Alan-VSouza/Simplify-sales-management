/** Base URL of the ASP.NET Core API. Override it with VITE_API_URL in a .env file. */
export const API_URL: string = import.meta.env.VITE_API_URL ?? "https://localhost:7159";
