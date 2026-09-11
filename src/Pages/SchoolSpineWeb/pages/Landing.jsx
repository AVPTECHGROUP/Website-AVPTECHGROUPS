import Navbar from "../../../Components/Navbar/Navbar";
import Footer from "./Footer";
import Home from "./Home";
import ScrollToTop from "../../../Components/Common/ScrollToTop";
import FloatingContact from "../../../Components/CommonComp/FloatingContact";
import ChatWidget from "../../../Components/CommonComp/Chatwidget/ChatWidget.jsx";

const LandingApp = () => {
    return (
        <>
            <ScrollToTop />
            <Navbar />
            <Home />
            <FloatingContact />
            <ChatWidget />
            <Footer />
        </>
    );
};

export default LandingApp;