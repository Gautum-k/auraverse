import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import PlayerBar from './components/PlayerBar';
import Home from './pages/Home';
import Search from './pages/Search';
import Artist from './pages/Artist';
import Collabs from './pages/Collabs';
import Upload from './pages/Upload';
import Library from './pages/Library';
import Login from './pages/Login';
import Playlist from './pages/Playlist';
import EditProfile from './pages/EditProfile';
import Queue from './pages/Queue';
import Category from './pages/Category';

function Shell() {
  const ref = useRef(null);
  const [solid, setSolid] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <Sidebar />
      <main className="main" ref={ref} onScroll={(e) => setSolid(e.currentTarget.scrollTop > 60)}>
        <Topbar solid={solid} />
        <Outlet />
      </main>
      <PlayerBar />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Shell />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/artist/:id" element={<Artist />} />
        <Route path="/collabs" element={<Collabs />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/library" element={<Library />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/category/:type/:value" element={<Category />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
