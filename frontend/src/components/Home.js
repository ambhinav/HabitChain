import { Card, CardContent, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";


const Home = () => {
    const history = useNavigate();

    const handleCreateHabitButton = () => {
        history("/createHabit")
    }

    const handleJoinHabitButton = () => {
        history("/joinHabit")
    }

    const handleConnectToStrava = () => {
        history("/connectTracker")
    };
    return (
        <div>
            <Card sx={{minWidth: 500, padding: 10, margin: 10, textAlign: "center"}}>
                <CardContent>
                    <Button variant="contained" sx={{margin: "10px"}} onClick={handleCreateHabitButton}>Create a New Habit</Button>
                    <br/>
                    <Button variant="contained" sx={{margin: "10px"}}>Join a Habit Challenge</Button>
                    <br/>
                    <Button variant="contained" sx={{margin: "10px"}}>View ongoing Habits</Button>
                    <br/>
                    <Button variant="contained" sx={{margin: "10px"}} onClick={handleConnectToStrava}>Connect to Strava</Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default Home;