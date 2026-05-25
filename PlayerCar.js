class PlayerCar extends Car {
  constructor(scene) {
    // Sleek metallic black/dark grey for the player's luxury car
    super(scene, 0x1a1a1a, false);
    this.name = 'PlayerCar';
    
    this.maxSpeed = 120;
    this.speed = 40; // Starting speed
    this.health = 100;
    this.invulnerableTimer = 0;
    this.roadWidth = 14; // +/- 7 from center
    this.driftMomentum = 0;
    this.isDrifting = false;
    
    // Add a spoiler to make it look like a sports car
    const spoilerGeo = new THREE.BoxGeometry(2.0, 0.1, 0.5);
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(0, 0.9, 2.0);
    
    const strutGeo = new THREE.BoxGeometry(0.1, 0.3, 0.3);
    const strutL = new THREE.Mesh(strutGeo, spoilerMat);
    strutL.position.set(-0.6, 0.7, 2.0);
    const strutR = new THREE.Mesh(strutGeo, spoilerMat);
    strutR.position.set(0.6, 0.7, 2.0);
    
    this.mesh.add(spoiler, strutL, strutR);
  }

  update(dt, keys) {
    if (this.health <= 0) {
      this.speed -= 40 * dt;
      if (this.speed < 0) this.speed = 0;
    } else {
      // Input handling
      if (keys['KeyW'] || keys['ArrowUp']) {
        this.speed += this.acceleration * dt;
      } else if (keys['KeyS'] || keys['ArrowDown']) {
        this.speed -= this.acceleration * 2 * dt;
      } else {
        // Auto-maintain a base speed
        if (this.speed < 60) this.speed += this.acceleration * 0.5 * dt;
        else this.speed -= this.acceleration * 0.2 * dt;
      }

      this.speed = Math.max(10, Math.min(this.speed, this.maxSpeed));

      let turnAmount = 0;
      if (keys['KeyA'] || keys['ArrowLeft']) {
        turnAmount = 1;
      }
      if (keys['KeyD'] || keys['ArrowRight']) {
        turnAmount = -1;
      }

      // Drift mechanics
      if (keys['Space'] && turnAmount !== 0 && this.speed > 50) {
        this.isDrifting = true;
      } else if (turnAmount === 0 || this.speed <= 50) {
        this.isDrifting = false;
      }

      const targetDrift = this.isDrifting ? turnAmount * 15 : 0;
      this.driftMomentum += (targetDrift - this.driftMomentum) * 5 * dt;

      // Apply turn and drift
      const currentTurnSpeed = this.isDrifting ? this.turnSpeed * 1.2 : this.turnSpeed;
      this.position.x += (turnAmount * currentTurnSpeed + this.driftMomentum) * dt;
      
      // Visual tilt and extreme yaw when drifting
      const targetRotZ = turnAmount * 0.1;
      const targetRotY = this.isDrifting ? turnAmount * 0.6 : turnAmount * 0.15;
      this.rotation.z += (targetRotZ - this.rotation.z) * 10 * dt;
      this.rotation.y += (targetRotY - this.rotation.y) * 10 * dt;

      // Clamp to road
      if (this.position.x > this.roadWidth/2) this.position.x = this.roadWidth/2;
      if (this.position.x < -this.roadWidth/2) this.position.x = -this.roadWidth/2;
    }

    // Move forward (negative Z is forward in our setup)
    this.position.z -= this.speed * dt;

    // Invulnerability flashing
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.mesh.visible = Math.floor(this.invulnerableTimer * 20) % 2 === 0;
    } else {
      this.mesh.visible = true;
    }

    super.update(dt);
  }

  takeDamage(amount) {
    if (this.invulnerableTimer > 0) return false;
    this.health -= amount;
    if (this.health < 0) this.health = 0;
    this.invulnerableTimer = 1.0; // 1 second of invulnerability
    this.speed *= 0.5; // Slow down on hit
    return true;
  }
}