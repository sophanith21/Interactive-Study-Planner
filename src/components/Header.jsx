import logo from "../assets/logo.svg";

export default function Header() {
  return (
    <div className="header">
      <img src={logo} alt="Study Planner" className="logo" />
      <h1 id="title">Study Planner</h1>
    </div>
  );
}
