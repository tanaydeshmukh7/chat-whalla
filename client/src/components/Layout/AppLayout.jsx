import Sidebar from './Sidebar';
import ChatScreen from '../Chat/ChatScreen';
import '../../styles/chat.css';

const AppLayout = () => {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <Sidebar />
      <ChatScreen />
    </div>
  );
};

export default AppLayout;
