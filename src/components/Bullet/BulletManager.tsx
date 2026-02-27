import { useBulletStore } from '../../stores/bulletStore';
import { BulletMesh } from './Bullet';

export function BulletManager() {
  const bullets = useBulletStore((s) => s.bullets);

  return (
    <group>
      {bullets.map((bullet) => (
        <BulletMesh key={bullet.id} bullet={bullet} />
      ))}
    </group>
  );
}
