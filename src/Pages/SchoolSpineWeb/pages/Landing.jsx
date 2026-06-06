import Navbar from "../../../Components/Navbar/Navbar";
import Footer from "./Footer";
import Home from "./Home";
import ScrollToTop from "../../../Components/Common/ScrollToTop";

const LandingApp = () => {
    return (
        <>
            <ScrollToTop />
            <Navbar />
            <Home />
            <Footer />
        </>
    );
};

export default LandingApp;