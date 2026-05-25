class Car extends GameObject3D {
  constructor(scene, color, isPolice = false) {
    super(scene);
    this.name = 'Car';
    this.color = color;
    this.isPolice = isPolice;
    this.speed = 0;
    this.maxSpeed = 100;
    this.acceleration = 20;
    this.turnSpeed = 15;
    
    this.chassisWidth = 2.2;
    this.chassisLength = 4.8;
    this.chassisHeight = 0.6;
    
    this.createMesh();
  }

  createMesh() {
    this.mesh = new THREE.Group();
    
    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: this.color, 
      roughness: 0.2, 
      metalness: 0.7 
    });
    const darkMat = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      roughness: 0.8 
    });
    const glassMat = new THREE.MeshStandardMaterial({ 
      color: 0x050505, 
      roughness: 0.1, 
      metalness: 0.9 
    });

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(this.chassisWidth, this.chassisHeight, this.chassisLength);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.5;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.mesh.add(chassis);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(this.chassisWidth * 0.85, 0.5, this.chassisLength * 0.5);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.y = 1.05;
    cabin.position.z = -0.2;
    cabin.castShadow = true;
    this.mesh.add(cabin);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    
    const wheelPositions = [
      { x: -1.1, z: 1.5 }, // Front Left
      { x: 1.1, z: 1.5 },  // Front Right
      { x: -1.1, z: -1.5 },// Rear Left
      { x: 1.1, z: -1.5 }  // Rear Right
    ];

    this.wheels = [];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, darkMat);
      wheel.position.set(pos.x, 0.4, pos.z);
      wheel.castShadow = true;
      this.mesh.add(wheel);
      this.wheels.push(wheel);
    });

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlLeft = new THREE.Mesh(hlGeo, hlMat);
    hlLeft.position.set(-0.7, 0.6, -this.chassisLength/2 - 0.05);
    const hlRight = new THREE.Mesh(hlGeo, hlMat);
    hlRight.position.set(0.7, 0.6, -this.chassisLength/2 - 0.05);
    this.mesh.add(hlLeft, hlRight);

    // Headlight Spotlights
    const spotLightL = new THREE.SpotLight(0xffffff, 2, 50, Math.PI/6, 0.5, 1);
    spotLightL.position.copy(hlLeft.position);
    spotLightL.target.position.set(-0.7, 0.6, -20);
    this.mesh.add(spotLightL);
    this.mesh.add(spotLightL.target);

    const spotLightR = new THREE.SpotLight(0xffffff, 2, 50, Math.PI/6, 0.5, 1);
    spotLightR.position.copy(hlRight.position);
    spotLightR.target.position.set(0.7, 0.6, -20);
    this.mesh.add(spotLightR);
    this.mesh.add(spotLightR.target);

    // Taillights
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const tlLeft = new THREE.Mesh(hlGeo, tlMat);
    tlLeft.position.set(-0.7, 0.6, this.chassisLength/2 + 0.05);
    const tlRight = new THREE.Mesh(hlGeo, tlMat);
    tlRight.position.set(0.7, 0.6, this.chassisLength/2 + 0.05);
    this.mesh.add(tlLeft, tlRight);

    // Police Lightbar
    if (this.isPolice) {
      const barGeo = new THREE.BoxGeometry(1.2, 0.15, 0.4);
      const barMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 1.35, -0.2);
      this.mesh.add(bar);

      // Red/Blue lights
      this.sirenRed = new THREE.PointLight(0xff0000, 0, 15);
      this.sirenRed.position.set(-0.5, 1.5, -0.2);
      this.mesh.add(this.sirenRed);

      this.sirenBlue = new THREE.PointLight(0x0000ff, 0, 15);
      this.sirenBlue.position.set(0.5, 1.5, -0.2);
      this.mesh.add(this.sirenBlue);
      
      this.sirenTimer = 0;
    }

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  update(dt) {
    // Spin wheels based on speed
    const wheelRot = (this.speed * dt) / 0.4;
    this.wheels.forEach(w => w.rotation.x -= wheelRot);

    // Police sirens
    if (this.isPolice) {
      this.sirenTimer += dt * 10;
      if (Math.sin(this.sirenTimer) > 0) {
        this.sirenRed.intensity = 5;
        this.sirenBlue.intensity = 0;
      } else {
        this.sirenRed.intensity = 0;
        this.sirenBlue.intensity = 5;
      }
    }

    super.update(dt);
  }
}