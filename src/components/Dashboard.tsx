import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useGlobalStore } from "@/store/global";
import { Library, ListMusic, Rotate3D } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Left from "./LeftPart";
import { Main } from "./Main";
import { Right } from "./Right";
import { TopBar } from "./TopBar";
import { useWakeLock } from "@/utils/hooks/useWakeLock";
import { Bottom } from "./Bottom";
import { AudioVisualizer } from "./SpatialAudioBackground";

interface DashboardProps {
  roomId: string;
}

export const Dashboard = ({ roomId }: DashboardProps) => {
  const isSynced = useGlobalStore((state) => state.isSynced);
  const isLoadingAudio = useGlobalStore((state) => state.isInitingSystem);
  const isReady = isSynced && !isLoadingAudio;
  
  useWakeLock(true);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

return (
  <div className="flex flex-col w-full h-screen text-white bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] backdrop-blur-lg">
    {/* Top bar (fixed height) */}
    <TopBar roomId={roomId} />

    {isReady && (
      <motion.div
        className="flex flex-col flex-1 overflow-hidden min-h-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Desktop Layout (lg and up) --- */}
        <div className="hidden lg:flex flex-1 overflow-hidden min-h-0">
          <Left/>
          {/* <VisualizerCanvas /> */}
          <Main />
          <Right />
        </div>

        {/* --- Mobile Layout (less than lg) --- */}
        <div className="flex flex-col flex-1 overflow-hidden lg:hidden min-h-0">
          <Tabs defaultValue="queue" className="flex flex-col flex-1 overflow-hidden min-h-0">
            {/* Tab List */}
            <TabsList className="grid grid-cols-3 h-12 w-full shrink-0 rounded-none bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-0">
              {[
                { value: "library", icon: <Library size={16} />, label: "Library" },
                { value: "queue", icon: <ListMusic size={16} />, label: "Queue" },
                { value: "spatial", icon: <Rotate3D size={16} />, label: "Spatial" },
              ].map(({ value, icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center justify-center h-full gap-1 text-xs text-neutral-400 transition-all duration-200 rounded-none data-[state=active]:bg-white/5 data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  {icon} {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            <AnimatePresence mode="sync">
              <TabsContent value="library" className="flex-1 overflow-y-auto min-h-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Left/>
                </motion.div> 
              </TabsContent>

              <TabsContent value="queue" className="flex-1 overflow-y-auto min-h-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Main />
                </motion.div>
              </TabsContent>

              <TabsContent value="spatial" className="flex-1 overflow-y-auto min-h-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Right />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
        
      </motion.div>
    )}
  </div>
);

};
