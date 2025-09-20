import React from "react";
import "./Program.css";
import program_1 from "../../assets/program-1.png";
import program_2 from "../../assets/program-2.png";
import program_3 from "../../assets/program-3.png";
import program_4 from'../../assets/program-4.png';
import program_icon_1 from  '../../assets/pragram-icon-1.png'
import program_icon_2 from  '../../assets/program-icon-2.png'
import program_icon_3 from  '../../assets/program-icon-3.png'
import program_icon_4 from  '../../assets/program-icon-4.png'
const Program = () => {
  return (
    <div>
      

      <div className="program-container">
        <div className="program-card">
          <img src={program_1} alt="Power of Attorney" />
          <div className="caption">
            <img src={program_icon_1} alt="icon" />
            <p>POWER OF ATTORNEY</p>
          </div>
        </div>

        <div className="program-card">
          <img src={program_2} alt="Rental Agreement" />
          <div className="caption">
            <img src={program_icon_2} alt="icon" />
            <p>RENTAL AGREEMENT</p>
          </div>
        </div>

        <div className="program-card">
          <img src={program_3} alt="Employment Agreement" />
          <div className="caption">
            <img src={program_icon_3} alt="icon" />
            <p>EMPLOYMENT AGREEMENT</p>
          </div>
        </div>

        <div className="program-card">
          <img src={program_4} alt="Partnership Agreement" />
          <div className="caption">
            <img src={program_icon_4} alt="icon" />
            <p>PARTNERSHIP AGREEMENT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Program;



