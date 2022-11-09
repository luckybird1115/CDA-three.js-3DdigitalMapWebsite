import shapesData from '@/data/smart-shapes.json'
import { Color } from 'three'

const shapes = shapesData['smart-shapes'][0].shapes
const defaultShapesOpacity = 0.25
const defaultShapeEdgesColor = 0xffffff
let defaultVisibility = false
const renderOrder = 20;

import {
  Group,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  TorusBufferGeometry,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  MeshBasicMaterial,
  DoubleSide,
} from 'three'

function addShapes(store) {
  store.commit('current/setShapesBase', shapes)

  const offset = {
    x: -322.77,
    y: -32.85,
    z: 295.05,
  }

  const colors = [
    0xFC62C4,
    0x0068BC,
    0xF47AFF,
    0xffb17a,
    0x4f4789,
    0x201335,
    0x006867,
    0x6320EE,
    0xCAD5CA,
    0x211A1D,
    0xE4C3AD,
    0x3BF4FB,
    0xCAFF8A,
    0x779BE7,
  ]
  const classesColors = {}

  const setColors = (el) => {
    let classColor
    if (el.metadata?.Class !== null) {
      classColor = classesColors[el.metadata.Class]
      if (!classColor && colors.length > 3) {
        classColor = colors.splice(0, 1)[0];
        classesColors[el.metadata.Class] = classColor
      }
    }
    if (!classColor) {
      classColor = colors[Math.floor(Math.random() * colors.length)]
    }
    // console.log(`${el.metadata.Name} = ${classColor.toString(16)}`);
    return classColor
  }

  const setStatusColors = (el) =>{
    switch(el){
      case 'Good':
        return 0x174e13
      case 'Caution':
        return 0xfff91c
      case 'Bad':
        return 0xff0000
    }
  }

  const setTransforms = (shape, primitive) => {
    shape.rotation.x = primitive.rotation.x
    shape.rotation.y = primitive.rotation.y
    shape.rotation.z = -primitive.rotation.z

    shape.position.x = primitive.position.x + offset.x
    shape.position.y = primitive.position.y + offset.y
    shape.position.z = -primitive.position.z + offset.z
  }

  const setMeta = (shape, el) => {
    shape.metadata = {
      name: el?.metadata?.Name ? el.metadata.Name : null,
      type: el?.metadata?.Type ? el.metadata.Type : null,
      system: el?.metadata?.System ? el.metadata.System : null,
      class: el?.metadata?.Class ? el.metadata.Class : null,
      pid: el?.metadata?.PID ? el.metadata.PID : null,
      desc: el?.metadata?.Desc ? el.metadata.Desc : null,
      assetPath: el?.metadata?.AssetPath ? el.metadata.AssetPath : null,
      status: el?.metadata?.Status ? el.metadata.Status : 'Good',
    }
  }

  const lineBasicMaterial = new LineBasicMaterial({
    color: defaultShapeEdgesColor,
    depthTest: false,
    transparent: 1,
    opacity: 0.5,
  })

  const shapeMaterial = (color, opacity) => {
    return new MeshBasicMaterial({
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      side: DoubleSide,
      depthTest: false,
      color: color,
      transparent: 1,
      opacity: opacity,
    })
  }

  store.state.current.shapesBase?.map((el) => {
    let shapePrimitives = []
    for (const primitive of el.primitives) {
      switch (primitive.type) {
        case 'Cylinder':
          const radius = primitive.size.diameter * 0.5
          const length = primitive.size['length']
          const cylinderGeometry = new CylinderGeometry(
            radius,
            radius,
            length,
            16,
            1
          )
          const cylinderMesh = new Mesh(
            cylinderGeometry,
            shapeMaterial(setColors(el), defaultShapesOpacity)
          )
          const cylinderEdges = new EdgesGeometry(cylinderGeometry)
          const cylinderWire = new LineSegments(
            cylinderEdges,
            lineBasicMaterial
          )

          cylinderMesh.add(cylinderWire)

          cylinderMesh.position.x = length * 0.5
          cylinderMesh.rotation.z = Math.PI / 2
          // cylinderMesh.renderOrder = renderOrder

          const cylinderShape = new Group()
          cylinderShape.add(cylinderMesh)

          setTransforms(cylinderShape, primitive)
          cylinderShape.renderOrder = renderOrder

          shapePrimitives.push(cylinderShape)

          break

        case 'Box':
          const dimensionsBox = {
            x: primitive.size.lengthX,
            y: primitive.size.lengthY,
            z: primitive.size.lengthZ,
          }

          const boxGeometry = new BoxGeometry(
            dimensionsBox.x,
            dimensionsBox.y,
            dimensionsBox.z,
            1,
            1,
            1
          )
          const boxMesh = new Mesh(
            boxGeometry,
            shapeMaterial(setColors(el), defaultShapesOpacity)
          )
          const boxEdges = new EdgesGeometry(boxGeometry)
          const boxWire = new LineSegments(boxEdges, lineBasicMaterial)

          boxMesh.add(boxWire)

          boxMesh.rotation.x = Math.PI / 2
          boxMesh.position.x = dimensionsBox.x * 0.5
          // boxMesh.renderOrder = renderOrder


          const boxShape = new Group()
          boxShape.add(boxMesh)

          setTransforms(boxShape, primitive)
          boxShape.renderOrder = renderOrder

          shapePrimitives.push(boxShape)

          break

        default:
          console.log('error')
      }
    }

    //Joining all primitives into single shape

    const shape = new Group()
    for (const primitive of shapePrimitives) {
      shape.add(primitive)
    }
    // shape.renderOrder = renderOrder
    shape.visible = defaultVisibility
    shape.name = el.metadata?.Name? el.metadata.Name: 'Name';
    shape.color = shapePrimitives[0].children[0].material.color
    shape.statusColor = el.metadata?.Status? new Color(setStatusColors(el.metadata.Status)) : new Color(0x174e13);
    setMeta(shape, el)

    //Adding shape to shapes store

    store.commit('three/smartShapes/addShape', shape)
  })

  //Adding all shapes to scene

  store.state.three.smartShapes.shapes.map((el) => {
    store.commit('three/scene/addToWorld', el)
  })
}

export { addShapes }
