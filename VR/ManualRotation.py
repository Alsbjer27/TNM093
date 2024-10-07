# Copyright 2005-2009, Karljohan Lundin Palmerius
#

"""This file provides extra functionality to the Candy package.

This Python-script provides an intuitive navigation scheme where the
haptic instrument is used to rotate a selected transform. Use this
script together with other scripts for moving and zooming the
transform, for example.

The following must be provided through the "references" field:
*) the transform node on which to operate.

The following must be routed:
1) To the "button" field, the button to activate rotation
2) To the "position" field, the position to use as rotation centre
3) To the "orientation" field, the (haptic pen) orientation to use
for rotating


<COPYRIGHT NOTICE>

"""

from H3D import *
from H3DInterface import *


T, = references.getValue()

button = SFBool()
position = SFVec3f()
orientation = SFRotation()

class TransformRotation(TypedField( SFBool,
                                ( SFBool,        # Activate (button)
                                  SFVec3f,       # Tracker position
                                  SFRotation ))):# Tracker orientation
  
  def update(self, event):
    try:
      inputs = self.getRoutesIn()
      button = inputs[0].getValue()
      position = inputs[1].getValue()
      orientation = inputs[2].getValue()
    except:
      return False
    
    if button:
      Tr = T.matrix.getValue()
      
      Tr = Matrix4f(1,0,0,-position.x,
                    0,1,0,-position.y,
                    0,0,1,-position.z,
                    0,0,0,1) * Tr
      
      rot = Matrix4f(Quaternion(orientation) *
                     Quaternion(self.last_orientation).conjugate())
      Tr = rot * Tr
      
      Tr = Matrix4f(1,0,0,+position.x,
                    0,1,0,+position.y,
                    0,0,1,+position.z,
                    0,0,0,1) * Tr
      
      T.matrix.setValue(Tr)
    
    self.last_orientation = orientation
      
    return True

transformRotation = TransformRotation()
button.routeNoEvent(transformRotation)
position.routeNoEvent(transformRotation)
orientation.routeNoEvent(transformRotation)
transformRotation.routeNoEvent(eventSink)

