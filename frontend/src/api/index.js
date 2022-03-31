import axios from "axios";

export const API = axios.create({baseURL: "http://localhost:3000"});

export const getStravaTokens = async (client_id, client_secret, code, grant_type) => {
    return await API.post(`https://www.strava.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${code}&grant_type=${grant_type}`);
}
