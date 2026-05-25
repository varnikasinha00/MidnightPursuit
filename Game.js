class Game {
  constructor() {
    window.game = this;
    this.entities = [];
    this.keys = {};
    this.isRunning = false;
    this.lastTime = performance.now();
    
    this.score = 0;
    this.wantedLevel = 1;
    this.distanceTraveled = 0;
    
    this.initThree();
    this.initUI();
    this.initInput();
    this.resetGame();
   // this.initAudio();
    
  }
  
  // initAudio() {
    // this.backgroundMusic = document.getElementById('crash.mp3');
     //this.backgroundMusic.volume = 0.3;
   //}

  initThree() {
    this.playfield = document.getElementById('playfield');
    
    this.scene = new THREE.Scene();
    // Dark, foggy night
    this.scene.background = new THREE.Color(0x050505);
    this.scene.fog = new THREE.Fog(0x050505, 30, 150);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.playfield.appendChild(this.renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0x444455, 1.0);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaccff, 0.8);
    dirLight.position.set(20, 50, -20);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.bias = -0.002;
    this.scene.add(dirLight);

    // Resize handler
    const fit = () => {
      const r = this.playfield.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      this.renderer.setSize(r.width, r.height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.camera.aspect = r.width / r.height;
      this.camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', fit);
    fit();
  }

  initUI() {
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.speedometer = document.getElementById('speedometer');
    this.healthBar = document.getElementById('health-bar');
    this.scoreDisplay = document.getElementById('score');
    this.wantedDisplay = document.getElementById('wanted-level');
    this.finalScore = document.getElementById('final-score');

    document.getElementById('start-btn').addEventListener('click', () => {
      document.getElementById('crashSound').play().catch(() => {});
      this.startScreen.style.display = 'none';
      this.isRunning = true;
      this.start();
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      this.gameOverScreen.style.display = 'none';
      this.resetGame();
      this.isRunning = true;
    });
  }

  initInput() {
    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
  }

  resetGame() {
    // Clear entities
    [...this.entities].forEach(e => e.destroy());
    this.entities = [];

    this.score = 0;
    this.wantedLevel = 1;
    this.distanceTraveled = 0;
    
    // Spawn Player
    this.player = new PlayerCar(this.scene);
    this.player.position.set(0, 0, 0);
    this.entities.push(this.player);

    // Setup initial road chunks
    this.chunkLength = 200;
    this.lastChunkZ = 100;
    for (let i = 0; i < 4; i++) {
      this.spawnRoadChunk();
    }

    // Reset camera
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(this.player.position);

    this.nextTrafficSpawn = -100;
    this.bustedSequenceTriggered = false;
    
    this.updateHUD();
  }

  triggerBustedSequence() {
    // Convert existing police cars to SURROUND or remove them if too far
    for (const entity of this.entities) {
      if (entity instanceof PoliceCar) {
        if (Math.abs(entity.position.z - this.player.position.z) > 100) {
          entity.markedForDestruction = true;
        } else {
          entity.state = 'SURROUND';
        }
      }
    }

    // Spawn surrounding police cars
    const positions = [
      {x: 6, z: -8},
      {x: -6, z: -8},
      {x: 0, z: 12},
      {x: 7, z: 4},
      {x: -7, z: 4}
    ];
    
    positions.forEach(pos => {
      const p = new PoliceCar(this.scene, this.player);
      p.position.set(this.player.position.x + pos.x, 0, this.player.position.z + pos.z);
      p.speed = this.player.speed;
      p.state = 'SURROUND';
      p.rotation.y = Math.atan2(-pos.x, pos.z);
      this.entities.push(p);
    });
  }

  spawnRoadChunk() {
    const chunk = new RoadChunk(this.scene, this.lastChunkZ - this.chunkLength);
    this.entities.push(chunk);
    this.lastChunkZ -= this.chunkLength;
  }

  spawnTraffic() {
    const traffic = new TrafficCar(this.scene);
    traffic.position.z = this.player.position.z - 200 - Math.random() * 100;
    this.entities.push(traffic);
  }

  spawnPolice() {
    const police = new PoliceCar(this.scene, this.player);
    // Spawn further behind player so warning has time to show
    police.position.set(0, 0, this.player.position.z + 150);
    police.speed = this.player.speed + 40; // Catch up faster initially
    this.entities.push(police);
  }

  updateHUD() {
    if (!this.player) return;
    this.speedometer.innerText = `${Math.floor(this.player.speed)} MPH`;
    this.healthBar.style.width = `${this.player.health}%`;
    this.scoreDisplay.innerText = `CASH: $${Math.floor(this.score)}`;
    
    let stars = '';
    for(let i=0; i<5; i++) stars += i < this.wantedLevel ? '★' : '☆';
    this.wantedDisplay.innerText = `WANTED: ${stars}`;

    const warningEl = document.getElementById('warning-message');
    if (warningEl) {
      let policeClose = false;
      for (const entity of this.entities) {
        if (entity instanceof PoliceCar) {
          const dist = entity.position.z - this.player.position.z;
          if (dist > 20 && dist < 180) {
            policeClose = true;
            break;
          }
        }
      }
      warningEl.style.display = policeClose ? 'block' : 'none';
    }
  }

  checkCollisions() {
    if (this.player.health <= 0) return;

    const pBox = this.player.getBounds();
    if (!pBox) return;

    // Shrink player box slightly to be forgiving
    pBox.expandByScalar(-0.2);

    for (const entity of this.entities) {
      if (entity === this.player || entity.markedForDestruction) continue;

      if (entity instanceof Car) {
        const eBox = entity.getBounds();
        if (eBox && pBox.intersectsBox(eBox)) {
          // Collision!
          const tookDamage = this.player.takeDamage(20);
          if (tookDamage) {
            // Play crash sound and trigger camera shake
            //document.getElementById('crashSound').currentTime = 0;
            
            // Camera shake effect via simple offset to be applied in render
            this.cameraShake = 0.5;
            
            if (entity instanceof PoliceCar) {
              entity.onHit();
            } else {
              // Push traffic away
              entity.position.x += (entity.position.x > this.player.position.x ? 2 : -2);
              // Spawn a police car when hitting traffic
              this.spawnPolice();
            }
          }
        }
      }
    }
  }

  update() {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Update player specifically with keys
    this.player.update(dt, this.keys);

    // Update other entities
    for (const entity of this.entities) {
      if (entity !== this.player) {
        entity.update(dt);
      }
    }

    this.checkCollisions();

    // Busted sequence trigger
    if (this.player.health <= 0 && !this.bustedSequenceTriggered) {
      this.bustedSequenceTriggered = true;
      this.triggerBustedSequence();
    }

    // Game Over check
    if (this.player.health <= 0 && this.player.speed <= 1) {
      this.isRunning = false;
      this.finalScore.innerText = `FINAL CASH: $${Math.floor(this.score)}`;
      this.gameOverScreen.style.display = 'flex';
    }

    // Score & Wanted Level progression
    if (this.player.health > 0) {
      const dist = this.player.speed * dt;
      this.distanceTraveled += dist;
      this.score += dist * 10;
      
      if (this.score > 10000 && this.wantedLevel < 2) this.wantedLevel = 2;
      if (this.score > 25000 && this.wantedLevel < 3) this.wantedLevel = 3;
      if (this.score > 50000 && this.wantedLevel < 4) this.wantedLevel = 4;
      if (this.score > 100000 && this.wantedLevel < 5) this.wantedLevel = 5;
    }

    // World Management (Infinite Runner logic)
    // Spawn chunks ahead
    if (this.player.position.z < this.lastChunkZ + this.chunkLength * 2) {
      this.spawnRoadChunk();
    }

    // Spawn Traffic
    if (this.player.position.z < this.nextTrafficSpawn) {
      this.spawnTraffic();
      // Spawn more frequently at higher wanted levels
      const delay = 100 + Math.random() * 200 - (this.wantedLevel * 20);
      this.nextTrafficSpawn = this.player.position.z - Math.max(50, delay);
    }

    // Cleanup entities behind player
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      if (e.position.z > this.player.position.z + 100 || e.markedForDestruction) {
        e.destroy();
        this.entities.splice(i, 1);
      }
    }

    this.updateHUD();
  }

  render() {
    // Camera follows player
    if (this.player && this.camera) {
      const targetX = this.player.position.x * 0.5; // Look slightly towards player X
      const targetZ = this.player.position.z + 8;
      const targetY = 4;

      // Smooth camera follow
      this.camera.position.x += (targetX - this.camera.position.x) * 0.1;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.1;
      this.camera.position.z = targetZ;
      
      const lookAtPos = this.player.position.clone();
      lookAtPos.z -= 10;
      this.camera.lookAt(lookAtPos);

      // Apply shake
      if (this.cameraShake > 0) {
        this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
        this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
        this.cameraShake -= 0.05;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  start() {
    const gameLoop = () => {
      requestAnimationFrame(gameLoop);
      this.update();
      this.render();
    };
    gameLoop();
  }
}