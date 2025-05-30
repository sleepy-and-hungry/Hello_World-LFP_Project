import React from "react";
import { useNavigate } from "react-router-dom";
import "../css_files/page_style.css";

const Help = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("name");
  const name = localStorage.getItem("given_name");
  const picture = localStorage.getItem("picture")
  return (
    <div className="page-container">
      {/* ------------------ Header ------------------ */}
      <div className="header" style={{ marginBottom: "5%" }}>
        <div>Help</div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center",position: "absolute", right: "40px"}}>
        {username ? (
            <>
              <div style={{ margin: 20 }}>{username}</div>
              <img src={picture} height={60} width={60} alt="User" 
              style={{ cursor: "pointer",borderRadius: "50%" }} 
              className="transparent-hover"
              onClick={() => navigate("/profile")} />
            </>
          ) : (
            <div>Guest</div>
          )}
        </div>
      </div>
      <div className="help-container">
        <button className="help-button" onClick={() => navigate("/dashboard")}>
          <div>Dashboard</div>
          <img src="/images/home.png" height={150} width={180} alt="Home" />
          <div>Overview of your most Recent Plan Simulation</div>
        </button>
        
        <button className="help-button" onClick={() => navigate("/create-plan")}>
          <div>Create Plan</div>
          <img src="/images/plan.png" height={150} width={150} alt="Plan" />
          <div>Create a New Financial Plan For The Future</div>
        </button>
      </div>

      <div className="help-container">
        <button className="help-button" onClick={() => navigate("/simulate")}>
          <div>Simulate</div>
          <img src="/images/simulate.png" height={150} width={200} alt="Simulate" />
          <div>Simulate Your Plans to View Changes Over Time</div>
        </button>
        
        <button className="help-button" onClick={() => navigate("/scenario")}>
          <div>Scenarios</div>
          <img src="/images/scenario.png" height={150} width={150} alt="Scenario" />
          <div>View and Edit All Your Created Plans</div>
        </button>
      </div>
    </div>
  );
};

export default Help;
