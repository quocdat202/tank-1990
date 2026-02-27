# Tank 1990 - Game Development Plan

## Tech Stack

| Thành phần       | Công nghệ                                |
| ---------------- | ---------------------------------------- |
| UI Framework     | React 18                                 |
| 3D Rendering     | React Three Fiber (`@react-three/fiber`) |
| 3D Helpers       | `@react-three/drei`                      |
| State Management | Zustand                                  |
| Ngôn ngữ         | TypeScript                               |
| Build Tool       | Vite                                     |
| Âm thanh         | Howler.js                                |
| Styling          | CSS Modules / Tailwind CSS               |

---

## 1. Kiến trúc tổng quan

### 1.1 Project Structure

```
tank-1990/
├── public/
│   ├── assets/
│   │   ├── textures/          # Texture cho tank, map, effects
│   │   ├── sounds/            # File âm thanh
│   │   └── maps/              # File dữ liệu map (JSON)
├── src/
│   ├── components/
│   │   ├── Game/
│   │   │   ├── Game.tsx              # Component chính chứa Canvas R3F
│   │   │   ├── GameScene.tsx         # Scene 3D chính
│   │   │   └── GameLoop.tsx          # Game loop (useFrame)
│   │   ├── Map/
│   │   │   ├── GameMap.tsx           # Render toàn bộ map
│   │   │   ├── Tile.tsx              # Component cho từng tile
│   │   │   ├── BrickWall.tsx         # Tường gạch (phá được)
│   │   │   ├── SteelWall.tsx         # Tường thép (không phá được)
│   │   │   ├── Water.tsx             # Nước (không đi qua được)
│   │   │   ├── Tree.tsx              # Cây cỏ (che khuất, đi qua được)
│   │   │   ├── Ice.tsx               # Băng (trơn trượt)
│   │   │   └── Base.tsx              # Base (đại bàng) - cần bảo vệ
│   │   ├── Tank/
│   │   │   ├── PlayerTank.tsx        # Tank người chơi
│   │   │   ├── EnemyTank.tsx         # Tank địch
│   │   │   ├── TankModel.tsx         # 3D model/sprite chung cho tank
│   │   │   └── TankEffects.tsx       # Hiệu ứng shield, spawn
│   │   ├── Bullet/
│   │   │   ├── Bullet.tsx            # Component đạn
│   │   │   └── BulletManager.tsx     # Quản lý tất cả đạn
│   │   ├── PowerUp/
│   │   │   ├── PowerUp.tsx           # Component power-up
│   │   │   └── PowerUpManager.tsx    # Quản lý spawn power-up
│   │   ├── Effects/
│   │   │   ├── Explosion.tsx         # Hiệu ứng nổ
│   │   │   ├── SpawnEffect.tsx       # Hiệu ứng xuất hiện
│   │   │   └── ParticleSystem.tsx    # Hệ thống particle
│   │   └── UI/
│   │       ├── MainMenu.tsx          # Menu chính
│   │       ├── HUD.tsx               # Heads-up display (thông tin game)
│   │       ├── PauseMenu.tsx         # Menu tạm dừng
│   │       ├── GameOver.tsx          # Màn hình thua
│   │       ├── StageComplete.tsx     # Màn hình hoàn thành màn
│   │       ├── ScoreBoard.tsx        # Bảng điểm cuối màn
│   │       └── LevelTransition.tsx   # Animation chuyển màn
│   ├── stores/
│   │   ├── gameStore.ts              # State tổng game (phase, level, score)
│   │   ├── playerStore.ts            # State player (vị trí, mạng, cấp độ)
│   │   ├── enemyStore.ts             # State enemies
│   │   ├── bulletStore.ts            # State đạn
│   │   ├── mapStore.ts               # State map hiện tại
│   │   └── powerUpStore.ts           # State power-ups
│   ├── systems/
│   │   ├── CollisionSystem.ts        # Xử lý va chạm
│   │   ├── MovementSystem.ts         # Xử lý di chuyển (grid-based)
│   │   ├── AISystem.ts               # AI cho enemy tanks
│   │   ├── SpawnSystem.ts            # Hệ thống spawn enemy
│   │   ├── InputSystem.ts            # Xử lý input (keyboard)
│   │   └── AudioSystem.ts            # Quản lý âm thanh
│   ├── data/
│   │   ├── levels.ts                 # Dữ liệu 35 màn chơi
│   │   ├── tankTypes.ts              # Định nghĩa các loại tank
│   │   ├── constants.ts              # Hằng số game
│   │   └── powerUpTypes.ts           # Định nghĩa power-ups
│   ├── types/
│   │   ├── game.ts                   # Type definitions
│   │   ├── tank.ts
│   │   ├── map.ts
│   │   └── powerUp.ts
│   ├── utils/
│   │   ├── gridUtils.ts              # Utility cho grid/tile calculations
│   │   ├── mathUtils.ts              # Utility toán học
│   │   └── textureUtils.ts           # Utility load texture
│   ├── hooks/
│   │   ├── useGameLoop.ts            # Custom hook game loop
│   │   ├── useKeyboard.ts            # Custom hook keyboard input
│   │   └── useAudio.ts               # Custom hook audio
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── GAME_PLAN.md
```

### 1.2 Game Flow

```
[Main Menu] → [Stage Intro] → [Gameplay] → [Stage Complete / Game Over]
     ↑              ↑               |                |
     |              |          [Pause Menu]          |
     |              └────────────────┘               |
     └───────────────────────────────────────────────┘
```

### 1.3 Game Phases

| Phase            | Mô tả                                |
| ---------------- | ------------------------------------ |
| `MENU`           | Màn hình chính, chọn 1P/2P           |
| `STAGE_INTRO`    | Hiển thị "STAGE X" trước khi bắt đầu |
| `PLAYING`        | Đang chơi                            |
| `PAUSED`         | Tạm dừng                             |
| `STAGE_COMPLETE` | Hoàn thành màn, hiện bảng điểm       |
| `GAME_OVER`      | Thua game                            |

---

## 2. Chi tiết từng hệ thống

### 2.1 Map System

**Grid**: 26 cột x 26 hàng (giống bản gốc, mỗi ô là 8x8 pixel tương đương)

**Tile Types**:

| ID  | Loại       | Thuộc tính                                      |
| --- | ---------- | ----------------------------------------------- |
| 0   | Empty      | Đi qua được, đạn xuyên qua                      |
| 1   | Brick Wall | Chặn di chuyển, phá được bằng đạn, phá từng nửa |
| 2   | Steel Wall | Chặn di chuyển, chỉ phá được bằng đạn cấp 3+    |
| 3   | Water      | Chặn di chuyển, đạn xuyên qua                   |
| 4   | Tree       | Đi qua được, che khuất tank (render trên cùng)  |
| 5   | Ice        | Đi qua được, tank trượt (không dừng ngay)       |
| 6   | Base       | Đại bàng - bị phá = thua game                   |

**Brick Wall chi tiết**: Mỗi tile brick chia thành 4 phần nhỏ (2x2), mỗi phần có thể bị phá riêng → tạo hiệu ứng phá tường realistic.

**Map data format** (JSON):

```json
{
  "stage": 1,
  "tiles": [
    [0, 0, 0, 1, 1, 0, ...],
    [0, 1, 0, 0, 2, 0, ...],
    ...
  ],
  "enemyTypes": [0, 0, 0, 1, 0, 1, 2, ...],
  "totalEnemies": 20
}
```

### 2.2 Tank System

#### Player Tank

**Cấp độ tank** (nâng cấp bằng Star power-up):

| Cấp | Tốc độ đạn | Số đạn tối đa | Phá thép | Tốc độ tank |
| --- | ---------- | ------------- | -------- | ----------- |
| 1   | Chậm       | 1             | Không    | Bình thường |
| 2   | Nhanh      | 1             | Không    | Bình thường |
| 3   | Nhanh      | 2             | Không    | Bình thường |
| 4   | Nhanh      | 2             | Có       | Bình thường |

**Điều khiển**:

| Player 1 | Player 2 | Hành động       |
| -------- | -------- | --------------- |
| W / ↑    | Numpad 8 | Di chuyển lên   |
| S / ↓    | Numpad 5 | Di chuyển xuống |
| A / ←    | Numpad 4 | Di chuyển trái  |
| D / →    | Numpad 6 | Di chuyển phải  |
| Space    | Numpad 0 | Bắn             |

**Spawn position**:

- Player 1: Dưới cùng, bên trái base
- Player 2: Dưới cùng, bên phải base

#### Enemy Tank

**4 loại tank địch**:

| Loại  | Màu          | Tốc độ | Đạn   | HP  | Điểm |
| ----- | ------------ | ------ | ----- | --- | ---- |
| Basic | Xám          | Chậm   | Chậm  | 1   | 100  |
| Fast  | Xanh nhạt    | Nhanh  | Chậm  | 1   | 200  |
| Power | Xanh lá      | Chậm   | Nhanh | 1   | 300  |
| Armor | Vàng/Xanh/Đỏ | Chậm   | Nhanh | 4   | 400  |

- Armor tank đổi màu mỗi lần bị bắn trúng
- Mỗi màn có 20 enemy tanks
- Tối đa 4 enemy cùng lúc trên map
- Tank có viền đỏ nhấp nháy = drop power-up khi bị tiêu diệt

**Spawn positions**: 3 vị trí cố định ở hàng trên cùng (trái, giữa, phải)

### 2.3 AI System

**Enemy AI** hoạt động theo logic đơn giản:

```
Mỗi frame:
  1. Di chuyển theo hướng hiện tại
  2. Nếu gặp vật cản hoặc random timer hết → đổi hướng ngẫu nhiên
  3. Random bắn đạn (tần suất tùy loại tank)
  4. Một số tank "thông minh hơn" sẽ ưu tiên hướng về phía base/player
```

**AI Levels**:

- **Basic AI**: Di chuyển random, bắn random
- **Smart AI**: 50% cơ hội di chuyển về phía base hoặc player

### 2.4 Collision System

Sử dụng **AABB (Axis-Aligned Bounding Box)** collision detection:

```
Các loại va chạm cần xử lý:
├── Tank ↔ Wall          → Chặn di chuyển
├── Tank ↔ Water         → Chặn di chuyển
├── Tank ↔ Tank          → Chặn di chuyển
├── Tank ↔ Map border    → Chặn di chuyển
├── Bullet ↔ Brick Wall  → Phá tường + xóa đạn
├── Bullet ↔ Steel Wall  → Xóa đạn (hoặc phá nếu đạn cấp 4)
├── Bullet ↔ Tank        → Gây damage + xóa đạn
├── Bullet ↔ Bullet      → Cả 2 đạn biến mất
├── Bullet ↔ Base        → Game Over
├── Bullet ↔ Map border  → Xóa đạn
├── Tank ↔ Power-up      → Kích hoạt power-up
└── Tank ↔ Ice           → Trượt (giảm friction)
```

### 2.5 Power-up System

Power-up xuất hiện khi tiêu diệt enemy tank có viền đỏ nhấp nháy.

| Icon | Tên      | Hiệu ứng                             |
| ---- | -------- | ------------------------------------ |
| ⭐   | Star     | Nâng cấp tank lên 1 level            |
| 🛡️   | Shield   | Bất tử 10 giây                       |
| 💣   | Bomb     | Tiêu diệt tất cả enemy đang trên map |
| ⏱️   | Timer    | Đóng băng tất cả enemy 10 giây       |
| ❤️   | Life     | +1 mạng                              |
| 🏰   | Fortress | Bọc thép base 20 giây                |
| 🔫   | Gun      | Nâng cấp tank lên level cao nhất     |

### 2.6 Audio System

**Sound effects cần có**:

| Sự kiện         | Âm thanh                    |
| --------------- | --------------------------- |
| Tank di chuyển  | Engine loop (idle + moving) |
| Bắn đạn         | Shot sound                  |
| Đạn trúng tường | Hit wall                    |
| Đạn trúng thép  | Hit steel (tiếng kim loại)  |
| Nổ tank         | Explosion                   |
| Nổ base         | Big explosion               |
| Nhặt power-up   | Power-up sound              |
| Game over       | Game over jingle            |
| Stage start     | Stage intro sound           |
| Menu            | Menu music                  |

### 2.7 HUD (Heads-Up Display)

Hiển thị bên phải màn hình (giống bản gốc):

```
┌─────────────────────────────┐
│                    │ 🔴🔴   │
│                    │ 🔴🔴   │
│                    │ 🔴🔴   │
│    GAME AREA       │ 🔴🔴   │  ← Số enemy còn lại
│    (26x26 grid)    │ 🔴🔴   │
│                    │        │
│                    │ 1P     │
│                    │ 🏴 x3  │  ← Số mạng P1
│                    │        │
│                    │ 2P     │
│                    │ 🏴 x3  │  ← Số mạng P2
│                    │        │
│                    │ 🏁 15  │  ← Stage number
└─────────────────────────────┘
```

---

## 3. Kế hoạch triển khai (Phases)

### Phase 1: Project Setup & Core (Ưu tiên cao nhất)

**Mục tiêu**: Chạy được game cơ bản

1. **Khởi tạo project**
   - Vite + React + TypeScript
   - Cài dependencies: `@react-three/fiber`, `@react-three/drei`, `zustand`, `howler`
   - Setup cấu trúc thư mục

2. **Render map cơ bản**
   - Tạo grid 26x26
   - Render các loại tile: brick, steel, water, tree, ice, base
   - OrthographicCamera nhìn top-down
   - Load dữ liệu map từ JSON

3. **Player tank cơ bản**
   - Render tank trên map
   - Di chuyển 4 hướng bằng keyboard
   - Snap-to-grid movement (di chuyển theo ô)
   - Collision với tường và biên map

4. **Hệ thống đạn cơ bản**
   - Bắn đạn theo hướng tank đang quay
   - Đạn bay thẳng
   - Đạn phá tường gạch
   - Đạn va chạm tường thép → biến mất

### Phase 2: Enemy & Combat

5. **Enemy tanks**
   - Spawn enemy từ 3 vị trí trên cùng
   - 4 loại enemy tank với stats khác nhau
   - Hiệu ứng spawn (nhấp nháy)

6. **Enemy AI**
   - Di chuyển random
   - Bắn random
   - Đổi hướng khi gặp vật cản
   - Smart AI cho một số loại

7. **Combat system**
   - Đạn player ↔ enemy tank
   - Đạn enemy ↔ player tank
   - Đạn ↔ đạn (triệt tiêu)
   - Hiệu ứng nổ khi tank bị tiêu diệt

8. **Base protection**
   - Đạn trúng base → Game Over
   - Animation base bị phá

### Phase 3: Power-ups & Progression

9. **Power-up system**
   - Đánh dấu enemy tank đặc biệt (viền đỏ nhấp nháy)
   - Spawn power-up khi tiêu diệt tank đặc biệt
   - Implement 7 loại power-up
   - Hiệu ứng nhặt power-up

10. **Player tank upgrade**
    - 4 cấp độ tank
    - Nâng cấp bằng Star power-up
    - Shield effect
    - Spawn protection (shield 3 giây khi mới xuất hiện)

11. **Level system**
    - 35 map khác nhau (dữ liệu từ game gốc)
    - Chuyển màn khi tiêu diệt hết enemy
    - Màn hình "STAGE X" giữa các màn
    - Bảng điểm cuối màn

### Phase 4: UI & Polish

12. **Main Menu**
    - Logo game
    - Chọn 1 PLAYER / 2 PLAYERS
    - Animation cursor chọn

13. **HUD**
    - Số enemy còn lại
    - Số mạng player
    - Stage number
    - Vị trí: bên phải game area

14. **Game Over & Score**
    - Màn hình Game Over
    - Bảng điểm chi tiết cuối mỗi màn
    - High score

15. **Pause menu**
    - Nhấn Esc/P để pause
    - Resume / Quit options

### Phase 5: 2 Player Mode

16. **Player 2**
    - Tank player 2 với control riêng
    - Đạn player không damage đồng đội (friendly fire OFF)
    - Spawn position riêng
    - Mạng và upgrade riêng biệt

### Phase 6: Audio & Effects

17. **Sound effects**
    - Tất cả sound effects trong bảng Audio System
    - Volume control
    - Mute option

18. **Visual effects**
    - Particle explosion
    - Screen shake khi nổ lớn
    - Shield bubble effect
    - Spawn animation (nhấp nháy)
    - Power-up nhấp nháy trước khi biến mất
    - Smoke/dust khi di chuyển

### Phase 7: Polish & Optimization

19. **Performance**
    - Object pooling cho đạn và hiệu ứng
    - Frustum culling
    - Optimize re-renders

20. **Gameplay tuning**
    - Cân bằng độ khó
    - Enemy spawn timing
    - AI difficulty scaling theo level
    - Smooth movement

21. **Extra features**
    - Stage editor (bonus)
    - Responsive design
    - Mobile touch controls (bonus)
    - Lưu progress (localStorage)

---

## 4. Dữ liệu Game Constants

```typescript
// constants.ts
export const GRID_SIZE = 26; // 26x26 grid
export const TILE_SIZE = 1; // Kích thước mỗi tile trong 3D space
export const TANK_SPEED = 0.05; // Tốc độ tank mặc định
export const BULLET_SPEED = 0.15; // Tốc độ đạn mặc định
export const MAX_ENEMIES_ON_MAP = 4; // Tối đa 4 enemy cùng lúc
export const TOTAL_ENEMIES = 20; // 20 enemy mỗi màn
export const PLAYER_LIVES = 3; // 3 mạng ban đầu
export const SHIELD_DURATION = 10000; // Shield 10 giây (ms)
export const FREEZE_DURATION = 10000; // Freeze 10 giây (ms)
export const FORTRESS_DURATION = 20000; // Fortress 20 giây (ms)
export const SPAWN_PROTECTION = 3000; // Shield khi spawn 3 giây (ms)
export const POWERUP_BLINK_TIME = 25000; // Power-up nhấp nháy sau 25 giây
export const POWERUP_DISAPPEAR_TIME = 30000; // Power-up biến mất sau 30 giây
```

---

## 5. Camera Setup

```
- Camera: OrthographicCamera
- Góc nhìn: Top-down (nhìn từ trên xuống)
- Position: (13, 30, 13) - trung tâm map, nhìn xuống
- Zoom: fit toàn bộ 26x26 grid vào viewport
- Rotation: (-Math.PI/2, 0, 0) - nhìn thẳng xuống
```

---

## 6. Rendering Strategy

- **Layer 0**: Nền map (sàn)
- **Layer 1**: Ice, Water
- **Layer 2**: Tường (Brick, Steel), Base
- **Layer 3**: Tank (Player + Enemy), Đạn, Power-up
- **Layer 4**: Tree (render trên cùng để che tank)
- **Layer 5**: Hiệu ứng (Explosion, Shield, Spawn)
- **UI Layer**: HTML overlay cho HUD, Menu (không dùng 3D)

---

## 7. Tổng kết

| Metric                    | Giá trị |
| ------------------------- | ------- |
| Tổng số phases            | 7       |
| Tổng số tasks             | 21      |
| Core gameplay (Phase 1-2) | 8 tasks |
| Số loại tile              | 7       |
| Số loại enemy             | 4       |
| Số loại power-up          | 7       |
| Số màn chơi               | 35      |
| Grid size                 | 26x26   |
