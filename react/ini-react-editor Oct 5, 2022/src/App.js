import { Route, Routes } from 'react-router-dom';
import './styles/main.sass';

import Header from './components/Header';
import Home from './pages/Home';
import FileList from './pages/FileList';
import CreateFile from './pages/CreateFile';
import EditFile from './pages/EditFile';

function App() {
  return (
    <div className="App">
      <Header />
        <Routes>
            <Route path='/' element={<Home />}/>
            <Route path='/list' element={<FileList />}/>
            <Route path='/file/new' element={<CreateFile />}/>
            <Route path='/file/:fileName' element={<EditFile />}/>
        </Routes>
    </div>
  );
}

export default App;
