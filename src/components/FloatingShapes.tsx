import { motion } from "framer-motion";

const FloatingShapes = () => {
  const shapes = [
    { size: "w-72 h-72", color: "bg-primary/10", x: "10%", y: "15%", duration: 18 },
    { size: "w-96 h-96", color: "bg-info/8", x: "65%", y: "10%", duration: 22 },
    { size: "w-64 h-64", color: "bg-accent/15", x: "75%", y: "60%", duration: 20 },
    { size: "w-48 h-48", color: "bg-primary/6", x: "20%", y: "70%", duration: 16 },
    { size: "w-56 h-56", color: "bg-success/6", x: "50%", y: "40%", duration: 24 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${shape.size} ${shape.color} blur-3xl`}
          style={{ left: shape.x, top: shape.y }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 15, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;
