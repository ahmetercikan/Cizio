import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AvatarArt } from '../components/Avatars';
import { FlowLine } from '../components/FlowLine';
import { sfx } from '../lib/sfx';
import { unlockAudio } from '../lib/speech';
import { useApp } from '../store/useApp';

export default function Profiles() {
  const nav = useNavigate();
  const profiles = useApp((s) => s.profiles);
  const setActive = useApp((s) => s.setActive);

  return (
    <div className="bg onb">
      <FlowLine variant={2} />
      <div className="onb__center">
        <h1 className="title-xl rise">Kim çizecek?</h1>
        <div className="profile-grid rise" style={{ animationDelay: '0.1s' }}>
          {profiles.map((p) => (
            <button
              key={p.id}
              className="profile-tile"
              onClick={() => {
                unlockAudio();
                sfx.pop();
                setActive(p.id);
                nav('/', { replace: true });
              }}
            >
              <AvatarArt id={p.avatar} size={132} ring />
              <b>{p.name}</b>
            </button>
          ))}
          <button className="profile-tile" onClick={() => nav('/hosgeldin')}>
            <span className="profile-add"><Plus size={46} /></span>
            <b>Yeni</b>
          </button>
        </div>
      </div>
    </div>
  );
}
