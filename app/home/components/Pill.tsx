export default function Pill({ pill }: { pill: string }) {
  return (
    <div className="
      inline-flex w-fit px-2 py-1 text-sm font-medium font-monteserrat rounded-2xl
     bg-gradient-to-t from-blue-400 to-blue-500 text-gray-100 border-blue-400 
     flex items-center gap-1
      ">
      <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse"></span>{pill}
    </div>
  );
}