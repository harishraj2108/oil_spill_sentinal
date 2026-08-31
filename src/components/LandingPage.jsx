import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useRef, useEffect, useState } from "react";
import { ArrowRight, ShieldAlert, Navigation, ChevronDown } from "lucide-react";
import MaskedHeading from "./MaskedHeading";

export default function LandingPage({ onLaunch }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  const [showScrollHint, setShowScrollHint] = useState(true);

  // Hide scroll hint once user starts scrolling
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleScroll = () => {
      if (window.scrollY > 80) setShowScrollHint(false);
      else setShowScrollHint(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" });
  };

  return (
    <div ref={ref} className="relative w-full h-auto bg-[#0a0a0a] text-white min-h-[350vh] font-sans">
      
      {/* Full Background Video - Fixed Wallpaper */}
      <video
        key="bg-video-wallpaper"
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 z-0 w-screen h-screen object-cover pointer-events-none"
        style={{ filter: "contrast(1.1) saturate(1.2)" }}
      >
        <source src="/tanker_bg.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for Text Readability */}
      <div className="fixed top-0 left-0 z-0 h-screen w-screen bg-slate-900/40 pointer-events-none" />

      {/* Scroll Animated Line Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-center">
        <LinePath scrollYProgress={scrollYProgress} className="min-w-[1200px] w-full h-auto object-cover opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 pb-32 flex flex-col gap-32">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0284C7] flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-bold text-xl tracking-wider text-white">AQUA<span className="text-[#0284C7]">SENTINEL</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <button onClick={onLaunch} className="text-white hover:text-[#0284C7] transition">Launch App</button>
            <span className="hover:text-white transition cursor-pointer">Technology</span>
            <span className="hover:text-white transition cursor-pointer">Platform</span>
            <span className="hover:text-white transition cursor-pointer">About Us</span>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 mt-10">
          <div className="flex-1 space-y-8">
            <MaskedHeading 
              text="Protect The Oceans."
              weight={900}
              mediaType="color"
              src="#0284C7"
              className="text-6xl md:text-9xl font-black leading-tight tracking-tighter drop-shadow-lg"
            />
            <p className="text-gray-300 max-w-md text-lg">
              AQUASENTINEL is a state-of-the-art intelligent marine oil spill detection and vessel attribution platform.
            </p>
            <div className="flex items-center gap-6">
              <button onClick={onLaunch} className="px-8 py-4 rounded-full bg-[#0284C7] text-white shadow-lg font-semibold hover:scale-105 hover:bg-[#0369a1] transition flex items-center gap-2">
                Get Started
              </button>
              <button onClick={onLaunch} className="flex items-center gap-3 text-sm font-semibold text-white hover:text-[#0284C7] transition group">
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* Scroll Down Indicator */}
            <AnimatePresence>
              {showScrollHint && (
                <motion.button
                  key="scroll-hint"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                  onClick={scrollDown}
                  className="mt-2 flex flex-col items-center gap-1 group cursor-pointer select-none w-fit"
                  aria-label="Scroll down to explore"
                >
                  <span className="text-xs font-semibold text-sky-300/70 uppercase tracking-widest group-hover:text-sky-300 transition">Scroll to explore</span>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  >
                    <ChevronDown className="w-6 h-6 text-[#0ea5e9] opacity-80 group-hover:opacity-100 transition" />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1 relative flex justify-center md:justify-end">
            <div className="w-[400px] h-[500px] rounded-[40px] bg-[#0ea5e9]/10 backdrop-blur-xl border border-[#0ea5e9]/30 shadow-2xl shadow-[#0ea5e9]/10 relative overflow-hidden flex flex-col p-8 z-10">
               <div className="absolute top-10 right-10 w-32 h-32 bg-[#0ea5e9]/30 rounded-full blur-3xl z-0" />
               <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#0284C7]/30 rounded-full blur-3xl z-0" />
               
               <div className="relative z-10 flex flex-col h-full">
                 <div className="mb-8">
                   <h3 className="text-2xl font-bold text-white">Admin Access</h3>
                   <p className="text-sky-200 text-sm mt-1">Authenticate to Command Center</p>
                 </div>
                 
                 <div className="space-y-4 flex-1">
                   <div>
                     <label className="block text-xs font-semibold text-sky-300 uppercase mb-1">Username</label>
                     <input type="text" placeholder="admin_demo" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/60 backdrop-blur-md" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-sky-300 uppercase mb-1">Email</label>
                     <input type="email" placeholder="admin@aquasentinel.ai" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/60 backdrop-blur-md" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-sky-300 uppercase mb-1">Password</label>
                     <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/60 backdrop-blur-md" />
                   </div>
                 </div>

                 <button onClick={onLaunch} className="w-full py-4 mt-6 rounded-xl bg-[#0284C7] text-white font-bold hover:bg-[#0369a1] transition shadow-lg shadow-[#0284C7]/40 border border-sky-400/30">
                   Secure Login
                 </button>
               </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white/80 backdrop-blur-md rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between border border-slate-200 shadow-sm">
          <div className="flex gap-16">
            <div>
              <p className="text-slate-500 text-sm mb-2 font-mono uppercase font-semibold">Scans</p>
              <p className="text-4xl font-bold text-slate-800">27k+</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-2 font-mono uppercase font-semibold">Vessels</p>
              <p className="text-4xl font-bold text-slate-800">25k+</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-2 font-mono uppercase font-semibold">Attributions</p>
              <p className="text-4xl font-bold text-slate-800">12k+</p>
            </div>
          </div>
          
          <div className="mt-8 md:mt-0 flex items-center gap-6 border-l border-slate-200 pl-10">
            <div>
              <p className="text-slate-500 text-sm mb-1 font-mono uppercase font-semibold">Accuracy</p>
              <p className="text-2xl font-bold text-[#0284C7]">94.2%</p>
            </div>
          </div>
        </section>

        {/* Features Split Section */}
        <section className="flex flex-col md:flex-row gap-12 mt-10">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="h-48 rounded-3xl bg-slate-200 border border-slate-300 overflow-hidden shadow-sm">
              <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div className="h-48 rounded-3xl bg-slate-200 border border-slate-300 overflow-hidden shadow-sm">
               <img src="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div className="h-48 rounded-3xl bg-slate-200 border border-slate-300 overflow-hidden shadow-sm">
               <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div className="h-48 rounded-3xl bg-sky-50 border border-sky-100 overflow-hidden flex items-center justify-center shadow-sm">
               <Navigation className="w-10 h-10 text-[#0284C7]" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <p className="text-[#0284C7] text-sm uppercase tracking-widest font-mono font-bold">Advanced Tech</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white">
              SAR Detection <br/> & AI Hindcasting.
            </h2>
            <p className="text-gray-300">
              Sentinel-1 SAR imagery processed through a U-Net architecture for high-precision spill segmentation, paired with OpenDrift physics-aware analytics.
            </p>
            <button onClick={onLaunch} className="flex items-center gap-2 text-sm font-bold text-white hover:text-[#0284C7] transition w-fit mt-4 pb-1 border-b-2 border-[#0284C7]">
              See in action <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-32 border-t border-white/20 pt-20 flex flex-col md:flex-row justify-between items-start gap-12">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight max-w-lg text-white">
            Stay Updated On Marine Protection AI.
          </h2>
          <div className="flex gap-4">
            <button className="px-8 py-3 rounded-full bg-[#0284C7] text-white shadow-lg font-semibold hover:bg-[#0369a1] hover:scale-105 transition">
              Subscribe Now
            </button>
          </div>
        </section>
        
      </div>
    </div>
  );
}

const LinePath = ({ className, scrollYProgress }) => {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.1, 1]);

  return (
    <svg
      width="1278"
      height="2319"
      viewBox="0 0 1278 2319"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="#FFFFFF"
        strokeWidth="12"
        strokeLinecap="round"
        style={{
          pathLength,
          strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
        }}
      />
    </svg>
  );
};
