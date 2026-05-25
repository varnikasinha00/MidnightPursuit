class RoadChunk extends GameObject3D {
  constructor(scene, zOffset) {
    super(scene);
    this.name = 'RoadChunk';
    this.position.z = zOffset;
    this.chunkLength = 200;
    this.createMesh();
  }

  createMesh() {
    this.mesh = new THREE.Group();

    // Asphalt
    const roadGeo = new THREE.PlaneGeometry(30, this.chunkLength);
    const roadMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      roughness: 0.9, 
      metalness: 0.1 
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    this.mesh.add(road);

    // Lane markings
    const markGeo = new THREE.PlaneGeometry(0.3, 4);
    const markMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    
    for (let z = -this.chunkLength/2; z < this.chunkLength/2; z += 10) {
      // Left dashed line
      const m1 = new THREE.Mesh(markGeo, markMat);
      m1.rotation.x = -Math.PI / 2;
      m1.position.set(-4.5, 0.05, z);
      this.mesh.add(m1);

      // Right dashed line
      const m2 = new THREE.Mesh(markGeo, markMat);
      m2.rotation.x = -Math.PI / 2;
      m2.position.set(4.5, 0.05, z);
      this.mesh.add(m2);
    }

    // Sidewalks / Shoulders
    const shoulderGeo = new THREE.PlaneGeometry(10, this.chunkLength);
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    
    const s1 = new THREE.Mesh(shoulderGeo, shoulderMat);
    s1.rotation.x = -Math.PI / 2;
    s1.position.set(-20, 0.02, 0);
    this.mesh.add(s1);

    const s2 = new THREE.Mesh(shoulderGeo, shoulderMat);
    s2.rotation.x = -Math.PI / 2;
    s2.position.set(20, 0.02, 0);
    this.mesh.add(s2);

    // Streetlights
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lampGeo = new THREE.BoxGeometry(1.5, 0.2, 0.5);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffddaa });

    for (let z = -this.chunkLength/2 + 20; z < this.chunkLength/2; z += 50) {
      // Left side
      const p1 = new THREE.Mesh(poleGeo, poleMat);
      p1.position.set(-16, 4, z);
      const l1 = new THREE.Mesh(lampGeo, lampMat);
      l1.position.set(-15, 8, z);
      const light1 = new THREE.PointLight(0xffddaa, 1.5, 40);
      light1.position.set(-14, 7.5, z);
      this.mesh.add(p1, l1, light1);

      // Right side
      const p2 = new THREE.Mesh(poleGeo, poleMat);
      p2.position.set(16, 4, z + 25); // staggered
      const l2 = new THREE.Mesh(lampGeo, lampMat);
      l2.position.set(15, 8, z + 25);
      const light2 = new THREE.PointLight(0xffddaa, 1.5, 40);
      light2.position.set(14, 7.5, z + 25);
      this.mesh.add(p2, l2, light2);
    }

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }
}