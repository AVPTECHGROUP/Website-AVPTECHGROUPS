import Navbar from "../../../Components/Navbar/Navbar";
import Footer from "./Footer";
import Home from "./Home";
import ScrollToTop from "../../../Components/Common/ScrollToTop";
import FloatingContact from "../../../Components/CommonComp/FloatingContact";

const LandingApp = () => {
    return (
        <>
            <ScrollToTop />
            <Navbar />
            <Home />
            <FloatingContact />
            <Footer />
        </>
    );
};

export default LandingApp;