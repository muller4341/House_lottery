import { useSelector } from "react-redux";
export default function ThemeProvider({children}){
  const {theme }= useSelector(state => state.theme)



  return (
    <div className={theme}>
      <div className="min-h-screen bg-white text-gray-800 dark:bg-gray-700 dark:text-white md:text-[18px] " >
        {children}
      </div>

    </div>
  );  
}