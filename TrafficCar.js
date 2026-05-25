class TrafficCar extends Car {
  constructor(scene) {
    // Random civilian colors
    const colors = [0x882222, 0x224488, 0x228822, 0xaaaaaa, 0xdddd33];
    const color = colors[Math.floor(Math.random() * colors.length)];
    super(scene, color, false);
    this.name = 'TrafficCar';
    
    // Traffic drives at a steady, slower pace
    this.speed = 30 + Math.random() * 20;
    this.lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    this.laneWidth = 4.5;
    this.position.x = this.lane * this.laneWidth;
  }

  update(dt) {
    // Just drive straight
    this.position.z -= this.speed * dt;
    super.update(dt);
  }
}