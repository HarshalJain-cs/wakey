import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import notFoundVideo from "@/assets/404-animation.mp4";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <SEO 
        title="Page Not Found" 
        description="Oops! The page you're looking for doesn't exist. Head back to Wakey and get productive."
      />
      {/* Full-screen video with top/bottom crop */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          src={notFoundVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[120%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      
      {/* Back to Home button at bottom center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-1 left-[40%] -translate-x-1/2"
      >
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-white/25 transition-all hover:scale-105"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
