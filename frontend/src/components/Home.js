import { Card, CardContent, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import Image from "../img/habit.jpg";

const Home = () => {
  const history = useNavigate();

  const handleViewMyHabitsButton = () => {
      history("/myHabits");
  }

  const handleCreateHabitButton = () => {
    history("/createHabit");
  };

  const handleJoinHabitButton = () => {
    history("/joinHabit");
  };

  const handleConnectToStrava = () => {
    history("/connectStrava");
  };

  return (
    <div>
      <Card
        sx={{ minWidth: 500, minHeight: 260, padding: 10, margin: 10, textAlign: "center", backgroundImage:  `url(${Image})`}}
      >
        <CardContent>
          <Button
            variant="contained"
            sx={{ margin: "10px" }}
            onClick={handleViewMyHabitsButton}
          >
            View My Current Habits
          </Button>
          <br />
          <Button
            variant="contained"
            sx={{ margin: "10px" }}
            onClick={handleCreateHabitButton}
          >
            Create a New Habit
          </Button>
          <br />
          <Button
            variant="contained"
            sx={{ margin: "10px" }}
            onClick={handleJoinHabitButton}
          >
            View All Ongoing Habits
          </Button>
          <br />
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
