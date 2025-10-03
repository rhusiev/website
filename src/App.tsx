import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.tsx";
import HomePage from "./pages/HomePage.tsx";
import Route0 from "./pages/0.tsx";
import Contacts from "./pages/Contacts.tsx";

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/0" element={<Route0 />} />
                <Route path="/contacts" element={<Contacts />} />
            </Routes>
        </>
    );
}

export default App;
