import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = ({ children, onCreateClick }) => {
  return (
    <div className="flex h-screen bg-[#F8FAFD]">
      <Sidebar onNewClick={onCreateClick} />
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="bg-white rounded-full shadow-sm mx-4 mt-2">
           <Header />
        </div>  
        <div className="flex-1 bg-white rounded-3xl m-4 p-6 shadow-sm overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
};

export default MainLayout;