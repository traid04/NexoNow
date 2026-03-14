import { Route, Routes } from "react-router-dom";
import Banner from "./components/Banner.tsx";
import "./App.css";

function App() {

  return (
    <>
      <Banner />
      <Routes>
        <Route path="/" element={<></>} />
        <Route path="/login" element={<></>} />
        <Route path="/register" element={<></>} />
      </Routes>
    </>
  )
}

export default App
