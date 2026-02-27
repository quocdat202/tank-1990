import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';
import { useEnemyStore } from '../../stores/enemyStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useBulletStore } from '../../stores/bulletStore';
import { useEffectStore } from '../../stores/effectStore';
import { usePowerUpStore } from '../../stores/powerUpStore';
import { checkBulletTileCollision, checkBulletHitTank, checkTankCollision } from '../../systems/CollisionSystem';
import { canTankMoveTo } from '../../systems/CollisionSystem';
import { GRID_SIZE, TILE, DIRECTION_VECTORS, ENEMY_SPAWN_INTERVAL, TOTAL_ENEMIES_PER_STAGE, FREEZE_DURATION, SHIELD_DURATION, FORTRESS_DURATION } from '../../data/constants';
import { playEnemyShoot, playHitBrick, playHitSteel, playExplosionSmall, playExplosionBig, playPowerUp, playExtraLife, playGameOver, playPlayerDeath, playBaseDestroyed, playBulletBounce, playFreeze, playBomb, playStageComplete } from '../../systems/AudioSystem';
import type { Direction } from '../../types/game';

const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

export function GameLoop() {
  const spawnTimerRef = useRef(ENEMY_SPAWN_INTERVAL); // spawn first enemy immediately

  useFrame((_, delta) => {
    const { phase, freezeTimer } = useGameStore.getState();
    if (phase !== 'PLAYING') return;

    const dt = Math.min(delta, 0.05);
    const dtMs = dt * 1000;

    // Update freeze timer
    if (freezeTimer > 0) {
      useGameStore.getState().setFreezeTimer(Math.max(0, freezeTimer - dtMs));
    }

    // Update fortress timer
    const { fortressTimer } = useGameStore.getState();
    if (fortressTimer > 0) {
      useGameStore.getState().setFortressTimer(Math.max(0, fortressTimer - dtMs));
    }

    // Spawn enemies
    spawnTimerRef.current += dtMs;
    if (spawnTimerRef.current >= ENEMY_SPAWN_INTERVAL) {
      spawnTimerRef.current = 0;
      useEnemyStore.getState().spawnEnemy();
    }

    // Update enemy spawn timers
    const enemies = useEnemyStore.getState().enemies;
    for (const enemy of enemies) {
      if (enemy.spawnTimer > 0) {
        useEnemyStore.getState().updateEnemy(enemy.id, { spawnTimer: Math.max(0, enemy.spawnTimer - dtMs) });
      }
    }

    // Enemy AI (if not frozen)
    const isFrozen = useGameStore.getState().freezeTimer > 0;
    if (!isFrozen) {
      const currentEnemies = useEnemyStore.getState().enemies;
      for (const enemy of currentEnemies) {
        if (!enemy.isAlive || enemy.spawnTimer > 0) continue;

        // Move
        let dir = enemy.direction;
        let moveTimer = enemy.moveTimer + dtMs;

        // Change direction randomly or when blocked
        if (moveTimer > 1500 + Math.random() * 2000) {
          moveTimer = 0;
          dir = DIRECTIONS[Math.floor(Math.random() * 4)];
        }

        const speed = enemy.speed * dt;
        const result = canTankMoveTo(enemy.x, enemy.y, dir, speed);

        if (result.canMove) {
          // Check collision with other tanks
          const p1 = usePlayerStore.getState().player1;
          const p2 = usePlayerStore.getState().player2;
          const allEnemies = useEnemyStore.getState().enemies;
          let tankBlocked = false;

          if (p1.isAlive && checkTankCollision(result.newX, result.newY, p1.x, p1.y)) tankBlocked = true;
          if (p2.isAlive && checkTankCollision(result.newX, result.newY, p2.x, p2.y)) tankBlocked = true;
          for (const other of allEnemies) {
            if (other.id !== enemy.id && other.isAlive && checkTankCollision(result.newX, result.newY, other.x, other.y)) {
              tankBlocked = true;
              break;
            }
          }

          if (!tankBlocked) {
            useEnemyStore.getState().updateEnemy(enemy.id, { x: result.newX, y: result.newY, direction: dir, moveTimer });
          } else {
            dir = DIRECTIONS[Math.floor(Math.random() * 4)];
            useEnemyStore.getState().updateEnemy(enemy.id, { direction: dir, moveTimer: 0 });
          }
        } else {
          dir = DIRECTIONS[Math.floor(Math.random() * 4)];
          useEnemyStore.getState().updateEnemy(enemy.id, { direction: dir, moveTimer: 0 });
        }

        // Shoot
        const shootTimer = enemy.shootTimer + dtMs;
        if (shootTimer > 1500 + Math.random() * 2000) {
          const dirVec = DIRECTION_VECTORS[dir];
          useBulletStore.getState().addBullet(
            enemy.x + dirVec.x * 0.5, enemy.y + dirVec.y * 0.5,
            dir, enemy.id, false, 1, enemy.bulletSpeed,
          );
          useEnemyStore.getState().updateEnemy(enemy.id, { shootTimer: 0 });
          playEnemyShoot();
        } else {
          useEnemyStore.getState().updateEnemy(enemy.id, { shootTimer });
        }
      }
    }

    // Update bullets
    const bullets = useBulletStore.getState().bullets;
    const bulletsToRemove: string[] = [];
    const updatedBullets = bullets.map((bullet) => {
      if (bulletsToRemove.includes(bullet.id)) return bullet;

      const dir = DIRECTION_VECTORS[bullet.direction];
      const newX = bullet.x + dir.x * bullet.speed * dt;
      const newY = bullet.y + dir.y * bullet.speed * dt;

      // Out of bounds
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        bulletsToRemove.push(bullet.id);
        useEffectStore.getState().addExplosion(bullet.x, bullet.y);
        playBulletBounce();
        return bullet;
      }

      // Tile collision
      const tileHit = checkBulletTileCollision(newX, newY, bullet.direction, bullet.canBreakSteel);
      if (tileHit.hit) {
        bulletsToRemove.push(bullet.id);
        useEffectStore.getState().addExplosion(newX, newY);
        if (tileHit.isBase) {
          playBaseDestroyed();
          useGameStore.getState().setPhase('GAME_OVER');
        } else if (tileHit.tileType === TILE.STEEL) {
          playHitSteel();
        } else if (tileHit.tileType === TILE.BRICK) {
          playHitBrick();
        } else {
          playBulletBounce();
        }
        return bullet;
      }

      // Bullet vs bullet
      for (const other of bullets) {
        if (other.id !== bullet.id && !bulletsToRemove.includes(other.id)) {
          if (Math.abs(newX - other.x) < 0.3 && Math.abs(newY - other.y) < 0.3) {
            if (bullet.isPlayerBullet !== other.isPlayerBullet) {
              bulletsToRemove.push(bullet.id);
              bulletsToRemove.push(other.id);
              playExplosionSmall();
              return bullet;
            }
          }
        }
      }

      // Player bullet hits enemy
      if (bullet.isPlayerBullet) {
        const currentEnemies = useEnemyStore.getState().enemies;
        for (const enemy of currentEnemies) {
          if (!enemy.isAlive || enemy.spawnTimer > 0) continue;
          if (checkBulletHitTank(newX, newY, enemy.x, enemy.y)) {
            bulletsToRemove.push(bullet.id);
            const result = useEnemyStore.getState().damageEnemy(enemy.id);
            if (result.destroyed) {
              useEffectStore.getState().addExplosion(enemy.x, enemy.y, true);
              usePlayerStore.getState().addScore(bullet.ownerId, result.points);
              usePlayerStore.getState().addKill(bullet.ownerId, result.typeIndex);
              playExplosionBig();
              if (result.isFlashing) {
                usePowerUpStore.getState().spawnPowerUp();
              }
            } else {
              useEffectStore.getState().addExplosion(newX, newY);
              playHitSteel(); // armor hit sounds metallic
            }
            return bullet;
          }
        }
      }

      // Enemy bullet hits player
      if (!bullet.isPlayerBullet) {
        const mode = useGameStore.getState().mode;
        const players = [usePlayerStore.getState().player1];
        if (mode === '2P') players.push(usePlayerStore.getState().player2);

        for (const player of players) {
          if (!player.isAlive) continue;
          if (checkBulletHitTank(newX, newY, player.x, player.y)) {
            bulletsToRemove.push(bullet.id);
            if (!player.isShielded) {
              usePlayerStore.getState().die(player.id);
              useEffectStore.getState().addExplosion(player.x, player.y, true);
              playPlayerDeath();
              // Check game over
              const p = usePlayerStore.getState().getPlayer(player.id);
              if (p.lives >= 0) {
                setTimeout(() => { usePlayerStore.getState().respawn(player.id); }, 1500);
              }
              // Check if all players dead
              setTimeout(() => {
                const p1 = usePlayerStore.getState().player1;
                const p2 = usePlayerStore.getState().player2;
                const m = useGameStore.getState().mode;
                const allDead = m === '1P'
                  ? (!p1.isAlive && p1.lives < 0)
                  : (!p1.isAlive && p1.lives < 0 && !p2.isAlive && p2.lives < 0);
                if (allDead) {
                  playGameOver();
                  useGameStore.getState().setPhase('GAME_OVER');
                }
              }, 100);
            } else {
              useEffectStore.getState().addExplosion(newX, newY);
              playBulletBounce(); // shield deflect
            }
            return bullet;
          }
        }
      }

      return { ...bullet, x: newX, y: newY };
    });

    // Apply bullet removals
    if (bulletsToRemove.length > 0) {
      const remaining = updatedBullets.filter((b) => !bulletsToRemove.includes(b.id));
      useBulletStore.setState({ bullets: remaining });
      for (const id of bulletsToRemove) {
        const b = bullets.find((bb) => bb.id === id);
        if (b && b.isPlayerBullet) {
          usePlayerStore.getState().bulletDestroyed(b.ownerId);
        }
      }
    } else {
      useBulletStore.setState({ bullets: updatedBullets });
    }

    // Power-up pickup
    const powerUps = usePowerUpStore.getState().powerUps;
    const mode = useGameStore.getState().mode;
    const playerIds = mode === '2P' ? ['player1', 'player2'] : ['player1'];
    for (const pu of powerUps) {
      for (const pid of playerIds) {
        const p = usePlayerStore.getState().getPlayer(pid);
        if (!p.isAlive) continue;
        if (Math.abs(p.x - pu.x) < 0.8 && Math.abs(p.y - pu.y) < 0.8) {
          usePowerUpStore.getState().removePowerUp(pu.id);
          applyPowerUp(pu.type, pid);
          break;
        }
      }
    }
    usePowerUpStore.getState().clearExpired();

    // Check stage complete
    const es = useEnemyStore.getState();
    if (es.totalSpawned >= TOTAL_ENEMIES_PER_STAGE && es.enemies.every((e) => !e.isAlive)) {
      playStageComplete();
      useGameStore.getState().setPhase('STAGE_COMPLETE');
    }
  });

  return null;
}

function applyPowerUp(type: string, playerId: string) {
  switch (type) {
    case 'star':
      usePlayerStore.getState().upgradePlayer(playerId);
      playPowerUp();
      break;
    case 'gun':
      usePlayerStore.getState().maxUpgradePlayer(playerId);
      playPowerUp();
      break;
    case 'shield':
      usePlayerStore.getState().setShielded(playerId, true);
      setTimeout(() => { usePlayerStore.getState().setShielded(playerId, false); }, SHIELD_DURATION);
      playPowerUp();
      break;
    case 'bomb':
      useEnemyStore.getState().destroyAll();
      playBomb();
      break;
    case 'timer':
      useGameStore.getState().setFreezeTimer(FREEZE_DURATION);
      playFreeze();
      break;
    case 'life':
      usePlayerStore.getState().addLife(playerId);
      playExtraLife();
      break;
    case 'fortress':
      useGameStore.getState().setFortressTimer(FORTRESS_DURATION);
      playPowerUp();
      break;
  }
}
