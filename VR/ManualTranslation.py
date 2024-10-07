# Copyright 2005-2009, Karljohan Lundin Palmerius
#

"""This file provides extra functionality to the Candy package.

This Python-script provides an intuitive navigation scheme where the
haptic instrument is used to translate a selected transform. Use this
script together with other scripts for zooming and rotating the
transform, for example.

The following must be provided through the "references" field:
*) the transform node on which to operate.

The following must be routed:
1) To the "button" field, the button to activate translation
2) To the "position" field, the position to use to translation


<COPYRIGHT NOTICE>

"""

from H3D import *
from H3DInterface import *


T, = references.getValue()

button = SFBool()
position = SFVec3f()

class TransformTranslation(TypedField( SFBool,
                                       ( SFBool,     # Activate (button)
                                         SFVec3f ))):# Tracker position
  
  def update(self, event):
    try:
      inputs = self.getRoutesIn()
      button = inputs[0].getValue()
      position = inputs[1].getValue()
    except:
      return False
    
    if button:
      Tr = T.matrix.getValue()
      
      dx = position - self.last_position
      Tr = Matrix4f(1,0,0,dx.x,
                    0,1,0,dx.y,
                    0,0,1,dx.z,
                    0,0,0,1) * Tr
      
      T.matrix.setValue(Tr)
    
    self.last_position = position
      
    return True

transformTranslation = TransformTranslation()
button.routeNoEvent(transformTranslation)
position.routeNoEvent(transformTranslation)
transformTranslation.routeNoEvent(eventSink)

