import { motion } from "framer-motion";
import { SearchHotelCard } from "./SearchHotelCard";
function CardSkeleton() {
    return (<div className="overflow-hidden rounded-3xl bg-card ring-1 ring-black/[0.04]">
      <div className="shimmer aspect-[16/11] w-full"/>
      <div className="space-y-2 p-4">
        <div className="shimmer h-4 w-2/3 rounded"/>
        <div className="shimmer h-3 w-1/3 rounded"/>
        <div className="shimmer mt-3 h-8 w-full rounded-full"/>
      </div>
    </div>);
}
const GRID_CLASS = "grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
export function ResultsGrid({ hotels, isLoading, context }) {
    if (isLoading && hotels.length === 0) {
        return (<div className={GRID_CLASS}>
        {Array.from({ length: 6 }).map((_, i) => (<CardSkeleton key={i}/>))}
      </div>);
    }
    return (<div className={GRID_CLASS}>
      {hotels.map((h, i) => (<motion.div key={h.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{
                duration: 0.45,
                delay: Math.min(i * 0.05, 0.3),
                ease: [0.16, 1, 0.3, 1],
            }}>
          <SearchHotelCard hotel={h} context={context}/>
        </motion.div>))}
    </div>);
}
