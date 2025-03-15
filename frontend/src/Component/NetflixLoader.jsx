import { motion } from "framer-motion";
import "../CSS/NetflixLoader.css";

const NetflixLoader = (props) => {
  return (
    <div className="loader-container">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2, ease: "easeInOut" }}
          className="loader-bar"
          style={{
            background: `rgba(${props?.rgb?.r}, ${props?.rgb?.g}, ${props?.rgb?.b}, ${0.2 + i * 0.15})`,
          }}
        />
      ))}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="loader-text"
      >
        {
          props?.message
        }
      </motion.h1>
    </div>
  );
};

export default NetflixLoader;
