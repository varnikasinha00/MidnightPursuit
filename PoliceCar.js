class PoliceCar extends Car {
  constructor(scene, player) {
    // Standard black and white police car
    super(scene, 0xffffff, true);
    this.name = 'PoliceCar';
    this.player = player;
    
    // Make chassis dual tone (doors white, rest black)
    // A simple approximation: change the main chassis color slightly or add panels.
    // For simplicity, we just use white and rely on the lightbar to identify it.
    
    this.maxSpeed = 130; // Slightly faster than player to catch up
    this.baseTurnSpeed = 12;
    this.state = 'CHASE'; // CHASE, RAM, RECOVER, SURROUND, LEAVE
    this.recoverTimer = 0;
    this.chaseTimer = 15;
  }

  update(dt) {
    if (this.state === 'SURROUND') {
      this.speed = this.player.speed;
      this.position.z -= this.speed * dt;
      
      const distX = this.player.position.x - this.position.x;
      const distZ = this.player.position.z - this.position.z;
      // Calculate target rotation to face player
      const targetRot = Math.atan2(distX, -distZ);
      // Smoothly rotate towards player
      let diff = targetRot - this.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotation.y += diff * 5 * dt;
      
      super.update(dt);
      return;
    }

    if (this.state === 'LEAVE') {
      // Fall behind by slowing down
      this.speed -= 30 * dt;
      if (this.speed < 0) this.speed = 0;
      this.position.z -= this.speed * dt;
      super.update(dt);
      return;
    }

    if (!this.player || this.player.health <= 0) {
      // If player is dead and we're not surrounding, just leave
      this.state = 'LEAVE';
      return;
    }

    const distZ = this.position.z - this.player.position.z;
    const distX = this.player.position.x - this.position.x;

    this.chaseTimer -= dt;
    if (this.chaseTimer <= 0 && this.state !== 'RAM') {
      this.state = 'LEAVE';
    }

    if (this.state === 'RECOVER') {
      this.recoverTimer -= dt;
      this.speed = this.player.speed * 0.8;
      if (this.recoverTimer <= 0) {
        this.state = 'CHASE';
      }
    } else if (this.state === 'CHASE') {
      // Catch up logic
      if (distZ > 80) {
        // Very far behind, speed up a lot
        this.speed = Math.min(this.maxSpeed + 30, this.player.speed + 50);
      } else if (distZ > 20) { 
        // Far behind, speed up
        this.speed = Math.min(this.maxSpeed, this.player.speed + 20);
      } else if (distZ < -20) {
        // Far ahead, slow down to let player catch up (roadblock style)
        this.speed = Math.max(20, this.player.speed - 30);
      } else {
        // Close enough, match speed and try to ram
        this.speed = this.player.speed + 5;
        this.state = 'RAM';
      }

      // Steer towards player's X
      if (Math.abs(distX) > 0.5) {
        const turnDir = Math.sign(distX);
        this.position.x += turnDir * this.baseTurnSpeed * dt;
        this.rotation.y = -turnDir * 0.1;
      } else {
        this.rotation.y = 0;
      }
    } else if (this.state === 'RAM') {
      // Aggressively steer into player
      this.speed = this.player.speed + 10;
      const turnDir = Math.sign(distX);
      this.position.x += turnDir * this.baseTurnSpeed * 1.5 * dt;
      this.rotation.y = -turnDir * 0.2;

      if (Math.abs(distZ) > 30) {
        this.state = 'CHASE';
      }
    }

    // Move forward
    this.position.z -= this.speed * dt;

    super.update(dt);
  }

  onHit() {
    this.state = 'RECOVER';
    this.recoverTimer = 2.0;
    // Get pushed away slightly
    this.position.x += (Math.random() > 0.5 ? 2 : -2);
  }
}